"use client";

import { useState, useEffect } from "react";
import { usePipelineContext } from "@/store/PipelineContext";
import { useAccount, useSignMessage } from "wagmi";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import StepShell from "./StepShell";
import { generateContract, generateHashAsync } from "@/lib/contractBuilder";
import { submitConfidentialContract } from "@/integrations/inco/IncoAdapter";
import { computeEvidenceRoot } from "@/lib/evidenceUtils";
import { AgreementData, VerdictData, PSLangData, EvidenceData, ContractReceipt } from "@/types/pipeline";
import GlassCard from "@/components/ui/GlassCard";
import AgreementSettlement from "@/components/wallet/AgreementSettlement";
import { getSimulatedWallet, signMessageSim } from "@/lib/simulatedWallet";

export default function AgreementStep() {
  const { activeStep, steps, completeStep, getStepData } = usePipelineContext();
  const isActive = activeStep === "agreement";
  const isCompleted = steps.agreement.status === "completed";
  const existingAgreement = getStepData<AgreementData>("agreement");
  
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [agreement, setAgreement] = useState<AgreementData | null>(existingAgreement || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmittingInco, setIsSubmittingInco] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>("");
  const [evidenceRoot, setEvidenceRoot] = useState<string>("0x" + "0".repeat(64));

  const verdictData = getStepData<VerdictData>("verdict");
  const pslangData = getStepData<PSLangData>("pslang");
  const evidenceData = getStepData<EvidenceData>("evidence");
  const intentData = getStepData("intent");

  // Generate contract when step becomes active
  useEffect(() => {
    if (isActive && !agreement && verdictData && pslangData && intentData) {
      generateAgreement();
    }
  }, [isActive, agreement, verdictData, pslangData, intentData]);

  const generateAgreement = async () => {
    if (!verdictData || !pslangData || !intentData) return;

    setIsGenerating(true);
    try {
      // Compute evidence root
      const evidenceRoot = evidenceData?.isSealed
        ? await computeEvidenceRoot(evidenceData.files)
        : "0x" + "0".repeat(64);

      // Generate contract
      const contract = await generateContract(
        intentData.content || "",
        pslangData,
        {
          ...verdictData,
          decision: verdictData.decision || (verdictData.verdict as "APPROVE" | "PARTIAL" | "REJECT"),
        },
        {
          caseHash: pslangData.hash,
          evidenceRoot,
        }
      );

      // Submit to INCO for confidential terms
      setIsSubmittingInco(true);
      const contractReceipt = await submitConfidentialContract(contract.contractText, {
        caseHash: pslangData.hash,
        evidenceRoot,
      });
      setIsSubmittingInco(false);

      const agreementData: AgreementData = {
        ...contract,
        contractReceipt: {
          receiptId: contractReceipt.receiptId,
          confidentialTermsHash: contractReceipt.confidentialTermsHash,
          accessPolicy: contractReceipt.accessPolicy,
          timestamp: contractReceipt.timestamp,
        },
      };

      setAgreement(agreementData);
      
      // Update evidence root
      if (evidenceData?.isSealed) {
        const root = await computeEvidenceRoot(evidenceData.files).catch(() => "0x" + "0".repeat(64) as `0x${string}`);
        setEvidenceRoot(root);
      } else {
        setEvidenceRoot("0x" + "0".repeat(64));
      }
    } catch (error) {
      console.error("Failed to generate agreement:", error);
    } finally {
      setIsGenerating(false);
      setIsSubmittingInco(false);
    }
  };

  // Compute evidence root when evidence is available
  useEffect(() => {
    if (evidenceData?.isSealed && evidenceData.files.length > 0) {
      computeEvidenceRoot(evidenceData.files).then(root => {
        setEvidenceRoot(root);
      }).catch(() => {
        setEvidenceRoot("0x" + "0".repeat(64));
      });
    }
  }, [evidenceData]);

  const handleSign = async (party: "A" | "B") => {
    if (!agreement) return;

    const walletMode = process.env.NEXT_PUBLIC_WALLET_MODE || "external";
    const useSim = walletMode === "sim";

    setIsSigning(true);
    try {
      const message = `Sign agreement: ${agreement.agreementId}`;
      let signature: string;
      let signerAddress: `0x${string}`;

      if (useSim) {
        // Use simulated wallet
        const simWallet = await getSimulatedWallet();
        signerAddress = simWallet.address;
        signature = await signMessageSim(message, signerAddress);
      } else {
        // Use real wallet
        if (!isConnected || !address) {
          throw new Error("Wallet not connected");
        }
        signerAddress = address;
        signature = await signMessageAsync({ message });
      }

      const updatedAgreement = { ...agreement };
      if (party === "A") {
        updatedAgreement.partyA = { address: signerAddress, signature };
      } else {
        updatedAgreement.partyB = { address: signerAddress, signature };
      }

      setAgreement(updatedAgreement);

      // Generate shareable link if Party A signed
      if (party === "A") {
        const link = `${window.location.origin}/agreement?agreementId=${agreement.agreementId}`;
        setShareableLink(link);
      }
    } catch (error) {
      console.error("Failed to sign:", error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleTxHashUpdate = (txHash: string) => {
    if (agreement) {
      const updated = { ...agreement, txHash };
      setAgreement(updated);
      completeStep("agreement", updated);
    }
  };

  const handleVerifiedUpdate = (verified: boolean) => {
    if (agreement) {
      const updated = { ...agreement, verified };
      setAgreement(updated);
      completeStep("agreement", updated);
    }
  };

  const handleComplete = () => {
    if (!agreement) return;
    completeStep("agreement", agreement);
  };

  if (!isActive && !isCompleted) {
    return null;
  }

  if (!verdictData) {
    return (
      <StepShell
        title="Settlement Agreement"
        subtitle="Finalize terms"
        isActive={isActive}
        isCompleted={isCompleted}
      >
        <div style={{ padding: "24px", textAlign: "center", color: "var(--text-dim)" }}>
          Please complete the Verdict step first.
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell
      title="Settlement Agreement"
      subtitle="Finalize terms and signatures"
      isActive={isActive}
      isCompleted={isCompleted}
      rightSlot={isCompleted ? <Badge variant="sealed" animate>LOCKED</Badge> : undefined}
    >

      {isGenerating ? (
        <div style={{ padding: "24px", textAlign: "center", color: "var(--text-dim)" }}>
          Generating agreement...
        </div>
      ) : agreement ? (
        <>
          {/* Contract Text */}
          <GlassCard style={{ marginBottom: "24px", padding: "24px" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}>
              <h3 style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--foreground)",
                fontFamily: "var(--font-body)",
              }}>
                Contract Terms
              </h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <Badge variant="default">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                    {agreement.agreementId.slice(0, 8)}...
                  </span>
                </Badge>
                <Badge variant="default">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                    {agreement.termsHash.slice(2, 10)}...
                  </span>
                </Badge>
              </div>
            </div>
            <pre
              style={{
                background: "rgba(0, 0, 0, 0.3)",
                padding: "20px",
                borderRadius: "8px",
                fontSize: "12px",
                lineHeight: "1.8",
                overflow: "auto",
                maxHeight: "400px",
                fontFamily: "var(--font-mono)",
                color: "var(--foreground)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {agreement.contractText}
            </pre>
          </GlassCard>

          {/* INCO Confidential Receipt */}
          {agreement.contractReceipt && (
            <GlassCard className="mb-6">
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--foreground)" }}>
                    INCO Confidential Terms
                  </h3>
                  <Badge variant="info">LOCAL_PROOF</Badge>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "8px" }}>
                  Receipt ID: {agreement.contractReceipt.receiptId}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "8px" }}>
                  Terms Hash: {agreement.contractReceipt.confidentialTermsHash.slice(0, 20)}...
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                  Access Policy: {agreement.contractReceipt.accessPolicy}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Signing Section */}
          <GlassCard style={{ marginBottom: "24px", padding: "24px" }}>
            <h3 style={{
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "20px",
              color: "var(--foreground)",
              fontFamily: "var(--font-body)",
            }}>
              Signatures
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Party A Card */}
              <div style={{
                padding: "16px",
                background: agreement.partyA ? "rgba(139, 92, 246, 0.1)" : "rgba(0, 0, 0, 0.2)",
                border: agreement.partyA ? "1px solid var(--accent-primary)" : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
              }}>
                <div style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-dim)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontFamily: "var(--font-mono)",
                }}>
                  Party A (Claimant)
                </div>
                {agreement.partyA ? (
                  <>
                    <div style={{ marginBottom: "8px" }}>
                      <Badge variant="verified">✓ Signed</Badge>
                    </div>
                    <div style={{
                      fontSize: "11px",
                      color: "var(--text-dim)",
                      fontFamily: "var(--font-mono)",
                      marginTop: "8px",
                    }}>
                      {agreement.partyA.address}
                    </div>
                  </>
                ) : (
                  <Button
                    onClick={() => handleSign("A")}
                    disabled={isSigning || (process.env.NEXT_PUBLIC_WALLET_MODE !== "sim" && !isConnected)}
                    variant="secondary"
                  >
                    {process.env.NEXT_PUBLIC_WALLET_MODE === "sim" 
                      ? "Sign as Party A (Sim)" 
                      : isConnected 
                        ? "Sign as Party A" 
                        : "Connect Wallet"}
                  </Button>
                )}
              </div>

              {/* Party B Card */}
              <div style={{
                padding: "16px",
                background: agreement.partyB ? "rgba(139, 92, 246, 0.1)" : "rgba(0, 0, 0, 0.2)",
                border: agreement.partyB ? "1px solid var(--accent-primary)" : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
              }}>
                <div style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-dim)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontFamily: "var(--font-mono)",
                }}>
                  Party B (Counterparty)
                </div>
                {agreement.partyB ? (
                  <>
                    <div style={{ marginBottom: "8px" }}>
                      <Badge variant="verified">✓ Signed</Badge>
                    </div>
                    <div style={{
                      fontSize: "11px",
                      color: "var(--text-dim)",
                      fontFamily: "var(--font-mono)",
                      marginTop: "8px",
                    }}>
                      {agreement.partyB.address}
                    </div>
                  </>
                ) : (
                  <div>
                    {agreement.partyA ? (
                      <div>
                        <div style={{
                          fontSize: "11px",
                          color: "var(--text-dim)",
                          marginBottom: "12px",
                          fontFamily: "var(--font-mono)",
                        }}>
                          Share link for Party B:
                        </div>
                        <input
                          type="text"
                          value={shareableLink}
                          readOnly
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            background: "rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            color: "var(--foreground)",
                            marginBottom: "12px",
                          }}
                        />
                        <Button
                          onClick={() => handleSign("B")}
                          disabled={isSigning || (process.env.NEXT_PUBLIC_WALLET_MODE !== "sim" && !isConnected)}
                          variant="secondary"
                        >
                          {process.env.NEXT_PUBLIC_WALLET_MODE === "sim" 
                            ? "Sign as Party B (Sim)" 
                            : isConnected 
                              ? "Sign as Party B" 
                              : "Connect Wallet"}
                        </Button>
                      </div>
                    ) : (
                      <div style={{
                        fontSize: "11px",
                        color: "var(--text-dim)",
                        fontStyle: "italic",
                      }}>
                        Party A must sign first
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>


          {/* Settlement Section - Show only after both signatures */}
          {agreement.partyA && agreement.partyB && (
            <AgreementSettlement
              agreementData={agreement}
              caseHash={pslangData?.hash || ""}
              evidenceRoot={evidenceRoot}
              onTxHashUpdate={handleTxHashUpdate}
              onVerifiedUpdate={handleVerifiedUpdate}
            />
          )}

          {/* Complete Button */}
          {!isCompleted && (
            <button
              onClick={handleComplete}
              className="magnetic-button magnetic-primary"
              style={{ padding: "12px 24px", borderRadius: "8px", border: "none", cursor: "pointer", marginTop: "16px" }}
            >
              Complete Agreement
            </button>
          )}
        </>
      ) : (
        <div style={{ padding: "24px", textAlign: "center", color: "var(--text-dim)" }}>
          Failed to generate agreement. Please try again.
        </div>
      )}
    </StepShell>
  );
}

