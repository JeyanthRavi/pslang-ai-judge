import { PipelineStep } from "@/types/pipeline";

export const STEP_ORDER: PipelineStep[] = [
  "landing",
  "intent",
  "pslang",
  "evidence",
  "deliberation",
  "verdict",
  "agreement",
];

export const STEP_LABELS: Record<PipelineStep, string> = {
  landing: "Landing",
  intent: "Intent Capture",
  pslang: "PSLang Visualization",
  evidence: "Evidence Upload",
  deliberation: "AI Judge Deliberation",
  verdict: "Verdict + Wallet",
  agreement: "Agreement",
};

export const STEP_DESCRIPTIONS: Record<PipelineStep, string> = {
  landing: "Begin the testimony process",
  intent: "Capture voice, text, or upload",
  pslang: "Structured intent compilation",
  evidence: "Upload supporting documents",
  deliberation: "AI evaluation in progress",
  verdict: "Final judgment and settlement",
  agreement: "Settlement contract and signatures",
};

// Legacy - use MOTION_TIMINGS from motion.ts instead
export const ANIMATION_TIMINGS = {
  stepTransition: 300,
  buttonPress: 100,
  lockDelay: 200,
  verdictPause: 400,
} as const;

