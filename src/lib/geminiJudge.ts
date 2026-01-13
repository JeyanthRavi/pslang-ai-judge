/**
 * Gemini-backed judge for intelligent verdict reasoning
 * Uses Gemini 1.5 Flash for fast, evidence-cited decisions
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeminiJudgeInput {
  transcript: string;
  caseSummary: {
    actor: string;
    claim: string;
    value?: string;
    context: string;
  };
  evidenceFiles: Array<{
    filename: string;
    extractedFields?: {
      invoiceNumber?: string;
      date?: string;
      amount?: string;
      currency?: string;
      parties?: string[];
      keywords?: string[];
    };
    summary?: string;
  }>;
  ruleSignals: {
    evidenceStrength: number;
    amountMatch: boolean;
    amountDifference?: number;
    missingProof: string[];
  };
}

interface GeminiJudgeOutput {
  decision: "APPROVE" | "PARTIAL" | "REJECT";
  confidence: number;
  rationale: string[];
  citations?: Array<{ file: string; quoteOrField: string }>;
}

/**
 * Judge case using Gemini AI
 * Returns structured verdict with evidence citations
 */
export async function judgeWithGemini(
  input: GeminiJudgeInput,
  apiKey: string,
  timeoutMs: number = 8000
): Promise<GeminiJudgeOutput> {
  const { transcript, caseSummary, evidenceFiles, ruleSignals } = input;

  // Build evidence summary (only extracted fields, not full text)
  const evidenceSummary = evidenceFiles.map((file) => {
    const fields = file.extractedFields || {};
    const parts: string[] = [];
    
    if (fields.invoiceNumber) parts.push(`Invoice: ${fields.invoiceNumber}`);
    if (fields.date) parts.push(`Date: ${fields.date}`);
    if (fields.amount && fields.currency) parts.push(`Amount: ${fields.currency}${fields.amount}`);
    if (fields.parties && fields.parties.length > 0) parts.push(`Parties: ${fields.parties.join(", ")}`);
    if (fields.keywords && fields.keywords.length > 0) parts.push(`Keywords: ${fields.keywords.join(", ")}`);
    
    return `File: ${file.filename}\n${parts.length > 0 ? parts.join(" | ") : "No structured fields detected"}`;
  }).join("\n\n");

  // Build rule signals summary
  const ruleSummary = [
    `Evidence Strength: ${ruleSignals.evidenceStrength}/10`,
    ruleSignals.amountMatch ? "Claimed amount matches evidence" : "Claimed amount does not match evidence",
    ...(ruleSignals.missingProof.length > 0 ? [`Missing: ${ruleSignals.missingProof.join(", ")}`] : []),
  ].join("\n");

  const prompt = `You are a legal judge evaluating a dispute case. Your task is to render a verdict based on the provided testimony and evidence.

CASE SUMMARY:
- Actor: ${caseSummary.actor}
- Claim: ${caseSummary.claim}
- Amount: ${caseSummary.value || "Not specified"}
- Context: ${caseSummary.context}

TESTIMONY:
${transcript.substring(0, 2000)}${transcript.length > 2000 ? "..." : ""}

EVIDENCE FILES:
${evidenceSummary || "No evidence files provided"}

RULE-BASED SIGNALS:
${ruleSummary}

CRITICAL INSTRUCTIONS:
1. Do NOT invent evidence. Only reference what is provided above.
2. Every rationale bullet MUST reference either:
   - A specific quote from the testimony, OR
   - An evidence file field (invoice number, amount, date, party name)
3. If evidence is weak or missing, choose PARTIAL or REJECT and explicitly state what is missing.
4. Confidence should reflect the strength of evidence:
   - APPROVE: 75-95% (strong evidence, clear match)
   - PARTIAL: 50-74% (moderate evidence, some gaps)
   - REJECT: 30-55% (weak/no evidence, contradictions)
5. Be concise and authoritative. Use legal language but remain clear.

OUTPUT FORMAT (JSON only):
{
  "decision": "APPROVE" | "PARTIAL" | "REJECT",
  "confidence": <number 0-100>,
  "rationale": [
    "<bullet 1 citing evidence>",
    "<bullet 2 citing evidence>",
    "<bullet 3 citing evidence>"
  ],
  "citations": [
    {"file": "<filename>", "quoteOrField": "<invoice number/amount/quote>"}
  ]
}

Respond with ONLY valid JSON, no other text.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Call with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Gemini API timeout")), timeoutMs);
    });

    const responsePromise = model.generateContent(prompt);
    const response = await Promise.race([responsePromise, timeoutPromise]);
    
    const responseText = response.response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }
    
    const parsed = JSON.parse(jsonText) as any;

    // Validate output
    if (!["APPROVE", "PARTIAL", "REJECT"].includes(parsed.decision)) {
      throw new Error("Invalid decision from Gemini");
    }
    
    if (typeof parsed.confidence !== "number" || parsed.confidence < 0 || parsed.confidence > 100) {
      throw new Error("Invalid confidence from Gemini");
    }
    
    if (!Array.isArray(parsed.rationale) || parsed.rationale.length < 2 || parsed.rationale.length > 10) {
      throw new Error("Invalid rationale from Gemini");
    }

    return {
      decision: parsed.decision,
      confidence: Math.round(parsed.confidence),
      rationale: parsed.rationale,
      citations: parsed.citations || [],
    };
  } catch (error) {
    console.error("Gemini judge error:", error);
    throw error;
  }
}

