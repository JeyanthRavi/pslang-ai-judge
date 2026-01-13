"use client";

import { useState, useEffect } from "react";
import { usePipelineContext } from "@/store/PipelineContext";
import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import { getAllIntegrationStatuses } from "@/lib/integrationStatus";
import { VERDICT_CONTRACT_ADDRESS } from "@/lib/chains";

// Conditionally import wagmi only in MetaMask mode
const walletMode = process.env.NEXT_PUBLIC_WALLET_MODE || "relayer";
const useMetaMask = walletMode === "metamask";

let useAccount: any;
if (useMetaMask) {
  useAccount = require("wagmi").useAccount;
}

export default function ReviewModeDrawer() {
  const { getStepData, demoMode, incoMode, reviewBuildMode } = usePipelineContext();
  const wagmiAccount = useMetaMask ? useAccount() : { address: undefined, chainId: undefined, isConnected: false };
  const { address, chainId, isConnected } = wagmiAccount;
  const [isOpen, setIsOpen] = useState(reviewBuildMode); // Auto-open if Review Build Mode is ON
  const [judgeLatency, setJudgeLatency] = useState<number | null>(null);
  
  // Auto-open drawer when Review Build Mode is enabled
  useEffect(() => {
    if (reviewBuildMode) {
      setIsOpen(true);
    }
  }, [reviewBuildMode]);

  const intentData = getStepData("intent");
  const pslangData = getStepData("pslang");
  const evidenceData = getStepData("evidence");
  const deliberationData = getStepData("deliberation");

  const transcriptLength = intentData?.content?.length || 0;
  const pslangHash = pslangData?.hash || "N/A";
  const evidenceCount = evidenceData?.files?.length || 0;
  
  // Judge endpoint (always local)
  const judgeEndpoint = "Local /api/judge";
  
  // Get verdict tx hash if exists
  const verdictData = getStepData("deliberation");
  const txHash = verdictData?.txHash || null;
  
  // Get agreement data if exists
  const agreementData = getStepData("agreement");
  const agreementTxHash = agreementData?.txHash || null;
  const agreementVerified = agreementData?.verified || false;
  
  // Compute integration statuses
  const statuses = getAllIntegrationStatuses({
    walletConnected: isConnected,
    chainId,
    contractAddress: VERDICT_CONTRACT_ADDRESS,
    txHash,
    demoMode,
    walletMode,
    agreementTxHash,
    agreementVerified,
    incoMode,
    incoEndpointConfigured: false, // Always LOCAL_PROOF unless configured
  });
  
  useEffect(() => {
    const latency = localStorage.getItem("judgeLatency");
    if (latency) {
      setJudgeLatency(parseInt(latency, 10));
    }
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: "80px",
          right: "20px",
          zIndex: 100,
          padding: "8px 14px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-dim)",
          borderRadius: "2px",
          color: "var(--text-dim)",
          fontSize: "11px",
          fontWeight: 600,
          cursor: "pointer",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Review Mode
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            position: "fixed",
            top: "120px",
            right: "20px",
            width: "300px",
            maxHeight: "calc(100vh - 160px)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-dim)",
            borderRadius: "4px",
            padding: "20px",
            zIndex: 99,
            overflowY: "auto",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}>
            <h3 style={{
              fontSize: "14px",
              fontWeight: 600,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Proof Drawer
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-dim)",
                cursor: "pointer",
                fontSize: "18px",
                padding: 0,
                width: "24px",
                height: "24px",
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-dim)",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}>
                Transcript
              </div>
              <div style={{
                fontSize: "13px",
                color: "var(--foreground)",
                fontFamily: "var(--font-mono)",
              }}>
                {transcriptLength} characters
              </div>
            </div>

            <div>
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-dim)",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}>
                PSLang Hash
              </div>
              <div style={{
                fontSize: "11px",
                color: "var(--foreground)",
                fontFamily: "var(--font-mono)",
                wordBreak: "break-all",
              }}>
                {pslangHash.slice(0, 20)}...
              </div>
            </div>

            <div>
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-dim)",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}>
                Evidence
              </div>
              <div style={{
                fontSize: "13px",
                color: "var(--foreground)",
              }}>
                {evidenceCount} file(s)
              </div>
            </div>

            <div>
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-dim)",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}>
                Mode
              </div>
              <Badge variant={demoMode ? "warning" : "info"}>
                {demoMode ? "Demo" : "Live"}
              </Badge>
            </div>

            <div>
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-dim)",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}>
                Wallet Mode
              </div>
              <Badge variant="default">
                {walletMode === "metamask" ? "MetaMask" : "Relayer"}
              </Badge>
              {walletMode !== "metamask" && (
                <div style={{
                  fontSize: "10px",
                  color: "var(--text-dim)",
                  marginTop: "4px",
                }}>
                  Simulated Parties: ON
                </div>
              )}
            </div>

            <div>
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-dim)",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}>
                Judge Backend
              </div>
              <div style={{
                fontSize: "11px",
                color: "var(--foreground)",
                fontFamily: "var(--font-mono)",
                marginBottom: "4px",
              }}>
                {judgeEndpoint}
              </div>
              {judgeLatency && (
                <div style={{
                  fontSize: "10px",
                  color: "var(--text-dim)",
                }}>
                  Latency: {judgeLatency}ms
                </div>
              )}
            </div>

            <div>
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-dim)",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}>
                Shardeum
              </div>
              <Badge variant={statuses.shardeum === "LIVE" ? "success" : "warning"}>
                {statuses.shardeum}
              </Badge>
              {isConnected && (
                <div style={{
                  fontSize: "10px",
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-mono)",
                  marginTop: "4px",
                }}>
                  {address?.slice(0, 6)}...{address?.slice(-4)} • {chainId === 8082 ? "Sphinx" : chainId}
                </div>
              )}
            </div>

            <div>
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-dim)",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}>
                INCO
              </div>
              <Badge variant={statuses.inco === "LIVE" ? "success" : "info"}>
                {statuses.inco}
              </Badge>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

