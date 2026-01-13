/**
 * PSLang Fallback Parser
 * Deterministic parser using regex + heuristics (no API keys required)
 */

import { ParsedIntent, IntentParty, Money } from "./types";

/**
 * Parse intent text using deterministic rules
 */
export function parseFallback(text: string, langHint?: "en" | "hi" | "ta"): ParsedIntent {
  const normalizedText = text.trim().replace(/\s+/g, " ");
  const upperText = text.toUpperCase();
  
  // Detect language (simple heuristic)
  let language: "en" | "hi" | "ta" | "unknown" = langHint || "unknown";
  if (!langHint) {
    // Simple detection: check for common words
    if (/[\u0900-\u097F]/.test(text)) {
      language = "hi";
    } else if (/[\u0B80-\u0BFF]/.test(text)) {
      language = "ta";
    } else {
      language = "en";
    }
  }

  // Detect amount and currency
  let amount: Money | undefined;
  let amountSource: string | undefined;
  
  // Patterns: ₹2000, 2000 rupees, 2,000 INR, 0.1 ETH, 1 SHM
  const amountPatterns = [
    /(?:₹|INR|RS\.?|rupees?)\s*([\d,]+\.?\d*)/gi,
    /([\d,]+\.?\d*)\s*(?:₹|INR|RS\.?|rupees?)/gi,
    /([\d,]+\.?\d*)\s*(?:ETH|ethereum)/gi,
    /([\d,]+\.?\d*)\s*(?:SHM|shardeum)/gi,
    /(?:amount|total|pay|paid|cost|price)\s*:?\s*(?:₹|INR|RS\.?)?\s*([\d,]+\.?\d*)/gi,
  ];
  
  for (const pattern of amountPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      const match = matches[0];
      const valueStr = match[1].replace(/,/g, "");
      const value = parseFloat(valueStr);
      if (!isNaN(value) && value > 0) {
        let currency: "INR" | "ETH" | "SHM" = "INR";
        const matchText = match[0].toUpperCase();
        if (matchText.includes("ETH") || matchText.includes("ETHEREUM")) {
          currency = "ETH";
        } else if (matchText.includes("SHM") || matchText.includes("SHARDEUM")) {
          currency = "SHM";
        }
        amount = { value, currency };
        amountSource = match[0].trim();
        break;
      }
    }
  }

  // Detect deadline
  let deadlineISO: string | undefined;
  let deadlineSource: string | undefined;
  
  const now = new Date();
  const deadlinePatterns = [
    { pattern: /tomorrow/i, offset: 1 },
    { pattern: /today/i, offset: 0 },
    { pattern: /in\s+(\d+)\s+hours?/i, offset: (m: RegExpMatchArray) => parseInt(m[1]) / 24 },
    { pattern: /in\s+(\d+)\s+days?/i, offset: (m: RegExpMatchArray) => parseInt(m[1]) },
    { pattern: /by\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?/i, offset: 0 }, // "by 5pm", "by 17:00"
  ];
  
  for (const { pattern, offset } of deadlinePatterns) {
    const match = text.match(pattern);
    if (match) {
      deadlineSource = match[0];
      const targetDate = new Date(now);
      
      if (typeof offset === "function") {
        const days = offset(match);
        targetDate.setDate(targetDate.getDate() + days);
      } else if (offset === 0 && match[1]) {
        // Time-based: "by 5pm" or "by 17:00"
        const hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const isPM = match[3]?.toLowerCase() === "pm";
        targetDate.setHours(isPM && hour < 12 ? hour + 12 : hour, minute, 0, 0);
      } else {
        targetDate.setDate(targetDate.getDate() + offset);
      }
      
      deadlineISO = targetDate.toISOString();
      break;
    }
  }

  // Detect parties
  const parties: IntentParty[] = [];
  let partySource: string | undefined;
  
  // Patterns: "I pay Anil", "to Rahul", "from Ravi", "seller: ABC Traders"
  const partyPatterns = [
    /(?:I|we)\s+(?:pay|paid|give|send)\s+([A-Z][a-zA-Z\s]+)/i,
    /(?:to|recipient|buyer|client)\s*:?\s*([A-Z][a-zA-Z\s&]+)/i,
    /(?:from|sender|seller|provider|vendor)\s*:?\s*([A-Z][a-zA-Z\s&]+)/i,
    /([A-Z][a-zA-Z\s&]{2,})\s+(?:traders?|company|shop|store|services?)/i,
  ];
  
  for (const pattern of partyPatterns) {
    const matches = Array.from(text.matchAll(toGlobalRegex(pattern)));
    for (const match of matches) {
      const name = match[1].trim();
      if (name.length > 2 && name.length < 50 && !parties.some(p => p.name === name)) {
        const role: "CLIENT" | "PROVIDER" = 
          match[0].toLowerCase().includes("from") || 
          match[0].toLowerCase().includes("seller") ||
          match[0].toLowerCase().includes("vendor")
            ? "PROVIDER"
            : "CLIENT";
        parties.push({ name, role });
        if (!partySource) {
          partySource = match[0].trim();
        }
      }
    }
  }

  // Detect task
  let task: string | undefined;
  const taskKeywords = [
    { keywords: ["design", "logo", "poster", "graphic"], task: "Design work" },
    { keywords: ["rent", "rental", "lease"], task: "Rental agreement" },
    { keywords: ["deliver", "delivery", "ship"], task: "Delivery service" },
    { keywords: ["refund", "return", "replace"], task: "Refund/return" },
    { keywords: ["wage", "salary", "payment"], task: "Payment dispute" },
    { keywords: ["service", "repair", "fix"], task: "Service provision" },
  ];
  
  for (const { keywords, task: taskName } of taskKeywords) {
    if (keywords.some(kw => upperText.includes(kw.toUpperCase()))) {
      task = taskName;
      break;
    }
  }

  // Extract conditions (bullet points, requirements)
  const conditions: string[] = [];
  const conditionPatterns = [
    /(?:if|when|provided|condition)\s*:?\s*([^.,]+)/gi,
    /(?:must|should|need|require)\s+([^.,]+)/gi,
  ];
  
  for (const pattern of conditionPatterns) {
    const matches = Array.from(text.matchAll(toGlobalRegex(pattern)));
    for (const match of matches) {
      const condition = match[1].trim();
      if (condition.length > 5 && condition.length < 100) {
        conditions.push(condition);
      }
    }
  }

  // Calculate confidence
  let confidence = 0.4;
  if (amount) confidence += 0.2;
  if (deadlineISO) confidence += 0.2;
  if (parties.length > 0) confidence += 0.2;
  if (task) confidence += 0.1;
  confidence = Math.min(confidence, 0.95);

  return {
    rawText: text,
    normalizedText,
    language,
    task,
    parties,
    amount,
    deadlineISO,
    durationHours: undefined, // Could be extracted if needed
    conditions,
    confidence,
    extraction: {
      amountSource,
      deadlineSource,
      partySource,
    },
  };
}

/**
 * Convert RegExp to global if not already global
 */
function toGlobalRegex(re: RegExp): RegExp {
  if (re.flags.includes("g")) {
    return re;
  }
  return new RegExp(re.source, re.flags + "g");
}

