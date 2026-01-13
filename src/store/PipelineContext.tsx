"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { PipelineStep, StepState, IntentData, PSLangData, EvidenceData, VerdictData } from "@/types/pipeline";
import { getNextStep } from "@/lib/pipeline";

interface PipelineContextValue {
  activeStep: PipelineStep;
  steps: Record<PipelineStep, StepState>;
  demoMode: boolean;
  setDemoMode: (mode: boolean) => void;
  incoMode: boolean;
  setIncoMode: (mode: boolean) => void;
  reviewBuildMode: boolean;
  setReviewBuildMode: (mode: boolean) => void;
  completeStep: (step: PipelineStep, data?: any) => void;
  navigateToStep: (step: PipelineStep) => boolean;
  resetPipeline: () => void;
  getStepData: <T = any>(step: PipelineStep) => T | undefined;
}

const PipelineContext = createContext<PipelineContextValue | undefined>(undefined);

const initialSteps: Record<PipelineStep, StepState> = {
  landing: { status: "active" },
  intent: { status: "locked" },
  pslang: { status: "locked" },
  evidence: { status: "locked" },
  deliberation: { status: "locked" },
  verdict: { status: "locked" },
  agreement: { status: "locked" },
};

export function PipelineProvider({ children }: { children: ReactNode }) {
  const [activeStep, setActiveStep] = useState<PipelineStep>("landing");
  const [steps, setSteps] = useState<Record<PipelineStep, StepState>>(initialSteps);
  const [demoMode, setDemoMode] = useState(true);
  const [incoMode, setIncoMode] = useState(false);
  const [reviewBuildMode, setReviewBuildMode] = useState(false);

  const completeStep = useCallback((step: PipelineStep, data?: any) => {
    setSteps((prev) => {
      const newSteps = { ...prev };
      newSteps[step] = {
        status: "completed",
        data,
      };

      // Unlock next step
      const nextStep = getNextStep(step);
      if (nextStep) {
        newSteps[nextStep] = {
          status: "active",
        };
      }

      return newSteps;
    });

    // Advance to next step after a brief delay
    setTimeout(() => {
      const nextStep = getNextStep(step);
      if (nextStep) {
        setActiveStep(nextStep);
      }
    }, 200);
  }, []);

  const navigateToStep = useCallback((step: PipelineStep): boolean => {
    // Only allow navigation to active or completed steps
    const targetState = steps[step];
    if (targetState.status === "locked") {
      console.warn(`Cannot navigate to locked step: ${step}`);
      return false;
    }

    setActiveStep(step);
    return true;
  }, [steps]);

  const resetPipeline = useCallback(() => {
    setActiveStep("landing");
    setSteps(initialSteps);
    console.log("Pipeline reset");
  }, []);

  const getStepData = useCallback(<T = any,>(step: PipelineStep): T | undefined => {
    return steps[step]?.data as T | undefined;
  }, [steps]);

  return (
    <PipelineContext.Provider
      value={{
        activeStep,
        steps,
        demoMode,
        setDemoMode,
        incoMode,
        setIncoMode,
        reviewBuildMode,
        setReviewBuildMode,
        completeStep,
        navigateToStep,
        resetPipeline,
        getStepData,
      }}
    >
      {children}
    </PipelineContext.Provider>
  );
}

export function usePipelineContext() {
  const context = useContext(PipelineContext);
  if (!context) {
    throw new Error("usePipelineContext must be used within PipelineProvider");
  }
  return context;
}

