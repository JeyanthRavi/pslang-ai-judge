/**
 * PSLang Compiler - Extracts structured intent from transcript
 */

export interface PSLangOutput {
  actor: string;
  claim: string;
  value?: string;
  context: string;
  evidenceRefs: string[];
  hash: string;
}

/**
 * Extract claim type from transcript using keyword detection
 */
function detectClaimType(transcript: string): string {
  const lower = transcript.toLowerCase();
  
  if (lower.match(/\b(refund|return|money back|repayment)\b/)) {
    return "REFUND";
  }
  if (lower.match(/\b(wage|salary|payment|unpaid|compensation)\b/)) {
    return "WAGE_DISPUTE";
  }
  if (lower.match(/\b(rent|rental|lease|landlord|property)\b/)) {
    return "RENTAL";
  }
  if (lower.match(/\b(service|delivery|contract|agreement|failed)\b/)) {
    return "SERVICE_FAILURE";
  }
  if (lower.match(/\b(scam|fraud|deception|cheat)\b/)) {
    return "FRAUD";
  }
  
  return "GENERAL";
}

/**
 * Extract monetary value from transcript
 */
function extractValue(transcript: string): string | undefined {
  // Match patterns like: ₹4500, 4500, four thousand, $100, etc.
  const patterns = [
    /₹\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:rupees|rs|dollars|usd)/i,
    /(\d+(?:,\d{3})*(?:\.\d{2})?)/,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      return match[1].replace(/,/g, "");
    }
  }

  // Try to extract written numbers (basic)
  const writtenNumbers: Record<string, string> = {
    "one": "1", "two": "2", "three": "3", "four": "4", "five": "5",
    "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10",
    "hundred": "100", "thousand": "1000", "lakh": "100000",
  };

  const lower = transcript.toLowerCase();
  for (const [word, num] of Object.entries(writtenNumbers)) {
    if (lower.includes(word)) {
      return num;
    }
  }

  return undefined;
}

/**
 * Extract counterparty name from transcript
 */
function extractCounterparty(transcript: string): string {
  // Look for patterns like "from [name]", "by [name]", "[name] company", etc.
  const patterns = [
    /(?:from|by|with|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /([A-Z][a-z]+)\s+(?:company|shop|store|merchant|employer)/i,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match && match[1].length > 2) {
      return match[1];
    }
  }

  return "Unknown";
}

/**
 * Generate hash from PSLang JSON
 */
function generateHash(pslang: Omit<PSLangOutput, "hash">): string {
  const json = JSON.stringify(pslang);
  // Simple hash function (in production, use crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to hex and pad
  const hex = Math.abs(hash).toString(16).padStart(16, "0");
  return "0x" + hex.repeat(4).substring(0, 64);
}

/**
 * Compile transcript into PSLang structure
 */
export function compilePSLang(
  transcript: string, 
  caseType?: string,
  evidenceData?: { files: Array<{ evidenceId: string; hash: string }> }
): PSLangOutput {
  const claimType = detectClaimType(transcript);
  const value = extractValue(transcript);
  const counterparty = extractCounterparty(transcript);

  // Build claim statement
  let claim = transcript.trim();
  if (claim.length > 200) {
    claim = claim.substring(0, 197) + "...";
  }

  // Determine context
  const context = caseType 
    ? `Legal proceeding - ${caseType}`
    : "Legal proceeding";

  // Build evidence references from sealed evidence
  const evidenceRefs: string[] = [];
  if (evidenceData?.files && evidenceData.files.length > 0) {
    evidenceRefs.push(...evidenceData.files.map(f => `${f.evidenceId}:${f.hash.slice(0, 16)}`));
  }

  // Build PSLang object
  const pslang: Omit<PSLangOutput, "hash"> = {
    actor: "User",
    claim,
    value: value ? `₹${value}` : undefined,
    context,
    evidenceRefs,
  };

  // Generate hash
  const hash = generateHash(pslang);

  return {
    ...pslang,
    hash,
  };
}

