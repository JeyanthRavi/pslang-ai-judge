"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import { stepVariants } from "@/lib/motion";

interface StepShellProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode; // For badges (Demo/INCO/Review Build)
  children: ReactNode;
  actions?: ReactNode; // Footer action buttons
  isActive?: boolean;
  isCompleted?: boolean;
}

export default function StepShell({
  title,
  subtitle,
  rightSlot,
  children,
  actions,
  isActive = true,
  isCompleted = false,
}: StepShellProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={stepVariants}
      style={{
        width: "100%",
        opacity: isActive ? 1 : isCompleted ? 0.6 : 0.4,
      }}
    >
      <GlassCard
        glow={isActive}
        style={{
          padding: 0,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 32px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            background: isActive
              ? "rgba(139, 92, 246, 0.05)"
              : "transparent",
          }}
        >
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 600,
                marginBottom: subtitle ? "8px" : 0,
                letterSpacing: "-0.01em",
                color: "var(--foreground)",
                fontFamily: "var(--font-hero)",
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-dim)",
                  margin: 0,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {rightSlot && (
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              {rightSlot}
            </div>
          )}
        </div>

        {/* Body */}
        <div
          style={{
            padding: "32px",
            minHeight: "400px",
          }}
        >
          {children}
        </div>

        {/* Footer Actions */}
        {actions && (
          <div
            style={{
              padding: "24px 32px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              background: "rgba(0, 0, 0, 0.2)",
            }}
          >
            {actions}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

