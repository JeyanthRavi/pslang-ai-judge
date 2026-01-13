"use client";

import { useState } from "react";

interface IntegrationProofDrawerProps {
  shardeumTxHash?: string;
  incoMode?: "on" | "off" | "demo";
  incoContractAddress?: string;
}

export default function IntegrationProofDrawer({
  shardeumTxHash,
  incoMode = "off",
  incoContractAddress,
}: IntegrationProofDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 100,
          padding: "10px 16px",
          background: "var(--bg-dim)",
          border: "1px solid var(--neon-accent)",
          borderRadius: "2px",
          color: "var(--neon-accent)",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          boxShadow: "0 0 10px rgba(0, 255, 136, 0.2)",
        }}
      >
        Integration Proof
      </button>

      {/* Drawer */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: "60px",
            right: "20px",
            width: "320px",
            maxHeight: "calc(100vh - 100px)",
            background: "var(--bg-dim)",
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
              fontSize: "16px",
              fontWeight: 600,
              margin: 0,
            }}>
              Integration Proof
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-dim)",
                cursor: "pointer",
                fontSize: "20px",
                padding: 0,
                width: "24px",
                height: "24px",
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Shardeum */}
            <div>
              <div style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-dim)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Shardeum
              </div>
              {shardeumTxHash ? (
                <>
                  <div style={{
                    fontSize: "11px",
                    color: "var(--foreground)",
                    fontFamily: "var(--font-mono)",
                    marginBottom: "8px",
                    wordBreak: "break-all",
                  }}>
                    {shardeumTxHash.slice(0, 20)}...
                  </div>
                  <a
                    href={`https://explorer-sphinx.shardeum.org/tx/${shardeumTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "11px",
                      color: "var(--neon-accent)",
                      textDecoration: "none",
                    }}
                  >
                    View on Explorer →
                  </a>
                </>
              ) : (
                <div style={{
                  fontSize: "11px",
                  color: "var(--text-dim)",
                }}>
                  No transaction yet
                </div>
              )}
            </div>

            {/* INCO */}
            <div>
              <div style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-dim)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                INCO Mode
              </div>
              <div style={{
                fontSize: "11px",
                color: incoMode === "on" ? "var(--neon-accent)" : "var(--text-dim)",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}>
                {incoMode === "on" ? "ON" : incoMode === "demo" ? "DEMO" : "OFF"}
              </div>
              {incoContractAddress && (
                <div style={{
                  fontSize: "11px",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-mono)",
                  wordBreak: "break-all",
                }}>
                  {incoContractAddress.slice(0, 20)}...
                </div>
              )}
            </div>

            {/* Link to full page */}
            <div style={{
              marginTop: "8px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border-dim)",
            }}>
              <a
                href="/integrations"
                style={{
                  fontSize: "12px",
                  color: "var(--neon-accent)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                View Full Details →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

