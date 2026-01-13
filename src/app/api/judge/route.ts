import { NextRequest, NextResponse } from "next/server";
import { judgeWithGemini } from "@/lib/geminiJudge";

interface ExtractedEvidence {
  fullText: string;
  pages: string[];
  detectedFields: {
    invoiceNumber?: string;
    date?: string;
    amount?: string;
    currency?: string;
    parties?: string[];
    keywords?: string[];
  };
  summary: string;
}

interface JudgeRequest {
  transcript: string;
  pslang: {
    actor: string;
    claim: string;
    value?: string;
    context: string;
    evidenceRefs: string[];
    hash: string;
  };
  evidence: Array<{
    filename: string;
    size: number;
    type: string;
    hash: string;
    extractedText?: ExtractedEvidence;
  }>;
  demoMode: boolean;
}

interface JudgeResponse {
  decision: "APPROVE" | "PARTIAL" | "REJECT";
  rationale: string[];
  confidence: number;
  recommendedAction: string;
  reasoningTrace: string[];
  engine: "gemini" | "rules";
}

/**
 * Calculate evidence strength score (content-based)
 */
function calculateEvidenceStrength(evidence: JudgeRequest["evidence"]): number {
  if (evidence.length === 0) return 0;
  
  let strength = 0;
  
  // Add points for each file (max +3 for multiple files)
  const fileCount = Math.min(evidence.length, 3);
  strength += fileCount;
  
  // Check extracted content for each file
  for (const file of evidence) {
    if (file.extractedText) {
      const fields = file.extractedText.detectedFields;
      
      if (fields.invoiceNumber) strength += 2;
      if (fields.amount) strength += 2;
      if (fields.date) strength += 1;
      if (fields.parties && fields.parties.length > 0) strength += 1;
      if (fields.keywords && fields.keywords.length > 0) strength += 1;
    }
  }
  
  return Math.max(0, Math.min(10, strength));
}

/**
 * Extract claim type from PSLang
 */
function extractClaimType(pslang: JudgeRequest["pslang"]): string {
  const claim = pslang.claim.toLowerCase();
  if (claim.includes("refund") || claim.includes("return")) return "REFUND";
  if (claim.includes("wage") || claim.includes("salary") || claim.includes("unpaid")) return "WAGE";
  if (claim.includes("rent") || claim.includes("rental") || claim.includes("landlord")) return "RENTAL";
  if (claim.includes("service") || claim.includes("delivery") || claim.includes("contract")) return "SERVICE";
  if (claim.includes("scam") || claim.includes("fraud")) return "FRAUD";
  return "GENERAL";
}

/**
 * Extract amount from PSLang value
 */
function extractAmount(pslang: JudgeRequest["pslang"]): number {
  if (!pslang.value) return 0;
  const match = pslang.value.match(/[\d,]+/);
  if (match) {
    return parseInt(match[0].replace(/,/g, ""), 10);
  }
  return 0;
}

/**
 * Judge the case using Gemini (if available) or rules engine (fallback)
 */
export async function POST(request: NextRequest) {
  try {
    const body: JudgeRequest = await request.json();
    const { transcript, pslang, evidence, demoMode } = body;

    // Calculate base scores (always compute for both engines)
    const evidenceScore = calculateEvidenceStrength(evidence);
    const claimAmount = extractAmount(pslang);
    const claimType = extractClaimType(pslang);
    const transcriptLength = transcript.length;

    // Compute match score (evidence amount vs claimed amount)
    let matchScore = 0;
    let amountMatch = false;
    let amountDifference = 0;
    const evidenceAmounts: number[] = [];
    const missingProof: string[] = [];
    
    for (const file of evidence) {
      if (file.extractedText?.detectedFields.amount) {
        const amountStr = file.extractedText.detectedFields.amount;
        const amount = parseFloat(amountStr.replace(/,/g, ""));
        if (!isNaN(amount)) {
          evidenceAmounts.push(amount);
        }
      }
    }
    
    if (evidenceAmounts.length > 0 && claimAmount > 0) {
      const maxEvidenceAmount = Math.max(...evidenceAmounts);
      amountDifference = Math.abs(claimAmount - maxEvidenceAmount);
      const percentDiff = (amountDifference / claimAmount) * 100;
      
      if (percentDiff <= 2) {
        matchScore = 3;
        amountMatch = true;
      } else {
        matchScore = -2;
        amountMatch = false;
        missingProof.push("Amount mismatch between claim and evidence");
      }
    } else if (claimAmount > 0) {
      missingProof.push("No amount found in evidence");
    }

    if (evidenceScore === 0) {
      missingProof.push("No evidence files provided");
    } else if (evidenceScore < 3) {
      missingProof.push("Weak evidence (missing invoice/amount/date)");
    }

    // Try Gemini first (if API key is set)
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const judgeEngine = process.env.JUDGE_ENGINE || "deterministic";
    if (geminiApiKey && (judgeEngine === "gemini" || judgeEngine === "auto")) {
      try {
        const geminiResult = await judgeWithGemini(
          {
            transcript,
            caseSummary: {
              actor: pslang.actor,
              claim: pslang.claim,
              value: pslang.value,
              context: pslang.context,
            },
            evidenceFiles: evidence.map((f) => ({
              filename: f.filename,
              extractedFields: f.extractedText?.detectedFields,
              summary: f.extractedText?.summary,
            })),
            ruleSignals: {
              evidenceStrength: evidenceScore,
              amountMatch,
              amountDifference,
              missingProof,
            },
          },
          geminiApiKey
        );

        // Generate recommended action
        let recommendedAction = "";
        if (geminiResult.decision === "APPROVE") {
          if (claimAmount > 0) {
            recommendedAction = `Release ₹${claimAmount.toLocaleString()} to claimant`;
          } else {
            recommendedAction = "Approve claim and proceed with settlement";
          }
        } else if (geminiResult.decision === "PARTIAL") {
          if (claimAmount > 0) {
            const partialAmount = Math.floor(claimAmount * (geminiResult.confidence / 100));
            recommendedAction = `Release ₹${partialAmount.toLocaleString()} (${geminiResult.confidence}% partial approval)`;
          } else {
            recommendedAction = "Approve partial claim pending additional evidence";
          }
        } else {
          recommendedAction = "Hold funds pending further review";
        }

        return NextResponse.json({
          decision: geminiResult.decision,
          rationale: geminiResult.rationale,
          confidence: geminiResult.confidence,
          recommendedAction,
          reasoningTrace: ["Checking your details...", "Reading files...", "Preparing outcome..."],
          engine: "gemini",
        });
      } catch (error) {
        console.error("Gemini judge failed, falling back to rules:", error);
        // Fall through to rules engine
      }
    }

    // Rules engine (fallback or when Gemini not available)
    let transcriptScore = 0;
    if (transcriptLength > 200) {
      transcriptScore = 2;
    } else if (transcriptLength >= 80 && transcriptLength <= 200) {
      transcriptScore = 1;
    } else if (transcriptLength < 50) {
      transcriptScore = -2;
    }

    const totalScore = evidenceScore + matchScore + transcriptScore;

    let decision: "APPROVE" | "PARTIAL" | "REJECT";
    let confidence = 0;
    const rationale: string[] = [];
    const reasoningTrace: string[] = [];

    reasoningTrace.push("Checking your details...");

    // Extract evidence insights for rationale
    const evidenceInsights: string[] = [];
    for (const file of evidence) {
      if (file.extractedText) {
        const fields = file.extractedText.detectedFields;
        if (fields.invoiceNumber) {
          evidenceInsights.push(`Invoice ${fields.invoiceNumber} detected in ${file.filename}`);
        }
        if (fields.amount && fields.currency) {
          evidenceInsights.push(`${file.filename} shows amount ${fields.currency}${fields.amount}`);
        }
        if (fields.date) {
          evidenceInsights.push(`Date ${fields.date} documented in ${file.filename}`);
        }
        if (fields.parties && fields.parties.length > 0) {
          evidenceInsights.push(`Parties identified: ${fields.parties.join(", ")}`);
        }
      }
    }

    reasoningTrace.push("Reading files...");

    // Determine decision based on total score
    if (totalScore >= 10) {
      decision = "APPROVE";
      // Confidence: 80-95 scaled by score
      confidence = 80 + Math.min((totalScore - 10) * 3, 15);
      
      rationale.push("Strong evidence supports the claim.");
      if (evidenceInsights.length > 0) {
        rationale.push(evidenceInsights[0]);
      }
      if (amountMatch && claimAmount > 0 && evidenceAmounts.length > 0) {
        const maxEvidenceAmount = Math.max(...evidenceAmounts);
        rationale.push(`Invoice amount ₹${maxEvidenceAmount.toLocaleString()} matches claimed ₹${claimAmount.toLocaleString()}`);
      }
      if (transcriptLength > 200) {
        rationale.push("Detailed testimony provides comprehensive context.");
      }
    } else if (totalScore >= 6) {
      decision = "PARTIAL";
      // Confidence: 55-79 scaled by score
      confidence = 55 + Math.min((totalScore - 6) * 6, 24);
      
      rationale.push("Moderate evidence provided, but some gaps remain.");
      if (evidenceInsights.length > 0) {
        rationale.push(evidenceInsights[0]);
      } else {
        rationale.push("Additional documentation may strengthen the case.");
      }
      if (!amountMatch && claimAmount > 0 && evidenceAmounts.length > 0) {
        const maxEvidenceAmount = Math.max(...evidenceAmounts);
        rationale.push(`Invoice amount ₹${maxEvidenceAmount.toLocaleString()} differs from claimed ₹${claimAmount.toLocaleString()}`);
      }
    } else {
      decision = "REJECT";
      // Confidence: 30-54 scaled by score
      confidence = 30 + Math.min((totalScore + 5) * 4.8, 24);
      
      if (evidenceScore === 0) {
        rationale.push("No evidence provided to support the claim.");
        rationale.push("No payment proof found (invoice/receipt missing)");
      } else {
        rationale.push("Insufficient evidence to support the claim.");
        if (evidenceInsights.length > 0) {
          rationale.push(evidenceInsights[0]);
        }
      }
      if (transcriptLength < 50) {
        rationale.push("Brief testimony lacks sufficient detail.");
      }
    }

    reasoningTrace.push("Preparing outcome...");

    // Generate recommended action
    let recommendedAction = "";
    if (decision === "APPROVE") {
      if (claimAmount > 0) {
        recommendedAction = `Release ₹${claimAmount.toLocaleString()} to claimant`;
      } else {
        recommendedAction = "Approve claim and proceed with settlement";
      }
    } else if (decision === "PARTIAL") {
      if (claimAmount > 0) {
        const partialAmount = Math.floor(claimAmount * (confidence / 100));
        recommendedAction = `Release ₹${partialAmount.toLocaleString()} (${confidence}% partial approval)`;
      } else {
        recommendedAction = "Approve partial claim pending additional evidence";
      }
    } else {
      recommendedAction = "Hold funds pending further review";
    }

    confidence = Math.max(20, Math.min(95, Math.round(confidence)));

    return NextResponse.json({
      decision,
      rationale,
      confidence,
      recommendedAction,
      reasoningTrace,
      engine: "rules",
    });
  } catch (error) {
    console.error("Judge API error:", error);
    return NextResponse.json(
      {
        decision: "REJECT",
        rationale: ["Error processing judgment request."],
        confidence: 0,
        recommendedAction: "Request review",
        reasoningTrace: ["Error occurred during evaluation"],
        engine: "rules",
      },
      { status: 500 }
    );
  }
}
