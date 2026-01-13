"use client";

import { motion } from "framer-motion";
import { usePipelineContext } from "@/store/PipelineContext";
import { PipelineStep, StepStatus } from "@/types/pipeline";
import { STEP_ORDER, STEP_LABELS, STEP_DESCRIPTIONS } from "@/lib/constants";
import { getStepStatus } from "@/lib/pipeline";
import { railStatusVariants, checkmarkVariants } from "@/lib/motion";
import GlassCard from "@/components/ui/GlassCard";

export default function PipelineRail() {
  const { activeStep, steps, navigateToStep } = usePipelineContext();

  const handleStepClick = (step: PipelineStep) => {
    const stepState = steps[step];
    // Only allow navigation to active or completed steps
    if (stepState.status !== "locked") {
      navigateToStep(step);
    }
  };

  return (
    <GlassCard
      style={{
        width: "280px",
        padding: 0,
        minHeight: "calc(100vh - 60px)",
        position: "sticky",
        top: "60px",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "24px 24px 20px 24px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}>
        <h3 style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--foreground)",
          marginBottom: "4px",
          fontFamily: "var(--font-hero)",
        }}>
          Decision Pipeline
        </h3>
        <p style={{
          fontSize: "11px",
          color: "var(--text-dim)",
          margin: 0,
          fontFamily: "var(--font-body)",
        }}>
          Follow your case progress
        </p>
      </div>

      {/* Steps List */}
      <div style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}>
        {STEP_ORDER.filter(step => step !== "landing").map((step, index) => {
          const status = getStepStatus(step, activeStep, new Set(
            Object.entries(steps)
              .filter(([_, state]) => state.status === "completed")
              .map(([step]) => step as PipelineStep)
          ));

          const isClickable = status !== "locked";
          const isActive = status === "active";
          const isCompleted = status === "completed";

          return (
            <motion.div
              key={step}
              onClick={() => isClickable && handleStepClick(step)}
              initial={false}
              animate={status}
              variants={isClickable ? railStatusVariants : {}}
              whileHover={isClickable ? { scale: 1.02 } : {}}
              style={{
                padding: "12px 16px",
                background: isActive
                  ? "rgba(139, 92, 246, 0.1)"
                  : isCompleted
                    ? "rgba(255, 255, 255, 0.02)"
                    : "transparent",
                border: isActive
                  ? "1px solid var(--accent-primary)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                cursor: isClickable ? "pointer" : "not-allowed",
                position: "relative",
                opacity: status === "locked" ? 0.4 : 1,
                boxShadow: isActive ? "0 0 12px rgba(139, 92, 246, 0.3)" : "none",
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}>
                {/* Status Icon */}
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    background: isCompleted
                      ? "var(--accent-primary)"
                      : isActive
                        ? "var(--accent-primary)"
                        : "rgba(255, 255, 255, 0.05)",
                    border: isActive
                      ? "1px solid var(--accent-primary)"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: isCompleted || isActive ? "white" : "var(--text-dim)",
                    fontFamily: "var(--font-mono)",
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? (
                    <motion.span
                      initial="initial"
                      animate="animate"
                      variants={checkmarkVariants}
                      style={{ display: "block" }}
                    >
                      ✓
                    </motion.span>
                  ) : status === "locked" ? (
                    <span>🔒</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--foreground)" : isCompleted ? "var(--text-dim)" : "var(--text-muted)",
                    fontFamily: "var(--font-body)",
                    marginBottom: "4px",
                  }}>
                    {STEP_LABELS[step]}
                  </div>
                  <div style={{
                    fontSize: "11px",
                    color: "var(--text-dim)",
                    fontFamily: "var(--font-body)",
                    lineHeight: "1.4",
                  }}>
                    {STEP_DESCRIPTIONS[step]}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
