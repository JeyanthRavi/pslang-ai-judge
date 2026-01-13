"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSimulatedParties, SimulatedParty } from "@/lib/simulatedSigner";

interface SimulatedPartiesContextValue {
  partyA: SimulatedParty;
  partyB: SimulatedParty;
  refresh: () => void;
}

const SimulatedPartiesContext = createContext<SimulatedPartiesContextValue | undefined>(undefined);

export function SimulatedPartiesProvider({ children }: { children: ReactNode }) {
  const [parties, setParties] = useState<{ partyA: SimulatedParty; partyB: SimulatedParty } | null>(null);

  const loadParties = () => {
    const loaded = getSimulatedParties();
    setParties(loaded);
  };

  useEffect(() => {
    loadParties();
  }, []);

  if (!parties) {
    // Return defaults while loading
    return <>{children}</>;
  }

  return (
    <SimulatedPartiesContext.Provider
      value={{
        partyA: parties.partyA,
        partyB: parties.partyB,
        refresh: loadParties,
      }}
    >
      {children}
    </SimulatedPartiesContext.Provider>
  );
}

export function useSimulatedParties() {
  const context = useContext(SimulatedPartiesContext);
  if (!context) {
    throw new Error("useSimulatedParties must be used within SimulatedPartiesProvider");
  }
  return context;
}

