"use client";

import { useState, useEffect } from "react";
import { usePipelineContext } from "@/store/PipelineContext";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import StepShell from "./StepShell";
import { compilePSLang, PSLangOutput } from "@/lib/pslangCompiler";
import { EvidenceData } from "@/types/pipeline";
import { parsePSLang, generateIntentHash, ParseResult } from "@/utils/pslang";
import { ParsedIntent } from "@/utils/pslang/types";

export default function PSLangStep() {
  const { activeStep, steps, completeStep, getStepData } = usePipelineContext();
  const isActive = activeStep === "pslang";
  const isCompleted = steps.pslang.status === "completed";
  const intentData = getStepData("intent");
  const existingPSLang = getStepData<PSLangOutput>("pslang");
  
  const [compiledPSLang, setCompiledPSLang] = useState<PSLangOutput | null>(existingPSLang || null);
  const [revealedLines, setRevealedLines] = useState(0);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [pslangResult, setPslangResult] = useState<ParseResult | null>(null);
  const [intentHash, setIntentHash] = useState<string | null>(null);

  // Parse with PSLang wrapper when step becomes active
  useEffect(() => {
    if (isActive && !pslangResult && intentData?.content) {
      parseWithPSLang();
    }
  }, [isActive, pslangResult, intentData]);

  // Compile PSLang when step becomes active (legacy compatibility)
  useEffect(() => {
    if (isActive && !compiledPSLang && intentData?.content) {
      compilePSLangSafely();
    } else if (isActive && existingPSLang) {
      // If PSLang already exists, show it immediately
      setCompiledPSLang(existingPSLang);
      setRevealedLines(6); // Show all lines immediately
    }
  }, [isActive, compiledPSLang, intentData, existingPSLang]);

  const parseWithPSLang = async () => {
    if (!intentData?.content) return;
    
    try {
      const result = await parsePSLang(intentData.content, "en");
      setPslangResult(result);
      
      // Generate intent hash
      const hash = await generateIntentHash(result.parsed.normalizedText);
      setIntentHash(hash);
    } catch (error) {
      console.error("PSLang parsing error:", error);
      // Fallback is handled by parsePSLang, so this should rarely happen
    }
  };

  // Recompile if evidence changes (after sealing)
  useEffect(() => {
    if (isActive && compiledPSLang && intentData?.content) {
      const evidenceData = getStepData<EvidenceData>("evidence");
      // Only recompile if evidence was just sealed and PSLang doesn't have evidence refs yet
      if (evidenceData?.isSealed && compiledPSLang.evidenceRefs.length === 0 && evidenceData.files.length > 0) {
        const updatedPSLang = compilePSLang(intentData.content, intentData.caseType, evidenceData);
        setCompiledPSLang(updatedPSLang);
      }
    }
  }, [isActive, getStepData]);

  const compilePSLangSafely = () => {
    if (!intentData?.content) {
      setCompileError("No transcript available. Please complete Intent step first.");
      return;
    }

    setIsCompiling(true);
    setCompileError(null);

    try {
      const evidenceData = getStepData<EvidenceData>("evidence");
      const pslang = compilePSLang(intentData.content, intentData.caseType, evidenceData);
      setCompiledPSLang(pslang);
      setIsCompiling(false);
      
      // Animate line-by-line reveal
      const lines = 6; // ACTOR, CLAIM, VALUE, CONTEXT, EVIDENCE, HASH
      let current = 0;
      const interval = setInterval(() => {
        current++;
        setRevealedLines(current);
        if (current >= lines) {
          clearInterval(interval);
        }
      }, 200);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error("PSLang compilation error:", error);
      setCompileError(error instanceof Error ? error.message : "Failed to compile PSLang. Please try again.");
      setIsCompiling(false);
    }
  };

  const handleRecompile = () => {
    setCompiledPSLang(null);
    setRevealedLines(0);
    setCompileError(null);
    compilePSLangSafely();
  };

  const handleComplete = () => {
    // If PSLang doesn't exist, compile it synchronously first
    if (!compiledPSLang) {
      if (!intentData?.content) {
        setCompileError("Cannot proceed: No transcript available.");
        return;
      }

      // Compile synchronously
      try {
        const evidenceData = getStepData<EvidenceData>("evidence");
        const pslang = compilePSLang(intentData.content, intentData.caseType, evidenceData);
        setCompiledPSLang(pslang);
        setRevealedLines(6); // Show all lines immediately
        
        // Complete step with the compiled PSLang
        completeStep("pslang", pslang);
      } catch (error) {
        console.error("PSLang compilation error:", error);
        setCompileError(error instanceof Error ? error.message : "Failed to compile PSLang. Please try again.");
      }
      return;
    }

    // PSLang exists, but check if evidence was sealed after PSLang was compiled
    const evidenceData = getStepData<EvidenceData>("evidence");
    if (evidenceData?.isSealed && compiledPSLang.evidenceRefs.length === 0 && evidenceData.files.length > 0) {
      // Recompile with evidence references
      const updatedPSLang = compilePSLang(intentData.content, intentData.caseType, evidenceData);
      setCompiledPSLang(updatedPSLang);
      completeStep("pslang", updatedPSLang);
    } else {
      // PSLang exists, complete step immediately
      completeStep("pslang", compiledPSLang);
    }
  };

  if (!isActive && !isCompleted) {
    return null;
  }

  return (
    <StepShell
      title="Structured Case Summary"
      subtitle="Confirm details"
      rightSlot={isCompleted ? <Badge variant="sealed" animate>LOCKED</Badge> : undefined}
      isActive={isActive}
      isCompleted={isCompleted}
      actions={
        compiledPSLang ? (
          <Button onClick={handleComplete}>
            Confirm & continue
          </Button>
        ) : (
          <div style={{
            padding: "12px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "6px",
            fontSize: "13px",
            color: "var(--text-dim)",
          }}>
            {intentData?.content 
              ? "Ready to confirm"
              : "Waiting for description..."}
          </div>
        )
      }
    >

      {compileError ? (
        <div style={{
          padding: "16px",
          background: "var(--background)",
          border: "1px solid var(--border-dim)",
          borderRadius: "2px",
          color: "var(--text-dim)",
          marginBottom: "20px",
        }}>
          <div style={{ color: "var(--foreground)", marginBottom: "8px", fontWeight: 600 }}>
            Error
          </div>
          <div style={{ fontSize: "13px", marginBottom: "12px" }}>
            {compileError}
          </div>
          <Button onClick={handleRecompile} size="sm" variant="secondary">
            Try again
          </Button>
        </div>
      ) : isCompiling ? (
        <div style={{
          padding: "24px",
          background: "var(--bg-dim)",
          border: "1px solid var(--border-dim)",
          borderRadius: "2px",
          marginBottom: "20px",
          textAlign: "center",
          color: "var(--text-dim)",
        }}>
          Preparing summary...
        </div>
      ) : compiledPSLang || pslangResult ? (
        <>
          {/* PSLang Layer Card */}
          {pslangResult && (
            <div style={{
              padding: "24px",
              background: "var(--bg-dim)",
              border: "1px solid var(--border-dim)",
              borderRadius: "4px",
              marginBottom: "20px",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}>
                <h3 style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  margin: 0,
                  color: "var(--foreground)",
                }}>
                  PSLang Layer
                </h3>
                <Badge variant={pslangResult.mode === "LIVE" ? "success" : "info"}>
                  {pslangResult.mode}
                </Badge>
              </div>
              
              <div style={{
                fontSize: "12px",
                color: "var(--text-dim)",
                marginBottom: "12px",
              }}>
                Confidence: {Math.round(pslangResult.parsed.confidence * 100)}%
              </div>

              <details style={{
                marginTop: "12px",
              }}>
                <summary style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  View Parsed JSON
                </summary>
                <pre style={{
                  marginTop: "12px",
                  padding: "12px",
                  background: "var(--background)",
                  borderRadius: "2px",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  overflow: "auto",
                  maxHeight: "300px",
                  color: "var(--foreground)",
                }}>
                  {JSON.stringify(pslangResult.parsed, null, 2)}
                </pre>
              </details>

              {intentHash && (
                <div style={{
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--border-dim)",
                }}>
                  <div style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--text-dim)",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                  }}>
                    Intent Hash
                  </div>
                  <div style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--foreground)",
                    wordBreak: "break-all",
                  }}>
                    {intentHash}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compiled Intent Panel */}
          {compiledPSLang && (
          <GlassCard style={{ marginBottom: "20px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                Compiled Intent
              </h4>
              {intentHash && (
                <Badge variant="default">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                    {intentHash.slice(0, 8)}...
                  </span>
                </Badge>
              )}
            </div>

            {/* Key Fields as Chips */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
              {compiledPSLang.claim && (
                <div style={{
                  padding: "6px 12px",
                  background: "rgba(139, 92, 246, 0.15)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--foreground)",
                }}>
                  {compiledPSLang.claim.toLowerCase().includes("refund") ? "Refund" : 
                   compiledPSLang.claim.toLowerCase().includes("wage") ? "Wage" :
                   compiledPSLang.claim.toLowerCase().includes("fraud") ? "Fraud" : "Other"}
                </div>
              )}
              {compiledPSLang.value && (
                <div style={{
                  padding: "6px 12px",
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--foreground)",
                }}>
                  {compiledPSLang.value}
                </div>
              )}
              {compiledPSLang.actor && (
                <div style={{
                  padding: "6px 12px",
                  background: "rgba(236, 72, 153, 0.15)",
                  border: "1px solid rgba(236, 72, 153, 0.3)",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--foreground)",
                }}>
                  {compiledPSLang.actor}
                </div>
              )}
            </div>

            {/* PSLang Code Block with Line Numbers */}
            <div style={{
              position: "relative",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              overflow: "hidden",
            }}>
              <pre style={{
                margin: 0,
                padding: "16px 16px 16px 48px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                lineHeight: "1.8",
                color: "var(--foreground)",
                overflowX: "auto",
                whiteSpace: "pre",
              }}>
{`ACTOR: ${compiledPSLang.actor || "N/A"}
CLAIM: ${compiledPSLang.claim || "N/A"}
VALUE: ${compiledPSLang.value || "N/A"}
CONTEXT: ${compiledPSLang.context || "N/A"}
EVIDENCE: ${JSON.stringify(compiledPSLang.evidenceRefs || [])}
HASH: ${compiledPSLang.hash}`}
              </pre>
              {/* Line Numbers (CSS only) */}
              <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "40px",
                padding: "16px 8px",
                background: "rgba(0, 0, 0, 0.2)",
                borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                lineHeight: "1.8",
                color: "var(--text-dim)",
                textAlign: "right",
                userSelect: "none",
              }}>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} style={{ height: "1.8em" }}>{n}</div>
                ))}
              </div>
            </div>
          </GlassCard>
          )}

          {/* Legacy Collapsible Technical Details */}
          {compiledPSLang && (
          <details style={{
            marginBottom: "20px",
            padding: "16px",
            background: "var(--bg-dim)",
            border: "1px solid var(--border-dim)",
            borderRadius: "2px",
          }}>
            <summary style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-dim)",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              View technical details
            </summary>
            <div style={{
              marginTop: "16px",
              padding: "16px",
              background: "var(--background)",
              borderRadius: "2px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              lineHeight: "1.8",
              color: "var(--foreground)",
            }}>
              <div style={{ marginBottom: "8px", color: "var(--foreground)" }}>
                <span style={{ color: "var(--neon-accent)" }}>ACTOR:</span> {compiledPSLang.actor}
              </div>
              <div style={{ marginBottom: "8px", color: "var(--foreground)" }}>
                <span style={{ color: "var(--neon-accent)" }}>CLAIM:</span> {compiledPSLang.claim}
              </div>
              <div style={{ marginBottom: "8px", color: "var(--foreground)" }}>
                <span style={{ color: "var(--neon-accent)" }}>VALUE:</span> {compiledPSLang.value || "Not specified"}
              </div>
              <div style={{ marginBottom: "8px", color: "var(--foreground)" }}>
                <span style={{ color: "var(--neon-accent)" }}>CONTEXT:</span> {compiledPSLang.context}
              </div>
              <div style={{ marginBottom: "8px", color: "var(--foreground)" }}>
                <span style={{ color: "var(--neon-accent)" }}>EVIDENCE:</span> {JSON.stringify(compiledPSLang.evidenceRefs)}
              </div>
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-dim)", color: "var(--foreground)" }}>
                <span style={{ color: "var(--neon-accent)" }}>HASH:</span>{" "}
                <span style={{ color: "var(--text-dim)", fontSize: "11px" }}>
                  {compiledPSLang.hash}
                </span>
              </div>
            </div>
          </details>
          )}
        </>
      ) : (
        <div style={{
          padding: "24px",
          background: "var(--bg-dim)",
          border: "1px solid var(--border-dim)",
          borderRadius: "2px",
          marginBottom: "20px",
          textAlign: "center",
          color: "var(--text-dim)",
        }}>
          {intentData?.content ? "Ready to prepare summary..." : "Waiting for description..."}
        </div>
      )}
    </StepShell>
  );
}

