"use client";

import { useState, useEffect } from "react";
import { shardeumSphinx, VERDICT_CONTRACT_ADDRESS } from "@/lib/chains";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { usePipelineContext } from "@/store/PipelineContext";
import { computeEvidenceRoot } from "@/lib/evidenceUtils";
import { EvidenceData } from "@/types/pipeline";

// Conditionally import wagmi only in MetaMask mode
const walletMode = process.env.NEXT_PUBLIC_WALLET_MODE || "relayer";
const useMetaMask = walletMode === "metamask";

// Dynamic imports for wagmi (only if MetaMask mode)
let useAccount: any, useConnect: any, useSwitchChain: any, useWriteContract: any, useWaitForTransactionReceipt: any, useReadContract: any, Address: any;
if (useMetaMask) {
  const wagmi = require("wagmi");
  const viem = require("viem");
  useAccount = wagmi.useAccount;
  useConnect = wagmi.useConnect;
  useSwitchChain = wagmi.useSwitchChain;
  useWriteContract = wagmi.useWriteContract;
  useWaitForTransactionReceipt = wagmi.useWaitForTransactionReceipt;
  useReadContract = wagmi.useReadContract;
  Address = viem.Address;
}

// VerdictSettlement ABI
const VERDICT_ABI = [
  {
    inputs: [
      { name: "_caseHash", type: "bytes32" },
      { name: "_outcomeCode", type: "uint8" },
      { name: "_confidenceBps", type: "uint16" },
      { name: "_evidenceRoot", type: "bytes32" },
    ],
    name: "recordReceipt",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_caseHash", type: "bytes32" }],
    name: "getReceipt",
    outputs: [
      { name: "caseHash", type: "bytes32" },
      { name: "outcomeCode", type: "uint8" },
      { name: "confidenceBps", type: "uint16" },
      { name: "evidenceRoot", type: "bytes32" },
      { name: "timestamp", type: "uint256" },
      { name: "submitter", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default function WalletSettlement() {
  const { getStepData, demoMode, completeStep } = usePipelineContext();
  
  // Wagmi hooks (only in MetaMask mode)
  const wagmiAccount = useMetaMask ? useAccount() : { address: undefined, isConnected: false, chainId: undefined };
  const wagmiConnect = useMetaMask ? useConnect() : { connect: () => {}, connectors: [] };
  const wagmiSwitchChain = useMetaMask ? useSwitchChain() : { switchChain: () => {} };
  const wagmiWriteContract = useMetaMask ? useWriteContract() : { writeContract: () => {}, data: null, isPending: false, error: null };
  const wagmiWaitReceipt = useMetaMask ? useWaitForTransactionReceipt({ hash: wagmiWriteContract.data }) : { isLoading: false, isSuccess: false };
  const wagmiReadContract = useMetaMask ? useReadContract({
    address: VERDICT_CONTRACT_ADDRESS ? (VERDICT_CONTRACT_ADDRESS as any) : undefined,
    abi: VERDICT_ABI,
    functionName: "getReceipt",
    args: undefined,
    query: { enabled: false },
  }) : { data: null, refetch: async () => ({ data: null }) };

  const { address, isConnected, chainId } = wagmiAccount;
  const { connect, connectors } = wagmiConnect;
  const { switchChain } = wagmiSwitchChain;
  const { writeContract, data: hash, isPending, error } = wagmiWriteContract;
  const { isLoading: isConfirming, isSuccess: isConfirmed } = wagmiWaitReceipt;
  const { data: onChainReceipt, refetch: refetchReceipt } = wagmiReadContract;

  const pslangData = getStepData("pslang");
  const verdictDataFromContext = getStepData("deliberation");
  const evidenceData = getStepData<EvidenceData>("evidence");
  const [txHash, setTxHash] = useState<string | null>(verdictDataFromContext?.txHash || null);
  const [evidenceRoot, setEvidenceRoot] = useState<`0x${string}` | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [verifiedReceipt, setVerifiedReceipt] = useState<any>(null);
  const [relayerAddress, setRelayerAddress] = useState<string | null>(null);
  
  // Read contract hook for verification (disabled by default, enabled via refetch)
  const caseHash = pslangData ? (`0x${pslangData.hash.replace("0x", "")}` as `0x${string}`) : undefined;
  
  // Compute evidence root when evidence is available
  useEffect(() => {
    if (evidenceData?.files && evidenceData.files.length > 0) {
      computeEvidenceRoot(evidenceData.files).then(root => {
        setEvidenceRoot(root);
      });
    } else {
      setEvidenceRoot(null);
    }
  }, [evidenceData]);

  // Update tx hash when transaction is confirmed and persist to deliberation
  useEffect(() => {
    if (useMetaMask && isConfirmed && hash && verdictDataFromContext) {
      setTxHash(hash);
      completeStep("deliberation", {
        ...verdictDataFromContext,
        txHash: hash,
      });
    }
  }, [isConfirmed, hash, verdictDataFromContext, completeStep]);

  // Convert verdict to uint8 (outcomeCode)
  const getOutcomeCode = (): number => {
    if (!verdictDataFromContext) return 0;
    const verdict = verdictDataFromContext.verdict;
    if (verdict === "APPROVE" || verdict === "not_guilty") return 2;
    if (verdict === "REJECT" || verdict === "guilty") return 0;
    return 1; // PARTIAL
  };

  // Get confidence in basis points (0-10000)
  const getConfidenceBps = (): number => {
    if (!verdictDataFromContext?.confidence) return 5000;
    // Confidence is already 0-100, convert to basis points (0-10000)
    return Math.round(verdictDataFromContext.confidence * 100);
  };

  // Relayer mode: record via API
  const handleRecordRelayer = async () => {
    if (!pslangData || !verdictDataFromContext || !VERDICT_CONTRACT_ADDRESS) {
      console.error("Missing data or contract address");
      return;
    }

    setIsRecording(true);
    try {
      const caseHash = `0x${pslangData.hash.replace("0x", "")}` as `0x${string}`;
      const outcomeCode = getOutcomeCode();
      const confidenceBps = getConfidenceBps();
      const evRoot = (evidenceRoot || "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`;

      const response = await fetch("/api/chain/record-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseHash,
          outcomeCode,
          confidenceBps,
          evidenceRoot: evRoot,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to record receipt");
      }

      const { txHash: newTxHash } = await response.json();
      setTxHash(newTxHash);
      
      // Get relayer address from response or derive it
      if (response.headers.get("x-relayer-address")) {
        setRelayerAddress(response.headers.get("x-relayer-address"));
      }

      // Update deliberation step data with tx hash
      completeStep("deliberation", {
        ...verdictDataFromContext,
        txHash: newTxHash,
      });
    } catch (err) {
      console.error("Relayer settlement error:", err);
      alert(err instanceof Error ? err.message : "Failed to record receipt");
    } finally {
      setIsRecording(false);
    }
  };

  // MetaMask mode: record via wallet
  const handleSettleMetaMask = async () => {
    if (!pslangData || !verdictDataFromContext || !VERDICT_CONTRACT_ADDRESS) {
      console.error("Missing data or contract address");
      return;
    }

    try {
      const caseHash = `0x${pslangData.hash.replace("0x", "")}` as `0x${string}`;
      const outcomeCode = getOutcomeCode();
      const confidenceBps = getConfidenceBps();
      const evRoot = (evidenceRoot || "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`;

      writeContract({
        address: VERDICT_CONTRACT_ADDRESS as any,
        abi: VERDICT_ABI,
        functionName: "recordReceipt",
        args: [caseHash, outcomeCode, confidenceBps, evRoot],
      });
    } catch (err) {
      console.error("Settlement error:", err);
    }
  };

  const handleConnect = () => {
    if (!useMetaMask) return;
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const handleSwitchNetwork = () => {
    if (!useMetaMask) return;
    switchChain({ chainId: shardeumSphinx.id });
  };

  const handleVerifyReceipt = async () => {
    if (!pslangData || !VERDICT_CONTRACT_ADDRESS) return;
    
    setIsVerifying(true);
    try {
      if (useMetaMask && isConnected) {
        // Use wagmi read contract
        const result = await refetchReceipt();
        if (result.data) {
          setVerifiedReceipt(result.data);
        }
      } else {
        // Use API read
        const response = await fetch(`/api/chain/read-receipt?caseHash=${caseHash}`);
        if (response.ok) {
          const { receipt } = await response.json();
          setVerifiedReceipt(receipt);
        } else {
          throw new Error("Failed to read receipt");
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerifiedReceipt(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // Update verified receipt when read contract data changes
  useEffect(() => {
    if (useMetaMask && onChainReceipt) {
      setVerifiedReceipt(onChainReceipt);
    }
  }, [onChainReceipt]);

  // Disable if no verdict exists
  if (!verdictDataFromContext) {
    return (
      <div style={{
        padding: "20px",
        background: "var(--bg-dim)",
        border: "1px solid var(--border-dim)",
        borderRadius: "2px",
        marginBottom: "20px",
        fontSize: "14px",
        color: "var(--text-dim)",
        textAlign: "center",
      }}>
        Waiting for verdict...
      </div>
    );
  }

  // Demo mode fallback
  if (demoMode || !VERDICT_CONTRACT_ADDRESS) {
    return (
      <div style={{
        padding: "20px",
        background: "var(--bg-dim)",
        border: "1px solid var(--border-dim)",
        borderRadius: "2px",
        marginBottom: "20px",
      }}>
        <div style={{
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "12px",
        }}>
          Record outcome
        </div>
        <div style={{
          fontSize: "12px",
          color: "var(--text-dim)",
          marginBottom: "12px",
        }}>
          Demo mode: Simulated recording
        </div>
        <Badge variant="warning">Demo</Badge>
      </div>
    );
  }

  // MetaMask mode: show wallet connection flow
  if (useMetaMask) {
    if (!isConnected) {
      return (
        <div style={{
          padding: "20px",
          background: "var(--bg-dim)",
          border: "1px solid var(--border-dim)",
          borderRadius: "2px",
          marginBottom: "20px",
        }}>
          <div style={{
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "12px",
          }}>
            Record outcome
          </div>
          <div style={{
            fontSize: "12px",
            color: "var(--text-dim)",
            marginBottom: "12px",
          }}>
            Connect wallet to create a public receipt
          </div>
          <Button onClick={handleConnect} size="sm">
            Connect wallet
          </Button>
        </div>
      );
    }

    if (chainId !== shardeumSphinx.id) {
      return (
        <div style={{
          padding: "20px",
          background: "var(--bg-dim)",
          border: "1px solid var(--border-dim)",
          borderRadius: "2px",
          marginBottom: "20px",
        }}>
          <div style={{
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "12px",
          }}>
            Wrong Network
          </div>
          <div style={{
            fontSize: "12px",
            color: "var(--text-dim)",
            marginBottom: "12px",
          }}>
            Please switch to the correct network
          </div>
          <Button onClick={handleSwitchNetwork} size="sm">
            Switch Network
          </Button>
        </div>
      );
    }

    if (isConfirmed && txHash) {
      return (
        <div style={{
          padding: "20px",
          background: "var(--bg-dim)",
          border: "1px solid var(--neon-accent)",
          borderRadius: "2px",
          marginBottom: "20px",
        }}>
          <div style={{
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "12px",
            color: "var(--neon-accent)",
          }}>
            ✓ Outcome recorded
          </div>
          <div style={{
            fontSize: "11px",
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
            marginBottom: "12px",
            wordBreak: "break-all",
          }}>
            Tx Hash: {txHash}
          </div>
          <div style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginBottom: "12px",
          }}>
            <a
              href={`https://explorer-sphinx.shardeum.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "12px",
                color: "var(--neon-accent)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              View public receipt →
            </a>
            <Button
              onClick={handleVerifyReceipt}
              disabled={isVerifying}
              size="sm"
              variant="secondary"
            >
              {isVerifying ? "Verifying..." : "Verify receipt"}
            </Button>
          </div>
          {verifiedReceipt && (
            <div style={{
              marginTop: "16px",
              padding: "12px",
              background: "var(--background)",
              border: "1px solid var(--border-dim)",
              borderRadius: "2px",
              fontSize: "11px",
              color: "var(--text-dim)",
            }}>
              <div style={{ fontWeight: 600, marginBottom: "8px", color: "var(--neon-accent)" }}>
                ✓ Verified on-chain
              </div>
              <div>Outcome: {verifiedReceipt.outcomeCode === 2 ? "Approved" : verifiedReceipt.outcomeCode === 1 ? "Partial" : "Rejected"}</div>
              <div>Confidence: {Math.round(verifiedReceipt.confidenceBps / 100)}%</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", marginTop: "4px" }}>
                Evidence root: {verifiedReceipt.evidenceRoot.slice(0, 20)}...
              </div>
              {evidenceRoot && verifiedReceipt.evidenceRoot.toLowerCase() === evidenceRoot.toLowerCase() && (
                <div style={{ color: "var(--neon-accent)", marginTop: "4px" }}>
                  ✓ Evidence root matches
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div style={{
        padding: "20px",
        background: "var(--bg-dim)",
        border: "1px solid var(--border-dim)",
        borderRadius: "2px",
        marginBottom: "20px",
      }}>
        <div style={{
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "12px",
        }}>
          Record outcome
        </div>
        <div style={{
          fontSize: "12px",
          color: "var(--text-dim)",
          marginBottom: "16px",
        }}>
          Wallet connected
        </div>
        <Button
          onClick={handleSettleMetaMask}
          disabled={isPending || isConfirming}
          size="sm"
        >
          {isPending || isConfirming ? "Processing..." : "Record on chain"}
        </Button>
        {error && (
          <div style={{
            marginTop: "12px",
            fontSize: "11px",
            color: "var(--text-dim)",
          }}>
            Error: {error.message}
          </div>
        )}
      </div>
    );
  }

  // Relayer mode: show relayer flow
  if (txHash) {
    return (
      <div style={{
        padding: "20px",
        background: "var(--bg-dim)",
        border: "1px solid var(--neon-accent)",
        borderRadius: "2px",
        marginBottom: "20px",
      }}>
        <div style={{
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "12px",
          color: "var(--neon-accent)",
        }}>
          ✓ Outcome recorded (Relayed)
        </div>
        {relayerAddress && (
          <div style={{
            fontSize: "11px",
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
            marginBottom: "8px",
          }}>
            Relayer: {relayerAddress.slice(0, 20)}...
          </div>
        )}
        <div style={{
          fontSize: "11px",
          color: "var(--text-dim)",
          fontFamily: "var(--font-mono)",
          marginBottom: "12px",
          wordBreak: "break-all",
        }}>
          Tx Hash: {txHash}
        </div>
        <div style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "12px",
        }}>
          <a
            href={`https://explorer-sphinx.shardeum.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "12px",
              color: "var(--neon-accent)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            View public receipt →
          </a>
          <Button
            onClick={handleVerifyReceipt}
            disabled={isVerifying}
            size="sm"
            variant="secondary"
          >
            {isVerifying ? "Verifying..." : "Verify receipt"}
          </Button>
        </div>
        {verifiedReceipt && (
          <div style={{
            marginTop: "16px",
            padding: "12px",
            background: "var(--background)",
            border: "1px solid var(--border-dim)",
            borderRadius: "2px",
            fontSize: "11px",
            color: "var(--text-dim)",
          }}>
            <div style={{ fontWeight: 600, marginBottom: "8px", color: "var(--neon-accent)" }}>
              ✓ Verified on-chain
            </div>
            <div>Outcome: {verifiedReceipt.outcomeCode === 2 ? "Approved" : verifiedReceipt.outcomeCode === 1 ? "Partial" : "Rejected"}</div>
            <div>Confidence: {Math.round(verifiedReceipt.confidenceBps / 100)}%</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", marginTop: "4px" }}>
              Evidence root: {verifiedReceipt.evidenceRoot.slice(0, 20)}...
            </div>
            {evidenceRoot && verifiedReceipt.evidenceRoot.toLowerCase() === evidenceRoot.toLowerCase() && (
              <div style={{ color: "var(--neon-accent)", marginTop: "4px" }}>
                ✓ Evidence root matches
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: "20px",
      background: "var(--bg-dim)",
      border: "1px solid var(--border-dim)",
      borderRadius: "2px",
      marginBottom: "20px",
    }}>
      <div style={{
        fontSize: "14px",
        fontWeight: 600,
        marginBottom: "12px",
      }}>
        Record outcome (Relayed)
      </div>
      <div style={{
        fontSize: "12px",
        color: "var(--text-dim)",
        marginBottom: "16px",
      }}>
        On-chain writes are relayed via backend key (hackathon demo)
      </div>
      <Button
        onClick={handleRecordRelayer}
        disabled={isRecording}
        size="sm"
      >
        {isRecording ? "Recording..." : "Record on Shardeum (Relayed)"}
      </Button>
    </div>
  );
}
