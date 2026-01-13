"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther, Address } from "viem";
import { shardeumSphinx, VERDICT_CONTRACT_ADDRESS } from "@/lib/chains";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { usePipelineContext } from "@/store/PipelineContext";
import { computeEvidenceRoot } from "@/lib/evidenceUtils";
import { EvidenceData } from "@/types/pipeline";

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
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const pslangData = getStepData("pslang");
  const verdictDataFromContext = getStepData("deliberation");
  const evidenceData = getStepData<EvidenceData>("evidence");
  const [txHash, setTxHash] = useState<string | null>(verdictDataFromContext?.txHash || null);
  const [evidenceRoot, setEvidenceRoot] = useState<`0x${string}` | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedReceipt, setVerifiedReceipt] = useState<any>(null);
  
  // Read contract hook for verification (disabled by default, enabled via refetch)
  const caseHash = pslangData ? (`0x${pslangData.hash.replace("0x", "")}` as `0x${string}`) : undefined;
  const { data: onChainReceipt, refetch: refetchReceipt } = useReadContract({
    address: VERDICT_CONTRACT_ADDRESS ? (VERDICT_CONTRACT_ADDRESS as Address) : undefined,
    abi: VERDICT_ABI,
    functionName: "getReceipt",
    args: caseHash ? [caseHash] : undefined,
    query: {
      enabled: false, // Only fetch when explicitly called via refetch
    },
  });
  
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
    if (isConfirmed && hash && verdictDataFromContext) {
      setTxHash(hash);
      // Update deliberation step data with tx hash
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
    return Math.round(verdictDataFromContext.confidence * 10000);
  };

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const handleSwitchNetwork = () => {
    switchChain({ chainId: shardeumSphinx.id });
  };

  const handleSettle = async () => {
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
        address: VERDICT_CONTRACT_ADDRESS as Address,
        abi: VERDICT_ABI,
        functionName: "recordReceipt",
        args: [caseHash, outcomeCode, confidenceBps, evRoot],
      });
    } catch (err) {
      console.error("Settlement error:", err);
    }
  };

  const handleVerifyReceipt = async () => {
    if (!pslangData || !VERDICT_CONTRACT_ADDRESS || !isConnected) return;
    
    setIsVerifying(true);
    try {
      const result = await refetchReceipt();
      if (result.data) {
        setVerifiedReceipt(result.data);
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
    if (onChainReceipt) {
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
            <div>Outcome: {verifiedReceipt.outcomeCode === 2 ? "Approved" : verifiedReceipt.outcomeCode === 1 ? "Partial" : "Not supported"}</div>
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
        onClick={handleSettle}
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

