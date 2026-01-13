"use client";

import { useState, useCallback } from "react";

export type PipelineStep = "landing" | "intent" | "pslang" | "evidence" | "deliberation" | "verdict";

interface PipelineState {
  activeStep: PipelineStep;
  completedSteps: Set<PipelineStep>;
  intentData: {
    mode: "voice" | "text" | "upload";
    content: string;
  } | null;
}

export function usePipeline() {
  const [state, setState] = useState<PipelineState>({
    activeStep: "landing",
    completedSteps: new Set(),
    intentData: null,
  });

  const completeStep = useCallback((step: PipelineStep, data?: any) => {
    setState((prev) => {
      const newCompleted = new Set(prev.completedSteps);
      newCompleted.add(step);

      // Determine next step
      let nextStep: PipelineStep = prev.activeStep;
      if (step === "landing") {
        nextStep = "intent";
      } else if (step === "intent") {
        // In Phase 1, we stop here or show locked placeholder
        nextStep = "intent"; // Keep on intent, but mark as complete
      }

      return {
        activeStep: nextStep,
        completedSteps: newCompleted,
        intentData: step === "intent" ? data : prev.intentData,
      };
    });
  }, []);

  const isStepCompleted = useCallback((step: PipelineStep) => {
    return state.completedSteps.has(step);
  }, [state.completedSteps]);

  const isStepActive = useCallback((step: PipelineStep) => {
    return state.activeStep === step;
  }, [state.activeStep]);

  const canViewStep = useCallback((step: PipelineStep) => {
    // Can view if it's active, completed, or immediately after a completed step
    if (isStepActive(step) || isStepCompleted(step)) {
      return true;
    }
    return false;
  }, [isStepActive, isStepCompleted]);

  return {
    activeStep: state.activeStep,
    completedSteps: state.completedSteps,
    intentData: state.intentData,
    completeStep,
    isStepCompleted,
    isStepActive,
    canViewStep,
  };
}

