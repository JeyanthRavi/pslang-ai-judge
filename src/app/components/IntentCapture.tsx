"use client";

import { useState, useEffect } from "react";

type IntentMode = "voice" | "text" | "upload";

interface IntentCaptureProps {
  isActive: boolean;
  isCompleted: boolean;
  onComplete: (data: { mode: IntentMode; content: string }) => void;
}

export default function IntentCapture({ isActive, isCompleted, onComplete }: IntentCaptureProps) {
  const [mode, setMode] = useState<IntentMode>("text");
  const [textContent, setTextContent] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (isCompleted) {
      setIsLocked(true);
    }
  }, [isCompleted]);

  const handleLockAndContinue = () => {
    if (isLocked || !textContent.trim()) return;

    const content = mode === "text" ? textContent : mode === "voice" ? "[Voice recording placeholder]" : "[File upload placeholder]";
    
    setIsLocked(true);
    
    // Small delay for micro-interaction
    setTimeout(() => {
      onComplete({ mode, content });
    }, 200);
  };

  if (!isActive && !isCompleted) {
    return null; // Hidden if not active and not completed
  }

  return (
    <div
      className={`fade-enter-active ${isCompleted ? "step-completed" : isActive ? "step-active" : ""}`}
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px",
        background: isCompleted ? "var(--bg-dim)" : "transparent",
        borderRadius: "4px",
        position: "relative",
        transition: "all 300ms ease-out",
        opacity: isActive ? 1 : isCompleted ? 0.4 : 0,
        transform: isActive || isCompleted ? "translateY(0)" : "translateY(20px)",
      }}
    >
      {isLocked && (
        <div className="lock-badge">LOCKED</div>
      )}

      <h2 style={{
        fontSize: "28px",
        fontWeight: 600,
        marginBottom: "30px",
        letterSpacing: "-0.01em",
      }}>
        Intent Capture
      </h2>

      {/* Mode Toggle */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "30px",
      }}>
        {(["voice", "text", "upload"] as IntentMode[]).map((m) => (
          <button
            key={m}
            onClick={() => !isLocked && setMode(m)}
            disabled={isLocked}
            style={{
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: 500,
              background: mode === m ? "var(--neon-accent)" : "transparent",
              color: mode === m ? "var(--background)" : "var(--foreground)",
              border: `1px solid ${mode === m ? "var(--neon-accent)" : "var(--border-dim)"}`,
              cursor: isLocked ? "not-allowed" : "pointer",
              borderRadius: "2px",
              textTransform: "capitalize",
              opacity: isLocked ? 0.5 : 1,
              transition: "all 200ms ease-out",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div style={{ marginBottom: "30px" }}>
        {mode === "text" && (
          <textarea
            value={textContent}
            onChange={(e) => !isLocked && setTextContent(e.target.value)}
            placeholder="Enter statement / testimony here"
            disabled={isLocked}
            readOnly={isLocked}
            style={{
              width: "100%",
              minHeight: "200px",
              padding: "16px",
              fontSize: "16px",
              background: isLocked ? "var(--bg-dim)" : "var(--background)",
              color: "var(--foreground)",
              border: `1px solid ${isActive && !isLocked ? "var(--neon-accent)" : "var(--border-dim)"}`,
              borderRadius: "2px",
              fontFamily: "var(--font-mono)",
              resize: "vertical",
              cursor: isLocked ? "not-allowed" : "text",
              opacity: isLocked ? 0.6 : 1,
            }}
          />
        )}

        {mode === "voice" && (
          <div style={{
            minHeight: "200px",
            padding: "40px",
            background: "var(--bg-dim)",
            border: `1px solid ${isActive && !isLocked ? "var(--neon-accent)" : "var(--border-dim)"}`,
            borderRadius: "2px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
          }}>
            <div style={{
              width: "100%",
              height: "80px",
              background: "var(--background)",
              borderRadius: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-dim)",
              fontSize: "14px",
            }}>
              [Waveform Placeholder]
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                disabled={isLocked}
                style={{
                  padding: "10px 24px",
                  fontSize: "14px",
                  background: "var(--neon-accent)",
                  color: "var(--background)",
                  border: "none",
                  borderRadius: "2px",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                Start
              </button>
              <button
                disabled={isLocked}
                style={{
                  padding: "10px 24px",
                  fontSize: "14px",
                  background: "transparent",
                  color: "var(--foreground)",
                  border: "1px solid var(--border-dim)",
                  borderRadius: "2px",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                Stop
              </button>
            </div>
          </div>
        )}

        {mode === "upload" && (
          <div style={{
            minHeight: "200px",
            padding: "40px",
            background: "var(--bg-dim)",
            border: `1px solid ${isActive && !isLocked ? "var(--neon-accent)" : "var(--border-dim)"}`,
            borderRadius: "2px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            color: "var(--text-dim)",
          }}>
            <div style={{ fontSize: "48px" }}>📄</div>
            <div style={{ fontSize: "14px" }}>File Picker Preview Placeholder</div>
            <input
              type="file"
              disabled={isLocked}
              style={{ display: "none" }}
            />
          </div>
        )}
      </div>

      {/* Lock & Continue Button */}
      {!isLocked && (
        <button
          onClick={handleLockAndContinue}
          disabled={mode === "text" && !textContent.trim()}
          style={{
            padding: "14px 32px",
            fontSize: "16px",
            fontWeight: 600,
            background: "var(--neon-accent)",
            color: "var(--background)",
            border: "none",
            cursor: "pointer",
            borderRadius: "2px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            transition: "all 200ms ease-out",
            opacity: mode === "text" && !textContent.trim() ? 0.5 : 1,
            boxShadow: "0 0 20px rgba(0, 255, 136, 0.2)",
          }}
          onMouseEnter={(e) => {
            if (mode === "text" && textContent.trim()) {
              e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 255, 136, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 255, 136, 0.2)";
          }}
        >
          Lock & Continue
        </button>
      )}

      {/* Locked State Message */}
      {isLocked && (
        <div style={{
          marginTop: "20px",
          padding: "16px",
          background: "var(--bg-dim)",
          border: "1px solid var(--border-dim)",
          borderRadius: "2px",
          fontSize: "14px",
          color: "var(--text-dim)",
        }}>
          Intent locked. Proceeding to next stage...
        </div>
      )}
    </div>
  );
}

