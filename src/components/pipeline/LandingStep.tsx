"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePipelineContext } from "@/store/PipelineContext";
import Button from "@/components/ui/Button";
import { heroIdVariants, stepVariants } from "@/lib/motion";

export default function LandingStep() {
  const { activeStep, steps, completeStep } = usePipelineContext();
  const [isExiting, setIsExiting] = useState(false);
  const isActive = activeStep === "landing";
  const isCompleted = steps.landing.status === "completed";

  useEffect(() => {
    if (isCompleted && !isExiting) {
      setIsExiting(true);
    }
  }, [isCompleted, isExiting]);

  const handleBegin = () => {
    setIsExiting(true);
    setTimeout(() => {
      completeStep("landing");
    }, 300);
  };

  if (!isActive && isCompleted) {
    return null;
  }

  return (
    <motion.div
      initial="initial"
      animate={isExiting ? "exit" : "animate"}
      exit="exit"
      variants={stepVariants}
      style={{
        position: isActive ? "fixed" : "relative",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#2a2a2a",
        zIndex: isActive ? 1000 : 1,
        padding: "var(--spacing-3xl)",
      }}
    >
      {/* Label Column */}
      <div className="label-column" style={{
        maxWidth: "600px",
        width: "100%",
      }}>
        {/* Band 1: Brand mark */}
        <div className="band" style={{
          paddingBottom: "var(--spacing-md)",
          borderBottom: "1px solid var(--ink-black)",
        }}>
          <div className="label-text" style={{
            fontSize: "var(--font-size-xs)",
            letterSpacing: "1.2px",
          }}>
            VERBA
          </div>
        </div>

        {/* Band 2: Hero identifier */}
        <div className="band" style={{
          paddingTop: "var(--spacing-2xl)",
          paddingBottom: "var(--spacing-xl)",
        }}>
          <motion.div
            variants={heroIdVariants}
            initial="initial"
            animate="animate"
            className="hero-id"
          >
            CASE-READY
          </motion.div>
        </div>

        {/* Band 3: Headline */}
        <div className="band" style={{
          paddingTop: 0,
          paddingBottom: "var(--spacing-md)",
        }}>
          <h2 style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: 600,
            lineHeight: "1.3",
            color: "var(--ink-black)",
            margin: 0,
            fontFamily: "var(--font-body)",
          }}>
            Tell your side.
          </h2>
        </div>

        {/* Band 4: Subtext */}
        <div className="band" style={{
          paddingTop: 0,
          paddingBottom: "var(--spacing-2xl)",
          borderBottom: "none",
        }}>
          <p style={{
            fontSize: "var(--font-size-base)",
            color: "var(--text-dim)",
            lineHeight: "1.6",
            margin: 0,
            fontFamily: "var(--font-body)",
          }}>
            We'll structure it, check evidence, and produce a clear outcome.
          </p>
        </div>

        {/* Band 5: CTA */}
        <div className="band" style={{
          paddingTop: "var(--spacing-xl)",
          paddingBottom: "var(--spacing-xl)",
          borderTop: "1px solid var(--ink-black)",
          textAlign: "center",
        }}>
          <Button onClick={handleBegin} size="lg">
            Begin
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
