/**
 * PSLang-compatible types
 * These types match the PSLang API structure for seamless integration
 */

export interface IntentParty {
  name?: string;
  address?: string;
  role: "CLIENT" | "PROVIDER";
}

export interface Money {
  value: number;
  currency: "INR" | "ETH" | "SHM";
}

export interface ParsedIntent {
  rawText: string;
  normalizedText: string;
  language: "en" | "hi" | "ta" | "unknown";
  task?: string;
  parties: IntentParty[];
  amount?: Money;
  deadlineISO?: string; // ISO date/time if found
  durationHours?: number; // if user says "for 3 days"
  conditions: string[]; // bullet list
  confidence: number; // 0-1
  extraction: {
    amountSource?: string;
    deadlineSource?: string;
    partySource?: string;
  };
}

/**
 * Error thrown when PSLang API is not configured
 */
export class PSLangNotConfiguredError extends Error {
  constructor() {
    super("PSLang API not configured. Missing NEXT_PUBLIC_PSLANG_API_URL or NEXT_PUBLIC_PSLANG_API_KEY");
    this.name = "PSLangNotConfiguredError";
  }
}

