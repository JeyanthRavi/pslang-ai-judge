"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePipelineContext } from "@/store/PipelineContext";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import StepShell from "./StepShell";
import { prepareConfidentialPayload, submitConfidentialEvaluation, getConfidentialReceipt } from "@/integrations/inco/IncoAdapter";

export default function DeliberationStep() {
  const { activeStep, steps, completeStep, getStepData, demoMode, incoMode } = usePipelineContext();
  const isActive = activeStep === "deliberation";
  const isCompleted = steps.deliberation.status === "completed";
  
  const intentData = getStepData("intent");
  const pslangData = getStepData("pslang");
  const evidenceData = getStepData("evidence");
  
  const [reasoningTrace, setReasoningTrace] = useState<string[]>([]);
  const [currentTraceIndex, setCurrentTraceIndex] = useState(0);
  const [judgeResponse, setJudgeResponse] = useState<any>(null);
  const [isDeliberating, setIsDeliberating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Judge endpoint (always local)
  const judgeUrl = "/api/judge";

  const handleBeginDeliberation = () => {
    if (!evidenceData || steps.evidence.status !== "completed") {
      return;
    }
    setHasStarted(true);
    setIsDeliberating(true);
    callJudgeAPI();
  };

  const callJudgeAPI = async () => {
    try {
      setIsDeliberating(true);
      setReasoningTrace(["Reviewing statement…", "Checking evidence fields…", "Finalizing decision…"]);
      setCurrentTraceIndex(0);

      // Stage 1: Reviewing statement (900ms)
      await new Promise(resolve => setTimeout(resolve, 900));
      setCurrentTraceIndex(1);

      // Stage 2: Checking evidence fields (900ms)
      await new Promise(resolve => setTimeout(resolve, 900));
      setCurrentTraceIndex(2);

      // Stage 3: Finalizing decision (900ms)
      await new Promise(resolve => setTimeout(resolve, 900));

      // Now call API
      const startTime = Date.now();
      const response = await fetch(judgeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: intentData.content || "",
          pslang: pslangData,
          evidence: evidenceData?.files?.map((f: any) => ({
            filename: f.filename,
            size: f.size,
            type: f.type,
            hash: f.hash,
            extractedText: f.extractedText, // Include extracted text
          })) || [],
          demoMode,
          incoMode,
        }),
      });
      const latency = Date.now() - startTime;
      
      // Store latency for ReviewModeDrawer
      if (typeof window !== "undefined") {
        localStorage.setItem("judgeLatency", latency.toString());
      }

      const verdict = await response.json();
      setJudgeResponse(verdict);
      setIsDeliberating(false);
      
      // Handle INCO confidential evaluation if mode is ON
      let incoReceipt = null;
      if (incoMode && pslangData) {
        try {
          const payload = prepareConfidentialPayload(
            pslangData.hash,
            verdict.decision,
            pslangData.value,
            pslangData.evidenceRefs
          );
          const receiptId = await submitConfidentialEvaluation(payload);
          incoReceipt = await getConfidentialReceipt(receiptId, pslangData.hash);
        } catch (err) {
          console.warn("INCO evaluation error:", err);
        }
      }
      
      // Complete step after showing verdict
      setTimeout(() => {
        completeStep("deliberation", {
          verdict: verdict.decision === "APPROVE" ? "not_guilty" : verdict.decision === "REJECT" ? "guilty" : "inconclusive",
          rationale: verdict.rationale.join(" "),
          confidence: verdict.confidence / 100,
          recommendedAction: verdict.recommendedAction,
          txHash: null, // Will be set when settlement completes
          incoReceipt, // Store INCO receipt if generated
          engine: verdict.engine || "rules", // Store which engine was used
        });
      }, 1000);
    } catch (error) {
      console.error("Judge API error:", error);
      setIsDeliberating(false);
      setHasStarted(false);
      // Show error but allow retry
      setReasoningTrace(["Could not complete deliberation. Retry."]);
    }
  };

  if (!isActive && !isCompleted) {
    return null;
  }

  return (
    <StepShell
      title="Review"
      subtitle="Evaluating your case"
      rightSlot={isCompleted ? <Badge variant="sealed" animate>LOCKED</Badge> : undefined}
      isActive={isActive}
      isCompleted={isCompleted}
      actions={
        !hasStarted && !isCompleted ? (
          <>
            <div style={{
              fontSize: "14px",
              color: "var(--text-dim)",
              marginBottom: "12px",
            }}>
              {steps.evidence.status !== "completed" 
                ? "Lock files to proceed."
                : "All files are locked. Get your decision when ready."}
            </div>
            <Button
              onClick={handleBeginDeliberation}
              disabled={steps.evidence.status !== "completed" || !intentData || !pslangData}
            >
              Get decision
            </Button>
          </>
        ) : undefined
      }
    >

      {hasStarted && (
        <GlassCard style={{ marginBottom: "20px", padding: "24px" }}>
          <h4 style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--foreground)",
            fontFamily: "var(--font-body)",
            marginBottom: "24px",
          }}>
            Court Process Timeline
          </h4>

          {/* 3-Stage Timeline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "Evidence check", message: "Reviewing statement…" },
              { label: "Rule application", message: "Checking evidence fields…" },
              { label: "Decision finalization", message: "Finalizing decision…" },
            ].map((stage, idx) => {
              const isCurrent = !isCompleted && currentTraceIndex === idx;
              const isPast = !isCompleted && currentTraceIndex > idx || isCompleted;
              const isFuture = !isCompleted && currentTraceIndex < idx;

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    padding: "12px",
                    background: isCurrent ? "rgba(139, 92, 246, 0.1)" : "rgba(0, 0, 0, 0.1)",
                    border: isCurrent ? "1px solid var(--accent-primary)" : "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    opacity: isFuture ? 0.4 : 1,
                  }}
                >
                  {/* Stage Number/Icon */}
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: isCurrent
                      ? "var(--accent-primary)"
                      : isPast
                        ? "var(--accent-primary)"
                        : "rgba(255, 255, 255, 0.05)",
                    border: isCurrent || isPast
                      ? "2px solid var(--accent-primary)"
                      : "2px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: isCurrent || isPast ? "white" : "var(--text-dim)",
                    flexShrink: 0,
                  }}>
                    {isPast ? "✓" : idx + 1}
                  </div>

                  {/* Stage Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "13px",
                      fontWeight: isCurrent ? 600 : 500,
                      color: isCurrent ? "var(--foreground)" : isPast ? "var(--text-dim)" : "var(--text-muted)",
                      marginBottom: "4px",
                    }}>
                      {stage.label}
                    </div>
                    {isCurrent && !isCompleted && (
                      <div style={{
                        fontSize: "11px",
                        color: "var(--text-dim)",
                        fontStyle: "italic",
                      }}>
                        {reasoningTrace[currentTraceIndex] || stage.message}
                      </div>
                    )}
                    {isPast && (
                      <div style={{
                        fontSize: "11px",
                        color: "var(--text-dim)",
                      }}>
                        ✓ Complete
                      </div>
                    )}
                  </div>

                  {/* Current Indicator */}
                  {isCurrent && !isCompleted && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "var(--accent-primary)",
                        alignSelf: "center",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

          {judgeResponse && !isCompleted && (
            <GlassCard style={{ marginBottom: "20px", padding: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-dim)", marginBottom: "12px", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Verdict Preview
              </div>
              <div style={{ fontSize: "14px", color: "var(--foreground)", marginBottom: "8px", fontWeight: 600 }}>
                Decision: <span style={{ color: "var(--accent-primary)" }}>{judgeResponse.decision}</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                Confidence: {judgeResponse.confidence}%
              </div>
            </GlassCard>
          )}

          {reasoningTrace.length > 0 && reasoningTrace[0] === "Could not complete deliberation. Retry." && (
            <div style={{ marginTop: "16px" }}>
              <Button onClick={handleBeginDeliberation}>
                Retry
              </Button>
            </div>
          )}

          <div style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: "11px",
            color: "var(--text-dim)",
            fontStyle: "italic",
            fontFamily: "var(--font-body)",
          }}>
            Decision uses your statement + extracted invoice fields + evidence receipt.
          </div>
    </StepShell>
  );
}

