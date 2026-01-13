"use client";

import { ReactNode, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export default function MagneticButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    const maxDistance = 50;
    const strength = 0.3;

    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        position: "relative",
        zIndex: 20, // Ensure button is above other elements
        x: xSpring,
        y: ySpring,
        padding: "16px 32px",
        borderRadius: "8px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--font-body)",
        fontSize: "16px",
        background: variant === "primary" 
          ? "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)"
          : "rgba(255, 255, 255, 0.05)",
        color: "white",
        boxShadow: variant === "primary" 
          ? "0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)"
          : "none",
        backdropFilter: variant === "secondary" ? "blur(20px)" : "none",
        WebkitBackdropFilter: variant === "secondary" ? "blur(20px)" : "none",
        border: variant === "secondary" ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
        opacity: disabled ? 0.5 : 1,
      }}
      className={className}
      whileHover={disabled ? {} : { 
        scale: 1.05,
        boxShadow: variant === "primary"
          ? "0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)"
          : "0 0 15px rgba(236, 72, 153, 0.3)",
      }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

