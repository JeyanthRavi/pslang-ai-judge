/**
 * PSLang Live Adapter
 * Calls real PSLang API when configured
 * Gracefully handles missing configuration
 */

import { ParsedIntent, PSLangNotConfiguredError } from "./types";

/**
 * Parse intent using live PSLang API
 * Throws PSLangNotConfiguredError if API is not configured
 */
export async function parseLive(
  text: string,
  langHint?: "en" | "hi" | "ta"
): Promise<ParsedIntent> {
  const apiUrl = process.env.NEXT_PUBLIC_PSLANG_API_URL;
  const apiKey = process.env.NEXT_PUBLIC_PSLANG_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new PSLangNotConfiguredError();
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text,
        lang: langHint || "en",
      }),
    });

    if (!response.ok) {
      throw new Error(`PSLang API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Map PSLang API response to ParsedIntent
    // Adjust mapping based on actual PSLang API response structure
    return {
      rawText: text,
      normalizedText: data.normalizedText || text.trim(),
      language: data.language || langHint || "en",
      task: data.task,
      parties: (data.parties || []).map((p: any) => ({
        name: p.name,
        address: p.address,
        role: p.role || "CLIENT",
      })),
      amount: data.amount
        ? {
            value: data.amount.value,
            currency: data.amount.currency || "INR",
          }
        : undefined,
      deadlineISO: data.deadlineISO,
      durationHours: data.durationHours,
      conditions: data.conditions || [],
      confidence: data.confidence || 0.8,
      extraction: {
        amountSource: data.extraction?.amountSource,
        deadlineSource: data.extraction?.deadlineSource,
        partySource: data.extraction?.partySource,
      },
    };
  } catch (error) {
    if (error instanceof PSLangNotConfiguredError) {
      throw error;
    }
    // Network or API errors: rethrow to trigger fallback
    throw new Error(`PSLang API call failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

