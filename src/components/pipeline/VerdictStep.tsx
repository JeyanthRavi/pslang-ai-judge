"use client";

import { motion } from "framer-motion";
import { usePipelineContext } from "@/store/PipelineContext";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import WalletSettlement from "@/components/wallet/WalletSettlement";
import StepShell from "./StepShell";
import { verdictRevealVariants } from "@/lib/motion";
import { useVerdictReveal } from "@/lib/useVerdictReveal";
import { ConfidentialReceipt } from "@/integrations/inco/IncoAdapter";

export default function VerdictStep() {
  const { activeStep, steps, getStepData, incoMode, reviewBuildMode } = usePipelineContext();
  const isActive = activeStep === "verdict";
  const isCompleted = steps.verdict.status === "completed";
  const verdictData = getStepData("deliberation");
  const pslangData = getStepData("pslang");
  const isRevealed = useVerdictReveal(isActive && !!verdictData);
  
  // Get INCO receipt from deliberation data (if generated)
  const confidentialReceipt: ConfidentialReceipt | null = verdictData?.incoReceipt || null;

  if (!isActive && !isCompleted) {
    return null;
  }

  return (
    <StepShell
      title="Outcome"
      subtitle="Decision and rationale"
      rightSlot={isCompleted ? <Badge variant="sealed" animate>LOCKED</Badge> : undefined}
      isActive={isActive}
      isCompleted={isCompleted}
    >

      {/* Decision Section */}
      <div style={{
        marginBottom: "40px",
      }}>
        <div style={{
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "20px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "var(--text-dim)",
        }}>
          Decision
        </div>

        {!isRevealed && isActive && (
          <div style={{
            padding: "24px",
            background: "var(--bg-dim)",
            border: "1px solid var(--border-dim)",
            borderRadius: "2px",
            marginBottom: "20px",
            fontSize: "14px",
            color: "var(--text-dim)",
          }}>
            Preparing Verdict...
          </div>
        )}

        <GlassCard style={{ marginBottom: "20px", padding: "24px" }}>
          {/* Decision Header with Badge */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}>
            <h4 style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--foreground)",
              fontFamily: "var(--font-body)",
            }}>
              Decision
            </h4>
            <Badge
              variant={
                verdictData?.verdict === "not_guilty" || verdictData?.verdict === "APPROVE"
                  ? "verified"
                  : verdictData?.verdict === "REJECT" || verdictData?.verdict === "guilty"
                  ? "sealed"
                  : "default"
              }
            >
              {verdictData?.verdict === "not_guilty" || verdictData?.verdict === "APPROVE"
                ? "APPROVE"
                : verdictData?.verdict === "REJECT" || verdictData?.verdict === "guilty"
                ? "REJECT"
                : verdictData?.verdict === "PARTIAL" || verdictData?.verdict === "inconclusive"
                ? "PARTIAL"
                : "PENDING"}
            </Badge>
          </div>

          {/* Confidence Meter */}
          {verdictData?.confidence && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}>
                <span style={{
                  fontSize: "12px",
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-mono)",
                }}>
                  Confidence
                </span>
                <span style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--foreground)",
                  fontFamily: "var(--font-mono)",
                }}>
                  {Math.round(verdictData.confidence || 0)}%
                </span>
              </div>
              <div style={{
                width: "100%",
                height: "8px",
                background: "rgba(0, 0, 0, 0.3)",
                borderRadius: "4px",
                overflow: "hidden",
              }}>
              <div style={{
                width: `${verdictData.confidence || 0}%`,
                height: "100%",
                background: (verdictData.confidence || 0) >= 70
                    ? "linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)"
                    : (verdictData.confidence || 0) >= 50
                    ? "var(--accent-orange)"
                    : "var(--accent-red)",
                borderRadius: "4px",
                transition: "width 0.5s ease-out",
              }} />
              </div>
            </div>
          )}

          {/* Rationale List */}
          {verdictData?.rationale && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-dim)",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontFamily: "var(--font-mono)",
              }}>
                Rationale
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: "20px",
                listStyle: "disc",
                fontSize: "14px",
                color: "var(--foreground)",
                lineHeight: "1.8",
              }}>
                {typeof verdictData.rationale === "string" ? (
                  verdictData.rationale.split(/[•\n]/).filter((b: string) => b.trim()).map((bullet: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: "12px" }}>
                      {bullet.trim()}
                    </li>
                  ))
                ) : (
                  Array.isArray(verdictData.rationale) ? verdictData.rationale.map((bullet: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: "12px" }}>
                      {bullet}
                    </li>
                  )) : <li>{verdictData.rationale}</li>
                )}
              </ul>
            </div>
          )}
          {verdictData?.recommendedAction && (
            <>
              <div style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-dim)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontFamily: "var(--font-mono)",
              }}>
                Next step
              </div>
              <div style={{
                fontSize: "13px",
                color: "var(--foreground)",
                marginBottom: "16px",
                padding: "12px",
                background: "rgba(0, 0, 0, 0.2)",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}>
                {verdictData.recommendedAction}
              </div>
            </>
          )}
          
          {verdictData?.engine && (
            <div style={{
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "var(--text-dim)",
            }}>
              Decision Engine: {verdictData.engine === "gemini" ? "Gemini" : "Rules"}
            </div>
          )}
        </GlassCard>

        {confidentialReceipt && reviewBuildMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "20px",
              background: "var(--bg-dim)",
              border: "1px solid var(--secondary-accent)",
              borderRadius: "4px",
              marginBottom: "20px",
            }}
          >
            <div style={{
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "12px",
              color: "var(--secondary-accent)",
            }}>
              Confidential Receipt (INCO)
            </div>
            <div style={{
              fontSize: "11px",
              color: "var(--text-dim)",
              fontFamily: "var(--font-mono)",
              marginBottom: "8px",
            }}>
              Receipt ID: {confidentialReceipt.receiptId}
            </div>
            <div style={{
              fontSize: "11px",
              color: "var(--text-dim)",
              fontFamily: "var(--font-mono)",
              marginBottom: "8px",
            }}>
              Hash: {confidentialReceipt.pslangHash.slice(0, 20)}...
            </div>
            <div style={{
              fontSize: "11px",
              color: "var(--text-dim)",
            }}>
              Access Policy: {confidentialReceipt.accessPolicy}
            </div>
          </motion.div>
        )}
      </div>

      {/* Settlement Section */}
      <div>
        <div style={{
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "20px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "var(--text-dim)",
        }}>
          Record outcome (optional)
        </div>
        <p style={{
          fontSize: "13px",
          color: "var(--text-dim)",
          marginBottom: "16px",
        }}>
          Creates a public receipt link.
        </p>
        {verdictData ? (
          <WalletSettlement />
        ) : (
          <div style={{
            padding: "20px",
            background: "var(--bg-dim)",
            border: "1px solid var(--border-dim)",
            borderRadius: "2px",
            fontSize: "14px",
            color: "var(--text-dim)",
            textAlign: "center",
          }}>
            Outcome must be available before recording.
          </div>
        )}
      </div>

      {!isCompleted && (
        <Button
          onClick={() => {
            // Mark as complete (Phase 7 will add actual wallet action)
            console.log("Verdict step completed");
          }}
        >
          Complete
        </Button>
      )}
    </StepShell>
  );
}

