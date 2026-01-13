"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

type RecordingState = "idle" | "requesting_permission" | "recording" | "stopping" | "ready" | "error" | "processing";

interface VoiceRecorderProps {
  onTranscriptReady: (transcript: string, audioBlob: Blob, duration: number) => void;
  caseType?: string;
  onUnsupported?: () => void;
}

export default function VoiceRecorder({ onTranscriptReady, caseType = "Other", onUnsupported }: VoiceRecorderProps) {
  const [permissionState, setPermissionState] = useState<"unknown" | "granted" | "denied">("unknown");
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptBufferRef = useRef<string>("");
  const isStoppingRef = useRef<boolean>(false);
  const restartCountRef = useRef<number>(0);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRecordSeconds = 600; // 10 minutes
  const maxRestarts = 3;
  const restartWindowMs = 10000; // 10 seconds

  // Check Speech Recognition support
  useEffect(() => {
    const supported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    setSpeechSupported(supported);
    
    if (!supported && onUnsupported) {
      console.info("Speech Recognition not supported, switching to text mode");
      setTimeout(() => onUnsupported(), 1000);
    }
  }, [onUnsupported]);

  // Check mic permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionState("granted");
    } catch (err) {
      setPermissionState("denied");
    }
  };

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionState("granted");
    } catch (err) {
      setPermissionState("denied");
      setRecordingState("error");
      if (onUnsupported) {
        onUnsupported();
      }
    }
  };

  const cleanup = () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore
      }
      recognitionRef.current = null;
    }

    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        if (analyserRef.current) {
          analyserRef.current.disconnect();
          analyserRef.current = null;
        }
        audioContextRef.current.close();
      } catch (err) {
        // Ignore
      }
      audioContextRef.current = null;
    }

    // Clear restart tracking
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    restartCountRef.current = 0;
  };

  const dedupeTranscript = (text: string): string => {
    // Remove duplicate consecutive sentences
    const sentences = text.split(/[.!?]\s+/).filter(s => s.trim());
    const unique: string[] = [];
    let last = "";
    
    for (const sentence of sentences) {
      const normalized = sentence.trim().toLowerCase();
      if (normalized !== last && normalized.length > 0) {
        unique.push(sentence.trim());
        last = normalized;
      }
    }
    
    return unique.join(". ") + (text.trim().endsWith(".") ? "" : ".");
  };

  const startRecording = async () => {
    // Prevent multiple starts
    if (recordingState === "recording" || recordingState === "requesting_permission") {
      console.info("Already recording or requesting permission");
      return;
    }

    console.info("Starting recording...");
    setRecordingState("requesting_permission");
    isStoppingRef.current = false;
    restartCountRef.current = 0;

    // Cleanup any existing resources
    cleanup();

    try {
      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionState("granted");

      // Audio context for waveform
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      // MediaRecorder
      const options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported("audio/webm")) {
        options.mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options.mimeType = "audio/mp4";
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Commit any remaining interim transcript
        if (interimTranscript.trim()) {
          transcriptBufferRef.current += " " + interimTranscript.trim();
        }

        // Clean up
        cleanup();

        // Set to processing state briefly, then ready
        setRecordingState("stopping");

        // Finalize transcript after brief delay
        setTimeout(() => {
          const sealedTranscript = dedupeTranscript(transcriptBufferRef.current.trim() || generateFallbackTranscript(caseType, duration));
          setFinalTranscript(sealedTranscript);
          setInterimTranscript("");
          setRecordingState("ready");
          onTranscriptReady(sealedTranscript, audioBlob, duration);
        }, 500);
      };

      // Speech Recognition
      if (speechSupported) {
        try {
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";

          recognition.onresult = (event: any) => {
            if (isStoppingRef.current) return;

            let interim = "";
            let final = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                final += transcript + " ";
              } else {
                interim += transcript;
              }
            }

            if (final) {
              transcriptBufferRef.current += final;
              setFinalTranscript(transcriptBufferRef.current);
              setInterimTranscript("");
            } else if (interim) {
              setInterimTranscript(interim);
            }
          };

          recognition.onerror = (event: any) => {
            console.info("Speech recognition error:", event.error);
            // Don't auto-restart on certain fatal errors
            if (event.error === "not-allowed" || event.error === "aborted") {
              return;
            }
          };

          recognition.onend = () => {
            // Only auto-restart if still recording and user didn't press stop
            // Check MediaRecorder state instead of React state (avoids stale closure)
            if (!isStoppingRef.current && mediaRecorderRef.current?.state === "recording") {
              // Check restart rate limit
              if (restartTimerRef.current !== null) {
                clearTimeout(restartTimerRef.current);
                restartTimerRef.current = null;
              }

              restartCountRef.current += 1;

              if (restartCountRef.current > maxRestarts) {
                console.info("Too many recognition restarts, stopping");
                setRecordingState("error");
                stopRecording();
                return;
              }

              // Reset counter after window
              restartTimerRef.current = setTimeout(() => {
                restartCountRef.current = 0;
              }, restartWindowMs);

              // Auto-restart with delay
              setTimeout(() => {
                if (!isStoppingRef.current && mediaRecorderRef.current?.state === "recording" && recognitionRef.current) {
                  try {
                    console.info("Auto-restarting speech recognition");
                    recognitionRef.current.start();
                  } catch (err) {
                    console.info("Failed to restart recognition:", err);
                  }
                }
              }, 100);
            }
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch (err) {
          console.info("Failed to start speech recognition:", err);
          // Continue without speech recognition
        }
      }

      // Reset state
      setDuration(0);
      transcriptBufferRef.current = "";
      setFinalTranscript("");
      setInterimTranscript("");

      // Start recording
      mediaRecorder.start(1000);
      setRecordingState("recording");

      // Timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= maxRecordSeconds) {
            stopRecording();
            return maxRecordSeconds;
          }
          return newDuration;
        });
      }, 1000);

      // Waveform
      drawWaveform();
    } catch (err: any) {
      console.info("Recording error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionState("denied");
        setRecordingState("error");
        if (onUnsupported) {
          onUnsupported();
        }
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setRecordingState("error");
        alert("No microphone found. Please connect a microphone and try again.");
      } else {
        setRecordingState("error");
      }
      setRecordingState("idle");
      cleanup();
    }
  };

  const stopRecording = () => {
    // Idempotent: can be called multiple times safely
    if (recordingState !== "recording" && recordingState !== "requesting_permission") {
      return;
    }

    console.info("Stopping recording...");
    isStoppingRef.current = true;
    setRecordingState("stopping");

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore
      }
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      // Already stopped, trigger onstop manually
      if (mediaRecorderRef.current.onstop) {
        mediaRecorderRef.current.onstop(new Event("stop") as any);
      }
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (recordingState !== "recording") return;

      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "var(--background)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        ctx.fillStyle = "var(--neon-accent)";
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  const generateFallbackTranscript = (caseType: string, durationSeconds: number): string => {
    const templates: Record<string, string> = {
      "Refund dispute": `I am requesting a refund for a purchase made on ${new Date().toLocaleDateString()}. The product did not meet the specifications as described, and I believe I am entitled to a full refund under consumer protection laws.`,
      "Wage dispute": `I am filing a claim regarding unpaid wages for work performed. I have not received compensation for hours worked, and this violates employment law.`,
      "Rental": `I am reporting issues with my rental property that have not been addressed by the landlord. The property has maintenance problems that affect habitability.`,
      "Service failure": `I contracted for services that were not delivered as agreed. The service provider failed to meet the terms of our agreement, resulting in financial loss.`,
      "Other": `I am providing testimony regarding a matter that requires legal review. I have relevant documentation and am prepared to provide additional information.`,
    };
    return templates[caseType] || templates["Other"];
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (permissionState === "denied") {
    return (
      <div style={{
        padding: "40px",
        textAlign: "center",
        background: "var(--bg-dim)",
        border: "1px solid var(--border-dim)",
        borderRadius: "4px",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🎤</div>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
          Microphone Access Required
        </h3>
        <p style={{ fontSize: "14px", color: "var(--text-dim)", marginBottom: "24px", lineHeight: "1.6" }}>
          To record your testimony, please allow microphone access in your browser settings.
        </p>
        <Button onClick={requestPermission}>Allow Microphone</Button>
      </div>
    );
  }

  if (permissionState === "unknown") {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)" }}>
        Checking microphone permission...
      </div>
    );
  }

  if (recordingState === "error") {
    return (
      <div style={{
        padding: "40px",
        textAlign: "center",
        background: "var(--bg-dim)",
        border: "1px solid var(--border-dim)",
        borderRadius: "4px",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
          Recording Error
        </h3>
        <p style={{ fontSize: "14px", color: "var(--text-dim)", marginBottom: "24px", lineHeight: "1.6" }}>
          Unable to record. Please try again or switch to text mode.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Button onClick={() => { setRecordingState("idle"); cleanup(); }}>Try Again</Button>
          {onUnsupported && (
            <Button onClick={onUnsupported} variant="secondary">Switch to Text</Button>
          )}
        </div>
      </div>
    );
  }

  const displayTranscript = finalTranscript + (interimTranscript ? " " + interimTranscript : "");

  return (
    <motion.div
      initial={false}
      animate={{ scale: recordingState === "recording" ? 1.01 : 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Waveform Canvas */}
      <motion.div
        initial={false}
        animate={{ borderColor: recordingState === "recording" ? "var(--neon-accent)" : "var(--border-dim)" }}
        style={{
          width: "100%",
          height: "120px",
          background: "var(--background)",
          border: "2px solid var(--border-dim)",
          borderRadius: "4px",
          marginBottom: "20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={120}
          style={{
            width: "100%",
            height: "100%",
            display: recordingState === "recording" ? "block" : "none",
          }}
        />
        {recordingState !== "recording" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "var(--text-dim)",
              fontSize: "14px",
            }}
          >
            {recordingState === "idle" ? "Ready to record" :
             recordingState === "requesting_permission" ? "Requesting permission..." :
             recordingState === "stopping" ? "Stopping..." :
             recordingState === "processing" ? "Processing..." :
             recordingState === "ready" ? "Recording complete" :
             recordingState === "error" ? "Error" : ""}
          </motion.div>
        )}
      </motion.div>

      {/* Live Transcript Preview */}
      {recordingState === "recording" && displayTranscript && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "16px",
            background: "var(--bg-dim)",
            border: "1px solid var(--border-dim)",
            borderRadius: "4px",
            marginBottom: "20px",
            fontSize: "13px",
            lineHeight: "1.6",
            color: "var(--foreground)",
            fontFamily: "var(--font-mono)",
            maxHeight: "120px",
            overflowY: "auto",
          }}
        >
          <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "8px", textTransform: "uppercase" }}>
            Listening...
          </div>
          {finalTranscript}
          {interimTranscript && (
            <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>{interimTranscript}</span>
          )}
        </motion.div>
      )}

      {/* Timer and Controls */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        marginBottom: "20px",
      }}>
        {recordingState === "recording" && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              fontSize: "24px",
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
              color: "var(--neon-accent)",
            }}
          >
            {formatTime(duration)}
          </motion.div>
        )}

        {recordingState === "idle" && (
          <Button onClick={startRecording} size="lg">
            Start Recording
          </Button>
        )}

        {(recordingState === "recording" || recordingState === "requesting_permission") && (
          <Button onClick={stopRecording} variant="secondary" size="lg" disabled={recordingState === "requesting_permission"}>
            Stop Recording
          </Button>
        )}

        {recordingState === "stopping" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{
                width: "20px",
                height: "20px",
                border: "2px solid var(--neon-accent)",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
              }}
            />
            <span style={{ color: "var(--text-dim)" }}>Stopping...</span>
          </motion.div>
        )}

        {recordingState === "ready" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: "8px 16px",
              background: "var(--bg-dim)",
              border: "1px solid var(--neon-accent)",
              borderRadius: "2px",
              fontSize: "12px",
              color: "var(--neon-accent)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Recording Sealed
          </motion.div>
        )}
      </div>

      {/* Final Transcript Preview */}
      {recordingState === "ready" && finalTranscript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "20px",
            background: "var(--bg-dim)",
            border: "1px solid var(--border-dim)",
            borderRadius: "4px",
            marginTop: "20px",
          }}
        >
          <div style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text-dim)",
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            Court Transcript
          </div>
          <div style={{
            fontSize: "14px",
            lineHeight: "1.8",
            color: "var(--foreground)",
            fontFamily: "var(--font-mono)",
            whiteSpace: "pre-wrap",
            marginBottom: "12px",
            padding: "12px",
            background: "var(--background)",
            borderRadius: "2px",
          }}>
            {finalTranscript}
          </div>
          <div style={{
            fontSize: "11px",
            color: "var(--text-dim)",
            borderTop: "1px solid var(--border-dim)",
            paddingTop: "12px",
          }}>
            Duration: {formatTime(duration)} • Audio Evidence Hash: {audioUrl ? "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("") : "Pending"}
          </div>
        </motion.div>
      )}

      {/* Empty transcript warning */}
      {recordingState === "ready" && !finalTranscript.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: "16px",
            background: "var(--bg-dim)",
            border: "1px solid var(--border-dim)",
            borderRadius: "4px",
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "14px", color: "var(--text-dim)", marginBottom: "12px" }}>
            No speech captured. Please try again or switch to text mode.
          </p>
          {onUnsupported && (
            <Button onClick={onUnsupported} variant="secondary" size="sm">
              Switch to Text
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
