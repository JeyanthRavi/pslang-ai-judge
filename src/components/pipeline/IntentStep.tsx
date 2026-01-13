"use client";

import { useState, useEffect } from "react";
import { usePipelineContext } from "@/store/PipelineContext";
import { IntentData } from "@/types/pipeline";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import GlassCard from "@/components/ui/GlassCard";
import VoiceRecorder from "@/components/voice/VoiceRecorder";
import StepShell from "./StepShell";

type IntentMode = "voice" | "text" | "upload";
type CaseType = "Refund dispute" | "Wage dispute" | "Rental" | "Service failure" | "Other";

export default function IntentStep() {
  const { activeStep, steps, completeStep, getStepData } = usePipelineContext();
  const isActive = activeStep === "intent";
  const isCompleted = steps.intent.status === "completed";
  const existingData = getStepData<IntentData>("intent");

  const [voiceSupported, setVoiceSupported] = useState<boolean | null>(null);
  const [mode, setMode] = useState<IntentMode>(existingData?.mode || "voice");
  
  useEffect(() => {
    const supported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    setVoiceSupported(supported);
    if (!supported && !existingData && mode === "voice") {
      setMode("text");
    }
  }, [existingData, mode]);

  // Auto-switch to text if voice fails
  const handleVoiceUnsupported = () => {
    setMode("text");
  };

  const [textContent, setTextContent] = useState(existingData?.content || "");
  const [caseType, setCaseType] = useState<CaseType>((existingData?.caseType as CaseType) || "Other");
  const [voiceTranscript, setVoiceTranscript] = useState(existingData?.transcript || "");
  const [voiceAudioBlob, setVoiceAudioBlob] = useState<Blob | null>(null);
  const [voiceDuration, setVoiceDuration] = useState(existingData?.duration || 0);
  const [isLocked, setIsLocked] = useState(isCompleted);

  useEffect(() => {
    if (isCompleted) {
      setIsLocked(true);
    }
  }, [isCompleted]);

  const handleVoiceTranscriptReady = (transcript: string, audioBlob: Blob, duration: number) => {
    setVoiceTranscript(transcript);
    setVoiceAudioBlob(audioBlob);
    setVoiceDuration(duration);
  };

  const handleComplete = () => {
    if (isLocked) return;
    
    // Allow completion if transcript >= 30 chars OR demo data exists
    const hasContent = (mode === "text" && textContent.trim().length >= 30) ||
                       (mode === "voice" && voiceTranscript.trim().length >= 30) ||
                       (existingData?.content && existingData.content.length >= 30);
    
    if (!hasContent) {
      return;
    }

    const content = mode === "text" 
      ? textContent 
      : mode === "voice" 
        ? voiceTranscript
        : "[File upload placeholder]";
    
    setIsLocked(true);
    
    const intentData: IntentData = {
      mode,
      content,
      ...(mode === "voice" && {
        transcript: voiceTranscript,
        audioBlob: voiceAudioBlob || undefined,
        duration: voiceDuration,
        caseType,
        audioUrl: voiceAudioBlob ? URL.createObjectURL(voiceAudioBlob) : undefined,
      }),
    };
    
    setTimeout(() => {
      completeStep("intent", intentData);
    }, 200);
  };

  if (!isActive && !isCompleted) {
    return null;
  }

  return (
    <StepShell
      title="Your Statement"
      subtitle="Describe what happened"
      rightSlot={isLocked ? <Badge variant="sealed" animate>SEALED</Badge> : undefined}
      isActive={isActive}
      isCompleted={isCompleted}
      actions={
        !isLocked ? (
          <Button
            onClick={handleComplete}
            disabled={
              (mode === "text" && !textContent.trim()) ||
              (mode === "voice" && !voiceTranscript.trim())
            }
          >
            Seal statement
          </Button>
        ) : (
          <div style={{ color: "var(--text-dim)", fontSize: "14px" }}>
            Statement sealed. Proceeding to next stage...
          </div>
        )
      }
    >

      {/* Mode selector */}
      <div style={{
        marginBottom: "24px",
      }}>
        <div style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}>
          {(["voice", "text", "upload"] as IntentMode[]).map((m) => (
            <button
              key={m}
              onClick={() => !isLocked && setMode(m)}
              disabled={isLocked}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 600,
                background: mode === m ? "var(--accent-primary)" : "rgba(255, 255, 255, 0.05)",
                color: mode === m ? "white" : "var(--foreground)",
                border: `1px solid ${mode === m ? "var(--accent-primary)" : "rgba(255, 255, 255, 0.1)"}`,
                cursor: isLocked ? "not-allowed" : "pointer",
                borderRadius: "6px",
                textTransform: "capitalize",
                opacity: isLocked ? 0.5 : 1,
                transition: "all 120ms ease-out",
                fontFamily: "var(--font-body)",
              }}
            >
              {m === "voice" ? "Speak" : m === "text" ? "Type" : "Upload text"}
            </button>
          ))}
        </div>
      </div>

      {/* Main input zone */}
      <div style={{
        minHeight: "300px",
      }}>
        {mode === "text" && (
          <textarea
            value={textContent}
            onChange={(e) => !isLocked && setTextContent(e.target.value)}
            placeholder="Describe what happened..."
            disabled={isLocked}
            readOnly={isLocked}
            style={{
              width: "100%",
              minHeight: "200px",
              padding: "16px",
              fontSize: "14px",
              background: isLocked ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.05)",
              color: "var(--foreground)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              fontFamily: "var(--font-body)",
              resize: "vertical",
              cursor: isLocked ? "not-allowed" : "text",
              opacity: isLocked ? 0.6 : 1,
            }}
          />
        )}

        {mode === "voice" && (
          <div>
            {!isLocked && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-dim)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontFamily: "var(--font-mono)",
                }}>
                  Case Type
                </label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value as CaseType)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "14px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "var(--foreground)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <option value="Refund dispute">Refund dispute</option>
                  <option value="Wage dispute">Wage dispute</option>
                  <option value="Rental">Rental</option>
                  <option value="Service failure">Service failure</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {isLocked && existingData?.transcript ? (
              <div style={{
                padding: "16px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
              }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-dim)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "var(--font-mono)" }}>
                  Locked Transcript
                </div>
                <div style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-body)",
                  whiteSpace: "pre-wrap",
                  opacity: 0.8,
                }}>
                  {existingData.transcript}
                </div>
              </div>
            ) : voiceSupported === false ? (
              <div style={{
                padding: "40px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.02)",
              }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "var(--foreground)" }}>
                  Voice not available in this browser
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-dim)", marginBottom: "24px", lineHeight: "1.6" }}>
                  Please type your statement.
                </p>
                <Button onClick={() => setMode("text")} variant="secondary">Switch to Text</Button>
              </div>
            ) : (
              <VoiceRecorder
                onTranscriptReady={handleVoiceTranscriptReady}
                caseType={caseType}
                onUnsupported={() => setMode("text")}
              />
            )}
          </div>
        )}

        {mode === "upload" && (
          <div style={{
            minHeight: "200px",
            padding: "40px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            color: "var(--text-dim)",
            background: "rgba(255, 255, 255, 0.02)",
          }}>
            <div style={{ fontSize: "48px" }}>📄</div>
            <div style={{ fontSize: "14px" }}>File upload coming soon</div>
          </div>
        )}
      </div>

      {/* Statement Record Panel */}
      {(textContent.trim() || voiceTranscript.trim() || existingData?.content) && (
        <GlassCard style={{ marginTop: "24px", padding: "20px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}>
            <h4 style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--foreground)",
              fontFamily: "var(--font-body)",
            }}>
              Statement Record
            </h4>
            <Badge variant={isLocked ? "sealed" : mode === "voice" && voiceTranscript ? "default" : "default"}>
              {isLocked ? "Sealed" : mode === "voice" && !voiceTranscript ? "Recording" : "Draft"}
            </Badge>
          </div>
          <div style={{
            padding: "16px",
            background: "rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            lineHeight: "1.6",
            color: "var(--foreground)",
            maxHeight: "200px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {mode === "text" ? textContent || "No text entered" : mode === "voice" ? voiceTranscript || existingData?.transcript || "No transcript yet" : existingData?.content || "No content"}
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "12px",
            fontSize: "11px",
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
          }}>
            <span>
              {(mode === "text" ? textContent.length : mode === "voice" ? voiceTranscript.length : existingData?.content?.length || 0)} characters
            </span>
            <span>Language: {existingData?.caseType ? existingData.caseType.split(" ")[0] : "Auto"}</span>
          </div>
        </GlassCard>
      )}
    </StepShell>
  );
}
