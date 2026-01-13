"use client";

import { ReactNode } from "react";
import { PipelineProvider } from "@/store/PipelineContext";
import { WalletProvider } from "./WalletProvider";

/**
 * Global App Providers
 * Wraps all routes with necessary providers (Pipeline, Wallet, etc.)
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <PipelineProvider>
        {children}
      </PipelineProvider>
    </WalletProvider>
  );
}

