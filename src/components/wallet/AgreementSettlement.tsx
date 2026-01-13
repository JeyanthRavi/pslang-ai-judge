"use client";

import { useState, useEffect } from "react";
import { shardeumSphinx, VERDICT_CONTRACT_ADDRESS } from "@/lib/chains";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { AgreementData } from "@/types/pipeline";

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

// Agreement ABI
const AGREEMENT_ABI = [
  {
    inputs: [
      { name: "_agreementId", type: "bytes32" },
      { name: "_caseHash", type: "bytes32" },
      { name: "_evidenceRoot", type: "bytes32" },
      { name: "_termsHash", type: "bytes32" },
      { name: "_partyA", type: "address" },
      { name: "_partyB", type: "address" },
      { name: "_sigA", type: "bytes" },
      { name: "_sigB", type: "bytes" },
    ],
    name: "recordAgreement",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_agreementId", type: "bytes32" }],
    name: "getAgreement",
    outputs: [
      { name: "agreementId", type: "bytes32" },
      { name: "caseHash", type: "bytes32" },
      { name: "evidenceRoot", type: "bytes32" },
      { name: "termsHash", type: "bytes32" },
      { name: "partyA", type: "address" },
      { name: "partyB", type: "address" },
      { name: "sigA", type: "bytes" },
      { name: "sigB", type: "bytes" },
      { name: "timestamp", type: "uint64" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface AgreementSettlementProps {
  agreementData: AgreementData;
  caseHash: string;
  evidenceRoot: string;
  onTxHashUpdate?: (txHash: string) => void;
  onVerifiedUpdate?: (verified: boolean) => void;
}

export default function AgreementSettlement({ agreementData, caseHash, evidenceRoot, onTxHashUpdate, onVerifiedUpdate }: AgreementSettlementProps) {
  // Wagmi hooks (only in MetaMask mode)
  const wagmiAccount = useMetaMask ? useAccount() : { address: undefined, isConnected: false, chainId: undefined };
  const wagmiConnect = useMetaMask ? useConnect() : { connect: () => {}, connectors: [] };
  const wagmiSwitchChain = useMetaMask ? useSwitchChain() : { switchChain: () => {} };
  const wagmiWriteContract = useMetaMask ? useWriteContract() : { writeContract: () => {}, data: null, isPending: false, error: null };
  const wagmiWaitReceipt = useMetaMask ? useWaitForTransactionReceipt({ hash: wagmiWriteContract.data }) : { isLoading: false, isSuccess: false };
  const wagmiReadContract = useMetaMask ? useReadContract({
    address: VERDICT_CONTRACT_ADDRESS ? (VERDICT_CONTRACT_ADDRESS as any) : undefined,
    abi: AGREEMENT_ABI,
    functionName: "getAgreement",
    args: undefined,
    query: { enabled: false },
  }) : { data: null, refetch: async () => ({ data: null }) };

  const { address, isConnected, chainId } = wagmiAccount;
  const { connect, connectors } = wagmiConnect;
  const { switchChain } = wagmiSwitchChain;
  const { writeContract, data: hash, isPending, error } = wagmiWriteContract;
  const { isLoading: isConfirming, isSuccess: isConfirmed } = wagmiWaitReceipt;
  const { data: onChainAgreement, refetch: refetchAgreement } = wagmiReadContract;

  const [txHash, setTxHash] = useState<string | null>(agreementData.txHash || null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [relayerAddress, setRelayerAddress] = useState<string | null>(null);

  // Check if both signatures exist
  const canRecord = agreementData.partyA && agreementData.partyB && !txHash;

  // Convert strings to bytes32
  const agreementIdBytes = agreementData.agreementId as `0x${string}`;
  const caseHashBytes = caseHash as `0x${string}`;
  const evidenceRootBytes = evidenceRoot as `0x${string}`;
  const termsHashBytes = (agreementData.contractReceipt?.confidentialTermsHash || agreementData.termsHash) as `0x${string}`;

  // Update tx hash when transaction is confirmed
  useEffect(() => {
    if (useMetaMask && isConfirmed && hash) {
      setTxHash(hash);
      if (onTxHashUpdate) {
        onTxHashUpdate(hash);
      }
    }
  }, [isConfirmed, hash, onTxHashUpdate]);

  // Relayer mode: record via API
  const handleRecordRelayer = async () => {
    if (!canRecord || !agreementData.partyA || !agreementData.partyB) return;

    setIsRecording(true);
    setVerificationError(null);

    try {
      const partyAAddress = agreementData.partyA.address as `0x${string}`;
      const partyBAddress = agreementData.partyB.address as `0x${string}`;
      const sigA = agreementData.partyA.signature as `0x${string}`;
      const sigB = agreementData.partyB.signature as `0x${string}`;

      const response = await fetch("/api/chain/record-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agreementId: agreementIdBytes,
          caseHash: caseHashBytes,
          evidenceRoot: evidenceRootBytes,
          termsHash: termsHashBytes,
          partyA: partyAAddress,
          partyB: partyBAddress,
          sigA,
          sigB,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to record agreement");
      }

      const { txHash: newTxHash } = await response.json();
      setTxHash(newTxHash);

      // Get relayer address from response
      if (response.headers.get("x-relayer-address")) {
        setRelayerAddress(response.headers.get("x-relayer-address"));
      }

      if (onTxHashUpdate) {
        onTxHashUpdate(newTxHash);
      }
    } catch (err) {
      console.error("Relayer agreement error:", err);
      setVerificationError(err instanceof Error ? err.message : "Failed to record agreement");
    } finally {
      setIsRecording(false);
    }
  };

  // MetaMask mode: record via wallet
  const handleRecordMetaMask = async () => {
    if (!canRecord || !agreementData.partyA || !agreementData.partyB) return;

    const partyAAddress = agreementData.partyA.address as any;
    const partyBAddress = agreementData.partyB.address as any;
    const sigA = agreementData.partyA.signature as `0x${string}`;
    const sigB = agreementData.partyB.signature as `0x${string}`;

    writeContract({
      address: VERDICT_CONTRACT_ADDRESS as any,
      abi: AGREEMENT_ABI,
      functionName: "recordAgreement",
      args: [
        agreementIdBytes,
        caseHashBytes,
        evidenceRootBytes,
        termsHashBytes,
        partyAAddress,
        partyBAddress,
        sigA,
        sigB,
      ],
    });
  };

  const handleVerify = async () => {
    if (!txHash) return;

    setIsVerifying(true);
    setVerificationError(null);

    try {
      let onChain: any;

      if (useMetaMask && isConnected) {
        // Use wagmi read contract
        const result = await refetchAgreement();
        onChain = result.data;
      } else {
        // Use API read
        const response = await fetch(`/api/chain/read-agreement?agreementId=${agreementIdBytes}`);
        if (!response.ok) {
          throw new Error("Failed to read agreement");
        }
        const { agreement } = await response.json();
        onChain = agreement;
      }

      if (!onChain) {
        setVerificationError("Agreement not found on-chain");
        setIsVerifying(false);
        return;
      }

      // Destructure tuple return
      const [
        onChainAgreementId,
        onChainCaseHash,
        onChainEvidenceRoot,
        onChainTermsHash,
        onChainPartyA,
        onChainPartyB,
        onChainSigA,
        onChainSigB,
        onChainTimestamp,
      ] = onChain;

      // Verify all hashes match
      const matches = 
        onChainAgreementId.toLowerCase() === agreementIdBytes.toLowerCase() &&
        onChainCaseHash.toLowerCase() === caseHashBytes.toLowerCase() &&
        onChainEvidenceRoot.toLowerCase() === evidenceRootBytes.toLowerCase() &&
        onChainTermsHash.toLowerCase() === termsHashBytes.toLowerCase() &&
        onChainPartyA.toLowerCase() === agreementData.partyA!.address.toLowerCase() &&
        onChainPartyB.toLowerCase() === agreementData.partyB!.address.toLowerCase();

      setVerified(matches);
      if (onVerifiedUpdate) {
        onVerifiedUpdate(matches);
      }
      if (!matches) {
        setVerificationError("On-chain data does not match local agreement");
      }
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  // Check network (MetaMask mode only)
  const isCorrectNetwork = useMetaMask ? chainId === shardeumSphinx.id : true;
  const needsNetworkSwitch = useMetaMask && isConnected && !isCorrectNetwork;

  if (!canRecord && !txHash) {
    return (
      <div style={{ padding: "16px", background: "var(--bg-card)", borderRadius: "8px", marginTop: "16px" }}>
        <div style={{ fontSize: "14px", color: "var(--text-dim)" }}>
          Both parties must sign before recording on-chain.
        </div>
      </div>
    );
  }

  // MetaMask mode: show wallet connection flow
  if (useMetaMask) {
    if (!isConnected) {
      return (
        <div style={{ padding: "16px", background: "var(--bg-card)", borderRadius: "8px", marginTop: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
            Record Agreement on Shardeum
          </h3>
          <div style={{ fontSize: "14px", color: "var(--text-dim)", marginBottom: "12px" }}>
            Connect wallet to record agreement on-chain
          </div>
          <Button onClick={() => connect({ connector: connectors[0] })} variant="primary">
            Connect Wallet
          </Button>
        </div>
      );
    }

    if (needsNetworkSwitch) {
      return (
        <div style={{ padding: "16px", background: "var(--bg-card)", borderRadius: "8px", marginTop: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
            Record Agreement on Shardeum
          </h3>
          <div style={{ fontSize: "14px", color: "var(--text-dim)", marginBottom: "12px" }}>
            Please switch to Shardeum Sphinx network
          </div>
          <Button
            onClick={() => switchChain({ chainId: shardeumSphinx.id })}
            variant="primary"
          >
            Switch to Shardeum
          </Button>
        </div>
      );
    }

    if (!txHash) {
      return (
        <div style={{ padding: "16px", background: "var(--bg-card)", borderRadius: "8px", marginTop: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
            Record Agreement on Shardeum
          </h3>
          <div style={{ fontSize: "14px", color: "var(--text-dim)", marginBottom: "12px" }}>
            Record agreement on Shardeum blockchain
          </div>
          <Button
            onClick={handleRecordMetaMask}
            disabled={isPending || isConfirming || !canRecord}
            variant="primary"
          >
            {isPending || isConfirming ? "Recording..." : "Record Agreement on Shardeum"}
          </Button>
          {error && (
            <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--accent-red)" }}>
              Error: {error.message}
            </div>
          )}
        </div>
      );
    }
  }

  // Relayer mode or MetaMask mode with txHash
  return (
    <div style={{ padding: "16px", background: "var(--bg-card)", borderRadius: "8px", marginTop: "16px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
        Record Agreement on Shardeum
      </h3>

      {!txHash ? (
        <div>
          {!useMetaMask && (
            <>
              <div style={{ marginBottom: "12px" }}>
                <Badge variant="default">Relayer Mode</Badge>
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-dim)", marginBottom: "12px" }}>
                On-chain writes are relayed via backend key (hackathon demo)
              </div>
            </>
          )}
          <Button
            onClick={useMetaMask ? handleRecordMetaMask : handleRecordRelayer}
            disabled={(useMetaMask ? (isPending || isConfirming) : isRecording) || !canRecord}
            variant="primary"
          >
            {useMetaMask
              ? (isPending || isConfirming ? "Recording..." : "Record Agreement on Shardeum")
              : (isRecording ? "Recording..." : "Record Agreement (Relayed)")}
          </Button>
          {error && (
            <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--accent-red)" }}>
              Error: {error.message}
            </div>
          )}
          {verificationError && !useMetaMask && (
            <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--accent-red)" }}>
              {verificationError}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: "12px" }}>
            <Badge variant="verified">Recorded</Badge>
          </div>
          {relayerAddress && (
            <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginBottom: "8px" }}>
              Relayer: {relayerAddress.slice(0, 20)}...
            </div>
          )}
          <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>
            Tx Hash: {txHash.slice(0, 20)}...
          </div>
          <a
            href={`https://explorer-sphinx.shardeum.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "12px", color: "var(--accent-primary)", textDecoration: "underline" }}
          >
            View on Explorer
          </a>

          {!verified && (
            <div style={{ marginTop: "16px" }}>
              <Button
                onClick={handleVerify}
                disabled={isVerifying}
                variant="secondary"
              >
                {isVerifying ? "Verifying..." : "Verify Agreement"}
              </Button>
              {verificationError && (
                <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--accent-red)" }}>
                  {verificationError}
                </div>
              )}
            </div>
          )}

          {verified && (
            <div style={{ marginTop: "16px" }}>
              <Badge variant="verified">Verified ✅</Badge>
              <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "8px" }}>
                All hashes match on-chain
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
