"use client";

import { usePipelineContext } from "@/store/PipelineContext";
import { getAllIntegrationStatuses } from "@/lib/integrationStatus";
import { VERDICT_CONTRACT_ADDRESS } from "@/lib/chains";

// Conditionally import wagmi only in MetaMask mode
const walletMode = process.env.NEXT_PUBLIC_WALLET_MODE || "relayer";
const useMetaMask = walletMode === "metamask";

let useAccount: any;
if (useMetaMask) {
  useAccount = require("wagmi").useAccount;
}

export default function IntegrationsPage() {
  const wagmiAccount = useMetaMask ? useAccount() : { isConnected: false, chainId: undefined };
  const { isConnected, chainId } = wagmiAccount;
  const { demoMode, incoMode, getStepData } = usePipelineContext();
  
  // Safely get verdict data (may be empty if pipeline not started)
  const verdictData = getStepData("deliberation");
  const txHash = verdictData?.txHash || null;
  
  // Get agreement data
  const agreementData = getStepData("agreement");
  const agreementTxHash = agreementData?.txHash || null;
  const agreementVerified = agreementData?.verified || false;
  
  const statuses = getAllIntegrationStatuses({
    walletConnected: isConnected || false,
    chainId,
    contractAddress: VERDICT_CONTRACT_ADDRESS,
    txHash,
    demoMode,
    walletMode,
    agreementTxHash,
    agreementVerified,
    incoMode,
    incoEndpointConfigured: false,
  });
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--background)",
      padding: "60px 40px",
      maxWidth: "1200px",
      margin: "0 auto",
    }}>
      <h1 style={{
        fontSize: "36px",
        fontWeight: 700,
        marginBottom: "40px",
        letterSpacing: "-0.02em",
      }}>
        Integration Status
      </h1>

      <div style={{
        display: "grid",
        gap: "30px",
      }}>
        {/* ThinkRoot Integration */}
        <div style={{
          padding: "30px",
          background: "var(--bg-dim)",
          border: "1px solid var(--border-dim)",
          borderRadius: "4px",
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 600,
            marginBottom: "12px",
          }}>
            ThinkRoot — Perception + Intent Translation
          </h2>
          <div style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}>
            <span style={{
              padding: "6px 12px",
              background: "var(--bg-dim)",
              border: "1px solid var(--border-dim)",
              borderRadius: "2px",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}>
              Status: ⏳ Pending
            </span>
            <span style={{
              padding: "6px 12px",
              background: "var(--bg-dim)",
              border: "1px solid var(--border-dim)",
              borderRadius: "2px",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}>
              Used in: Intent, PSLang
            </span>
          </div>
          <p style={{
            color: "var(--text-dim)",
            lineHeight: "1.6",
            marginBottom: "16px",
          }}>
            Voice-first testimony capture and PSLang-style structured intent visualization.
            Proof: UI flow demonstrates voice-to-intent translation.
          </p>
          <button
            onClick={() => window.location.href = "/"}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              background: "var(--neon-accent)",
              color: "var(--background)",
              border: "none",
              borderRadius: "2px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            View in Pipeline →
          </button>
        </div>

        {/* Shardeum Integration */}
        <div style={{
          padding: "30px",
          background: "var(--bg-dim)",
          border: "1px solid var(--border-dim)",
          borderRadius: "4px",
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 600,
            marginBottom: "12px",
          }}>
            Shardeum — Settlement + Receipt on Chain
          </h2>
          <div style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}>
            <span style={{
              padding: "6px 12px",
              background: "var(--bg-dim)",
              border: "1px solid var(--border-dim)",
              borderRadius: "2px",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}>
              Status: {statuses.shardeum}
            </span>
            <span style={{
              padding: "6px 12px",
              background: "var(--bg-dim)",
              border: "1px solid var(--border-dim)",
              borderRadius: "2px",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}>
              Used in: Wallet/Settlement
            </span>
          </div>
          <p style={{
            color: "var(--text-dim)",
            lineHeight: "1.6",
            marginBottom: "16px",
          }}>
            On-chain verdict recording on Shardeum Sphinx testnet (chainId 8082).
            Proof: Transaction hash + explorer link displayed after settlement.
          </p>
          {process.env.NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS && (
            <div style={{
              padding: "12px",
              background: "var(--background)",
              border: "1px solid var(--border-dim)",
              borderRadius: "2px",
              marginTop: "16px",
            }}>
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-dim)",
                marginBottom: "8px",
              }}>
                Contract Address
              </div>
              <div style={{
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                color: "var(--foreground)",
                wordBreak: "break-all",
                marginBottom: "8px",
              }}>
                {process.env.NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS}
              </div>
              <a
                href={`https://explorer-sphinx.shardeum.org/address/${process.env.NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "12px",
                  color: "var(--neon-accent)",
                  textDecoration: "none",
                }}
              >
                View on Explorer →
              </a>
            </div>
          )}
        </div>

        {/* INCO Integration */}
        <div style={{
          padding: "30px",
          background: "var(--bg-dim)",
          border: "1px solid var(--border-dim)",
          borderRadius: "4px",
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 600,
            marginBottom: "12px",
          }}>
            INCO — Confidential Evaluation
          </h2>
          <div style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}>
            <span style={{
              padding: "6px 12px",
              background: "var(--bg-dim)",
              border: "1px solid var(--border-dim)",
              borderRadius: "2px",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}>
              Status: {statuses.inco}
            </span>
            <span style={{
              padding: "6px 12px",
              background: "var(--bg-dim)",
              border: "1px solid var(--border-dim)",
              borderRadius: "2px",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}>
              Used in: Deliberation/Verdict
            </span>
          </div>
          <p style={{
            color: "var(--text-dim)",
            lineHeight: "1.6",
            marginBottom: "16px",
          }}>
            Confidential smart contracts for privacy-preserved evaluation. Evidence and amounts treated as confidential inputs.
            Proof: Contract address + "Privacy-Preserved Evaluation" badge on Verdict step.
          </p>
          <div style={{
            padding: "12px",
            background: "var(--background)",
            border: "1px solid var(--border-dim)",
            borderRadius: "2px",
            marginTop: "16px",
          }}>
            <div style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-dim)",
              marginBottom: "8px",
            }}>
              Implementation Status
            </div>
            <div style={{
              fontSize: "12px",
              color: "var(--foreground)",
              lineHeight: "1.6",
            }}>
              • INCO adapter structure in place<br/>
              • Confidential receipt generation<br/>
              • Ready for INCO SDK integration<br/>
              • Toggle available in UI (top-right)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

