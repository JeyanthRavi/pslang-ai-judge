"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { Address } from "viem";
import { shardeumSphinx, VERDICT_CONTRACT_ADDRESS } from "@/lib/chains";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { AgreementData } from "@/types/pipeline";
import { simulateTransaction, getSimulatedContractState } from "@/lib/simulatedWallet";

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
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const [txHash, setTxHash] = useState<string | null>(agreementData.txHash || null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Check if both signatures exist
  const canRecord = agreementData.partyA && agreementData.partyB && !txHash;

  // Convert strings to bytes32
  const agreementIdBytes = agreementData.agreementId as `0x${string}`;
  const caseHashBytes = caseHash as `0x${string}`;
  const evidenceRootBytes = evidenceRoot as `0x${string}`;
  const termsHashBytes = (agreementData.contractReceipt?.confidentialTermsHash || agreementData.termsHash) as `0x${string}`;

  // Read contract hook for verification
  const { data: onChainAgreement, refetch: refetchAgreement } = useReadContract({
    address: VERDICT_CONTRACT_ADDRESS ? (VERDICT_CONTRACT_ADDRESS as Address) : undefined,
    abi: AGREEMENT_ABI,
    functionName: "getAgreement",
    args: agreementIdBytes ? [agreementIdBytes] : undefined,
    query: {
      enabled: false, // Only fetch when explicitly called
    },
  });

  // Update tx hash when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && hash) {
      setTxHash(hash);
    }
  }, [isConfirmed, hash]);

  const handleRecord = async () => {
    if (!canRecord || !agreementData.partyA || !agreementData.partyB) return;

    const walletMode = process.env.NEXT_PUBLIC_WALLET_MODE || "external";
    const useSim = walletMode === "sim";

    if (useSim) {
      // Use simulated transaction
      const partyAAddress = agreementData.partyA.address as Address;
      const partyBAddress = agreementData.partyB.address as Address;
      const sigA = agreementData.partyA.signature as `0x${string}`;
      const sigB = agreementData.partyB.signature as `0x${string}`;

      const txHash = await simulateTransaction(
        VERDICT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
        "recordAgreement",
        [
          agreementIdBytes,
          caseHashBytes,
          evidenceRootBytes,
          termsHashBytes,
          partyAAddress,
          partyBAddress,
          sigA,
          sigB,
        ],
        partyAAddress
      );

      setTxHash(txHash);
      if (onTxHashUpdate) {
        onTxHashUpdate(txHash);
      }
    } else {
      // Use real wallet
      const partyAAddress = agreementData.partyA.address as Address;
      const partyBAddress = agreementData.partyB.address as Address;
      const sigA = agreementData.partyA.signature as `0x${string}`;
      const sigB = agreementData.partyB.signature as `0x${string}`;

      writeContract({
        address: VERDICT_CONTRACT_ADDRESS as Address,
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
    }
  };

  const handleVerify = async () => {
    if (!txHash) return;

    setIsVerifying(true);
    setVerificationError(null);

    const walletMode = process.env.NEXT_PUBLIC_WALLET_MODE || "external";
    const useSim = walletMode === "sim";

    try {
      let onChain: any;

      if (useSim) {
        // Read from simulated storage
        const stored = getSimulatedContractState(
          VERDICT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
          "getAgreement",
          [agreementIdBytes]
        );

        if (!stored || !stored[0]) {
          setVerificationError("Agreement not found in simulated storage");
          setIsVerifying(false);
          return;
        }

        // Simulated contract returns same structure as real contract
        onChain = stored;
      } else {
        // Use real contract read
        const result = await refetchAgreement();
        onChain = result.data;

        if (!onChain) {
          setVerificationError("Agreement not found on-chain");
          setIsVerifying(false);
          return;
        }
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

  // Check network
  const isCorrectNetwork = chainId === shardeumSphinx.id;
  const needsNetworkSwitch = isConnected && !isCorrectNetwork;

  if (!canRecord && !txHash) {
    return (
      <div style={{ padding: "16px", background: "var(--bg-card)", borderRadius: "8px", marginTop: "16px" }}>
        <div style={{ fontSize: "14px", color: "var(--text-dim)" }}>
          Both parties must sign before recording on-chain.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", background: "var(--bg-card)", borderRadius: "8px", marginTop: "16px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
        Record Agreement on Shardeum
      </h3>

      {process.env.NEXT_PUBLIC_WALLET_MODE === "sim" ? (
        <div>
          <div style={{ marginBottom: "12px" }}>
            <Badge variant="default">Simulated Wallet Mode</Badge>
          </div>
          <div style={{ fontSize: "14px", color: "var(--text-dim)", marginBottom: "12px" }}>
            Record agreement using simulated wallet
          </div>
          <Button
            onClick={handleRecord}
            disabled={isPending || isConfirming || !canRecord}
            variant="primary"
          >
            {isPending || isConfirming ? "Recording..." : "Record Agreement (Sim)"}
          </Button>
        </div>
      ) : !isConnected ? (
        <div>
          <div style={{ fontSize: "14px", color: "var(--text-dim)", marginBottom: "12px" }}>
            Connect wallet to record agreement on-chain
          </div>
          <Button onClick={() => connect({ connector: connectors[0] })} variant="primary">
            Connect Wallet
          </Button>
        </div>
      ) : needsNetworkSwitch ? (
        <div>
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
      ) : !txHash ? (
        <div>
          <div style={{ fontSize: "14px", color: "var(--text-dim)", marginBottom: "12px" }}>
            Record agreement on Shardeum blockchain
          </div>
          <Button
            onClick={handleRecord}
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
      ) : (
        <div>
          <div style={{ marginBottom: "12px" }}>
            <Badge variant="verified">Recorded</Badge>
          </div>
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

