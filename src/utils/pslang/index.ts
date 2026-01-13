/**
 * PSLang Wrapper - Main Entry Point
 * Tries LIVE adapter first, falls back to FALLBACK parser if needed
 */

import { ParsedIntent, PSLangNotConfiguredError } from "./types";
import { parseLive } from "./liveAdapter";
import { parseFallback } from "./fallbackParser";

export interface ParseResult {
  mode: "LIVE" | "FALLBACK";
  parsed: ParsedIntent;
}

/**
 * Parse intent text using PSLang (LIVE) or fallback parser
 * Never crashes the UI - always returns a result
 */
export async function parsePSLang(
  text: string,
  langHint?: "en" | "hi" | "ta"
): Promise<ParseResult> {
  // Try LIVE adapter first
  try {
    const parsed = await parseLive(text, langHint);
    return {
      mode: "LIVE",
      parsed,
    };
  } catch (error) {
    // If PSLang not configured or API fails, use fallback
    if (error instanceof PSLangNotConfiguredError || error instanceof Error) {
      const parsed = parseFallback(text, langHint);
      return {
        mode: "FALLBACK",
        parsed,
      };
    }
    
    // Safety fallback (should never reach here)
    const parsed = parseFallback(text, langHint);
    return {
      mode: "FALLBACK",
      parsed,
    };
  }
}

/**
 * Generate intent hash from normalized text
 * Uses SHA-256 for deterministic hashing
 */
export async function generateIntentHash(normalizedText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedText);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return "0x" + hashHex;
}

