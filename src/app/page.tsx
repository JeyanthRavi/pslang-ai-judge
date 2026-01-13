"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import AuroraBackground from "@/components/ui/AuroraBackground";
import GlassCard from "@/components/ui/GlassCard";
import BentoGrid, { BentoItem } from "@/components/ui/BentoGrid";
import MagneticButton from "@/components/ui/MagneticButton";
import ParallaxSection from "@/components/ui/ParallaxSection";
import VerbaHammer from "@/components/hero/VerbaHammer";
import { usePipelineContext } from "@/store/PipelineContext";
import PipelineRail from "@/components/pipeline/PipelineRail";
import LandingStep from "@/components/pipeline/LandingStep";
import IntentStep from "@/components/pipeline/IntentStep";
import PSLangStep from "@/components/pipeline/PSLangStep";
import EvidenceStep from "@/components/pipeline/EvidenceStep";
import DeliberationStep from "@/components/pipeline/DeliberationStep";
import VerdictStep from "@/components/pipeline/VerdictStep";
import AgreementStep from "@/components/pipeline/AgreementStep";
import { AnimatePresence } from "framer-motion";
import DemoModeBadge from "@/components/DemoModeBadge";
import ResetButton from "@/components/ResetButton";
import ReviewModeDrawer from "@/components/ReviewModeDrawer";
import IncoModeToggle from "@/components/IncoModeToggle";
import ReviewBuildModeToggle from "@/components/ReviewBuildModeToggle";
import DemoDataButton from "@/components/DemoDataButton";

function HeroSection() {
  const { navigateToStep, completeStep } = usePipelineContext();

  const handleStartCase = () => {
    console.log("Begin Testimony clicked");
    // Complete landing step and advance to intent
    completeStep("landing");
    // Scroll to demo console if it exists
    setTimeout(() => {
      const demoConsole = document.getElementById("demo-console");
      if (demoConsole) {
        demoConsole.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ padding: "80px 16px" }}
    >
      <AuroraBackground />
      <div 
        className="relative text-center px-4 max-w-6xl mx-auto"
        style={{ 
          zIndex: 10,
          pointerEvents: "auto", // Ensure content can receive clicks
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 
            className="font-bold mb-4" 
            style={{ 
              fontFamily: "var(--font-hero)",
              fontSize: "clamp(48px, 8vw, 96px)",
              lineHeight: "1.1",
            }}
          >
            VERBA
          </h1>
          <p 
            className="mb-2" 
            style={{ 
              color: "var(--text-dim)",
              fontSize: "clamp(18px, 2.5vw, 24px)",
            }}
          >
            Vernacular Trust Protocol
          </p>
          <p 
            className="mb-8" 
            style={{ 
              color: "var(--text-muted)",
              fontSize: "clamp(14px, 1.8vw, 18px)",
            }}
          >
            Turn a complaint into a clear outcome
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex justify-center mb-12"
        >
          <VerbaHammer />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        >
          <MagneticButton
            onClick={handleStartCase}
            variant="primary"
          >
            Start a Case
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}

function FlowBentoSection() {
  const steps = [
    { id: "voice", title: "Voice", description: "Speak your case", icon: "🎤" },
    { id: "pslang", title: "PSLang", description: "Structured intent", icon: "📋" },
    { id: "evidence", title: "Evidence", description: "Upload documents", icon: "📄" },
    { id: "judgment", title: "Judgment", description: "AI deliberation", icon: "⚖️" },
    { id: "settlement", title: "Settlement", description: "On-chain record", icon: "🔗" },
  ];

  return (
    <ParallaxSection speed={0.3}>
      <section style={{ padding: "96px 16px" }}>
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ 
              fontFamily: "var(--font-hero)",
              fontSize: "clamp(32px, 5vw, 48px)",
            }}
          >
            The VERBA Flow
          </motion.h2>
          <BentoGrid>
            {steps.map((step, index) => (
              <BentoItem key={step.id} span={index === 0 || index === 3 ? "2" : "1"}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>{step.icon}</div>
                  <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>{step.title}</h3>
                  <p style={{ color: "var(--text-dim)", fontSize: "14px" }}>{step.description}</p>
                </div>
              </BentoItem>
            ))}
          </BentoGrid>
        </div>
      </section>
    </ParallaxSection>
  );
}

function DemoConsoleSection() {
  const { activeStep, reviewBuildMode } = usePipelineContext();

  return (
    <ParallaxSection speed={0.2}>
      <section id="demo-console" style={{ padding: "96px 16px" }}>
        <div className="max-w-7xl mx-auto">
          {activeStep === "landing" && (
            <motion.h2
              className="font-bold text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ 
                fontFamily: "var(--font-hero)",
                fontSize: "clamp(32px, 5vw, 48px)",
              }}
            >
              Try VERBA
            </motion.h2>
          )}
          <GlassCard glow style={{ minHeight: "600px" }}>
            <div style={{ display: "flex", minHeight: "600px" }}>
              <PipelineRail />
              <div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
                <AnimatePresence mode="wait">
                  {activeStep === "landing" && <LandingStep key="landing" />}
                  {activeStep === "intent" && <IntentStep key="intent" />}
                  {activeStep === "pslang" && <PSLangStep key="pslang" />}
                  {activeStep === "evidence" && <EvidenceStep key="evidence" />}
                  {activeStep === "deliberation" && <DeliberationStep key="deliberation" />}
                  {activeStep === "verdict" && <VerdictStep key="verdict" />}
                  {activeStep === "agreement" && <AgreementStep key="agreement" />}
                </AnimatePresence>
              </div>
            </div>
          </GlassCard>
          <DemoModeBadge />
          <IncoModeToggle />
          <ReviewBuildModeToggle />
          <DemoDataButton />
          <ResetButton />
          {reviewBuildMode && <ReviewModeDrawer />}
        </div>
      </section>
    </ParallaxSection>
  );
}

function SponsorsSection() {
  const sponsors = [
    {
      name: "PSLang",
      by: "ThinkRoot",
      description: "Intent translation layer",
      status: "Integrated via Adapter Layer",
    },
    {
      name: "Shardeum",
      description: "EVM-compatible settlement",
      status: "EVM Settlement Preview",
    },
  ];

  return (
    <ParallaxSection speed={0.4}>
      <section style={{ padding: "96px 16px" }}>
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ 
              fontFamily: "var(--font-hero)",
              fontSize: "clamp(32px, 5vw, 48px)",
            }}
          >
            Powered By
          </motion.h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}>
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard hover>
                  <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>{sponsor.name}</h3>
                  {sponsor.by && (
                    <p style={{ fontSize: "14px", marginBottom: "8px", color: "var(--text-dim)" }}>
                      by {sponsor.by}
                    </p>
                  )}
                  <p style={{ marginBottom: "16px", color: "var(--text-dim)", fontSize: "14px" }}>
                    {sponsor.description}
                  </p>
                  <span style={{ 
                    fontSize: "11px", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.5px",
                    color: "var(--text-muted)" 
                  }}>
                    {sponsor.status}
                  </span>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </ParallaxSection>
  );
}

function Footer() {
  return (
    <footer style={{ 
      padding: "48px 16px", 
      borderTop: "1px solid rgba(255, 255, 255, 0.1)" 
    }}>
      <div className="max-w-7xl mx-auto text-center">
        <p style={{ 
          fontSize: "14px", 
          marginBottom: "16px", 
          color: "var(--text-dim)" 
        }}>
          VERBA: Vernacular Trust Protocol
        </p>
        <p style={{ 
          fontSize: "12px", 
          color: "var(--text-muted)" 
        }}>
          Demo mode: no real funds moved
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  const { activeStep } = usePipelineContext();

  // Always show full page layout - hero when on landing, demo console embedded
  return (
    <div className="relative min-h-screen" style={{ background: "var(--bg-dark)" }}>
      {activeStep === "landing" && <HeroSection />}
      {activeStep === "landing" && <FlowBentoSection />}
      <DemoConsoleSection />
      {activeStep === "landing" && <SponsorsSection />}
      {activeStep === "landing" && <Footer />}
    </div>
  );
}
