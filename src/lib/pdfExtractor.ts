/**
 * PDF text extraction using pdfjs-dist (client-side)
 * Uses ESM-safe local worker (no CDN, no external fetch)
 */

// Dynamic import to avoid SSR issues
let pdfjsLib: any = null;

async function getPdfjs() {
  if (typeof window === "undefined") {
    throw new Error("PDF extraction only works in browser");
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    
    // Use ESM-safe worker path (no CDN, no external fetch)
    if (typeof import.meta !== "undefined" && import.meta.url) {
      try {
        // ESM worker from node_modules
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
      } catch (error) {
        // Fallback: use public directory worker (if copied during setup)
        console.warn("ESM worker path failed, using public fallback:", error);
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }
    } else {
      // Fallback: use public directory worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }
  }
  
  return pdfjsLib;
}

export interface ExtractedText {
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

/**
 * Extract text from PDF file
 */
export async function extractPDFText(file: File): Promise<ExtractedText> {
  try {
    const pdfjs = await getPdfjs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    const pages: string[] = [];
    let fullText = "";

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      pages.push(pageText);
      fullText += pageText + "\n\n";
    }

    // Detect fields from extracted text
    const detectedFields = detectFields(fullText);

    // Generate summary (first 200 chars + key info)
    const summary = generateSummary(fullText, detectedFields);

    return {
      fullText: fullText.trim(),
      pages,
      detectedFields,
      summary,
    };
  } catch (error) {
    console.error("PDF extraction failed:", error);
    throw new Error(`Failed to extract PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
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

/**
 * Detect structured fields from text
 */
function detectFields(text: string): ExtractedText["detectedFields"] {
  const upperText = text.toUpperCase();
  const fields: ExtractedText["detectedFields"] = {
    parties: [],
    keywords: [],
  };

  // Invoice number patterns
  const invoicePatterns = [
    /(?:INVOICE|INV|BILL)\s*(?:NO|NUMBER|#)?\s*:?\s*([A-Z0-9\-]+)/i,
    /(?:REF|REFERENCE)\s*(?:NO|NUMBER|#)?\s*:?\s*([A-Z0-9\-]+)/i,
  ];
  for (const pattern of invoicePatterns) {
    const match = text.match(pattern);
    if (match) {
      fields.invoiceNumber = match[1];
      break;
    }
  }

  // Date patterns
  const datePatterns = [
    /(?:DATE|DATED?)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      fields.date = match[1];
      break;
    }
  }

  // Amount patterns (₹, $, INR, USD, etc.)
  const amountPatterns = [
    /(?:AMOUNT|TOTAL|SUM|PAY|PAID)\s*:?\s*(?:₹|INR|RS\.?|USD|\$)\s*([\d,]+\.?\d*)/i,
    /(?:₹|INR|RS\.?|USD|\$)\s*([\d,]+\.?\d*)/g,
  ];
  const amounts: string[] = [];
  for (const pattern of amountPatterns) {
    const matches = text.matchAll(toGlobalRegex(pattern));
    for (const match of matches) {
      if (match[1]) {
        amounts.push(match[1]);
      }
    }
  }
  if (amounts.length > 0) {
    // Get the largest amount (likely total)
    const numericAmounts = amounts.map(a => parseFloat(a.replace(/,/g, ""))).filter(n => !isNaN(n));
    if (numericAmounts.length > 0) {
      const maxAmount = Math.max(...numericAmounts);
      fields.amount = maxAmount.toString();
      fields.currency = text.match(/₹|INR|RS\.?/i) ? "INR" : text.match(/USD|\$/i) ? "USD" : undefined;
    }
  }

  // Party names (common patterns)
  const partyPatterns = [
    /(?:FROM|SENDER|BILL\s*FROM)\s*:?\s*([A-Z][A-Za-z\s&]+)/i,
    /(?:TO|RECIPIENT|BILL\s*TO)\s*:?\s*([A-Z][A-Za-z\s&]+)/i,
  ];
  for (const pattern of partyPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const party = match[1].trim();
      if (party.length > 2 && party.length < 50) {
        fields.parties = fields.parties || [];
        if (!fields.parties.includes(party)) {
          fields.parties.push(party);
        }
      }
    }
  }

  // Keywords (payment, refund, delivery, etc.)
  const keywords = [
    "PAID", "PAYMENT", "REFUND", "DELIVERED", "SHIPPED", "ORDER",
    "INVOICE", "RECEIPT", "BILL", "CONTRACT", "AGREEMENT", "SALARY", "WAGE",
  ];
  const foundKeywords = keywords.filter(kw => upperText.includes(kw));
  if (foundKeywords.length > 0) {
    fields.keywords = foundKeywords;
  }

  return fields;
}

/**
 * Generate summary from extracted text
 */
function generateSummary(text: string, fields: ExtractedText["detectedFields"]): string {
  const lines: string[] = [];
  
  if (fields.invoiceNumber) {
    lines.push(`Invoice: ${fields.invoiceNumber}`);
  }
  if (fields.date) {
    lines.push(`Date: ${fields.date}`);
  }
  if (fields.amount) {
    lines.push(`Amount: ${fields.currency || "₹"}${fields.amount}`);
  }
  if (fields.parties && fields.parties.length > 0) {
    lines.push(`Parties: ${fields.parties.join(", ")}`);
  }

  // Add first 150 chars of text
  const preview = text.substring(0, 150).trim();
  if (preview) {
    lines.push(`Preview: ${preview}...`);
  }

  return lines.join(" | ");
}

/**
 * Check if file is a PDF
 */
export function isPDF(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}
