import { PipelineStep, StepStatus } from "@/types/pipeline";
import { STEP_ORDER } from "./constants";

export function getStepStatus(
  step: PipelineStep,
  activeStep: PipelineStep,
  completedSteps: Set<PipelineStep>
): StepStatus {
  if (completedSteps.has(step)) {
    return "completed";
  }
  if (step === activeStep) {
    return "active";
  }
  return "locked";
}

export function getNextStep(currentStep: PipelineStep): PipelineStep | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === STEP_ORDER.length - 1) {
    return null;
  }
  return STEP_ORDER[currentIndex + 1];
}

export function getPreviousStep(currentStep: PipelineStep): PipelineStep | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex <= 0) {
    return null;
  }
  return STEP_ORDER[currentIndex - 1];
}

export function canNavigateToStep(
  targetStep: PipelineStep,
  activeStep: PipelineStep,
  completedSteps: Set<PipelineStep>
): boolean {
  // Can navigate to active step
  if (targetStep === activeStep) {
    return true;
  }
  
  // Can navigate to completed steps (backward navigation)
  if (completedSteps.has(targetStep)) {
    return true;
  }
  
  // Cannot navigate to future steps
  return false;
}

