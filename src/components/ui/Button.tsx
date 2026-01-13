"use client";

import { ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";
import { buttonIndustrialVariants } from "@/lib/motion";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "red" | "ghost";
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
  className?: string;
}

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  style,
  className,
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    padding: size === "sm" ? "8px 16px" : size === "md" ? "12px 24px" : "16px 32px",
    fontSize: size === "sm" ? "12px" : size === "md" ? "14px" : "16px",
    fontWeight: 600,
    border: "2px solid var(--ink-black)",
    borderRadius: "2px",
    cursor: disabled ? "not-allowed" : "pointer",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    opacity: disabled ? 0.5 : 1,
    transition: "all 120ms ease-out",
    boxShadow: "none",
    ...style,
  };

  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      background: "var(--ink-black)",
      color: "var(--paper-cream)",
      border: "2px solid var(--ink-black)",
    },
    secondary: {
      background: "var(--paper-cream)",
      color: "var(--ink-black)",
      border: "2px solid var(--ink-black)",
    },
    red: {
      background: "var(--bg-red)",
      color: "white",
      border: "2px solid var(--ink-black)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-dim)",
      border: "1px solid transparent",
    },
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ ...baseStyle, ...variantStyles[variant] }}
      whileHover={disabled ? {} : { y: -1, boxShadow: "0 1px 3px rgba(17, 17, 17, 0.15)" }}
      whileTap={disabled ? {} : { y: 1, scale: 0.99 }}
    >
      {children}
    </motion.button>
  );
}
