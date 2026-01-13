"use client";

import { ReactNode } from "react";
import { PipelineProvider } from "@/store/PipelineContext";
import { WalletProvider } from "./WalletProvider";
import { SimulatedPartiesProvider } from "./SimulatedPartiesProvider";

/**
 * Global App Providers
 * Wraps all routes with necessary providers (Pipeline, Wallet, SimulatedParties, etc.)
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const walletMode = process.env.NEXT_PUBLIC_WALLET_MODE || "relayer";
  
  // Only wrap with WalletProvider if using MetaMask mode
  if (walletMode === "metamask") {
    return (
      <WalletProvider>
        <SimulatedPartiesProvider>
          <PipelineProvider>
            {children}
          </PipelineProvider>
        </SimulatedPartiesProvider>
      </WalletProvider>
    );
  }

  // Relayer mode: no WalletProvider needed
  return (
    <SimulatedPartiesProvider>
      <PipelineProvider>
        {children}
      </PipelineProvider>
    </SimulatedPartiesProvider>
  );
}

