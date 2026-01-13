"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { lockBadgeVariants } from "@/lib/motion";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "sealed" | "verified" | "locked" | "warning" | "info" | "success";
  animate?: boolean;
}

export default function Badge({ children, variant = "default", animate = false }: BadgeProps) {
  const baseStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "4px 10px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    borderRadius: "2px",
    fontFamily: "var(--font-mono)",
    border: "1px solid var(--ink-black)",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: "var(--paper-cream)",
      color: "var(--ink-black)",
    },
    sealed: {
      background: "var(--bg-red)",
      color: "white",
    },
    verified: {
      background: "var(--bg-mustard)",
      color: "var(--ink-black)",
    },
    locked: {
      background: "var(--paper-cream)",
      color: "var(--ink-black)",
    },
    warning: {
      background: "var(--bg-orange)",
      color: "white",
    },
    info: {
      background: "var(--paper-cream)",
      color: "var(--ink-black)",
    },
    success: {
      background: "var(--bg-mustard)",
      color: "var(--ink-black)",
    },
  };

  const content = (
    <span style={{ ...baseStyle, ...variantStyles[variant] }}>
      {children}
    </span>
  );

  if (animate) {
    return (
      <motion.span
        initial="initial"
        animate="animate"
        variants={lockBadgeVariants}
        style={{ display: "inline-block" }}
      >
        {content}
      </motion.span>
    );
  }

  return content;
}
