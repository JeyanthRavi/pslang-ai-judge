"use client";

import { useState, useEffect } from "react";

interface LandingProps {
  isCompleted: boolean;
  onBegin: () => void;
}

export default function Landing({ isCompleted, onBegin }: LandingProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClick = () => {
    setIsPressing(true);
    setTimeout(() => {
      setIsPressing(false);
      setIsExiting(true);
      setTimeout(() => {
        onBegin();
      }, 300);
    }, 100);
  };

  useEffect(() => {
    if (isCompleted) {
      setIsExiting(true);
    }
  }, [isCompleted]);

  if (isCompleted && !isExiting) {
    return null; // Hide completed landing
  }

  return (
    <div 
      className={isExiting ? "fade-exit-active" : "fade-enter-active"}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        zIndex: 1000,
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? "translateY(-20px)" : "translateY(0)",
        transition: "opacity 300ms ease-out, transform 300ms ease-out",
      }}
    >
      <div style={{
        textAlign: "center",
        maxWidth: "600px",
        padding: "40px",
      }}>
        <h1 style={{
          fontSize: "48px",
          fontWeight: 700,
          marginBottom: "20px",
          letterSpacing: "-0.02em",
          lineHeight: "1.1",
        }}>
          VERBA AI — PSLang Judge
        </h1>
        
        <p style={{
          fontSize: "18px",
          color: "var(--text-dim)",
          marginBottom: "60px",
          lineHeight: "1.6",
        }}>
          Voice → PSLang → AI Judge → Simulated Wallet
        </p>

        <button
          onClick={handleClick}
          className={isPressing ? "btn-press" : ""}
          style={{
            padding: "16px 40px",
            fontSize: "16px",
            fontWeight: 600,
            background: "var(--neon-accent)",
            color: "var(--background)",
            border: "none",
            cursor: "pointer",
            borderRadius: "2px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            transition: "all 200ms ease-out",
            boxShadow: "0 0 30px rgba(0, 255, 136, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 40px rgba(0, 255, 136, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 255, 136, 0.3)";
          }}
        >
          Begin Testimony
        </button>
      </div>
    </div>
  );
}

