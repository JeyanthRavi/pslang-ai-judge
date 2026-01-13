"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export default function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div 
      className={`bento-grid ${className}`}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px",
        padding: "32px",
      }}
    >
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: ReactNode;
  span?: "1" | "2" | "3" | "4";
  className?: string;
}

export function BentoItem({ children, span = "1", className = "" }: BentoItemProps) {
  const spanMap = { "1": 1, "2": 2, "3": 3, "4": 4 };
  
  return (
    <motion.div
      className={`bento-item ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        gridColumn: `span ${spanMap[span]}`,
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        padding: "32px",
        transition: "all 0.3s ease",
      }}
      whileHover={{
        transform: "translateY(-4px)",
        boxShadow: "0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)",
      }}
    >
      {children}
    </motion.div>
  );
}

