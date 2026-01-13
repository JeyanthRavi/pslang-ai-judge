/**
 * Evidence utilities for file handling and hashing
 */

import { ExtractedEvidence } from "@/types/pipeline";
import { SealedEvidenceFile } from "@/types/pipeline";

export interface EvidenceFile {
  filename: string;
  size: number;
  type: string;
  hash: string;
  timestamp: number;
  file: File;
  extractedText?: ExtractedEvidence; // Extracted text for PDFs
}

/**
 * Generate stable evidenceId from hash prefix
 */
export function generateEvidenceId(hash: string): string {
  // Use first 16 chars of hash (after 0x) as evidenceId
  return `evd_${hash.slice(2, 18)}`;
}

/**
 * Calculate SHA-256 hash of a file (client-side)
 */
export async function calculateFileHash(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return "0x" + hashHex;
  } catch (error) {
    console.warn("Hash calculation failed, using fallback:", error);
    // Fallback: simple hash from filename + size + timestamp
    const fallback = `${file.name}-${file.size}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < fallback.length; i++) {
      const char = fallback.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return "0x" + Math.abs(hash).toString(16).padStart(64, "0");
  }
}

/**
 * Compute evidence root from sealed evidence files
 * Creates a stable hash from sorted evidence hashes (for on-chain storage)
 * Does NOT include extractedText (only file hashes)
 */
export async function computeEvidenceRoot(files: SealedEvidenceFile[]): Promise<`0x${string}`> {
  if (files.length === 0) {
    // Return zero hash for no evidence
    return "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;
  }

  // Sort by hash (alphabetically) for deterministic ordering
  const sortedHashes = files
    .map(f => f.hash)
    .sort()
    .join("");

  // Hash the concatenated sorted hashes
  const encoder = new TextEncoder();
  const data = encoder.encode(sortedHashes);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  return (`0x${hashHex}`) as `0x${string}`;
}

/**
 * Calculate evidence strength score (content-based, starts at 0)
 * Points added for extracted fields and file count
 */
export function calculateEvidenceStrength(files: EvidenceFile[]): number {
  if (files.length === 0) return 0;
  
  let strength = 0;
  
  // Add points for each file (max +3 for multiple files)
  const fileCount = Math.min(files.length, 3);
  strength += fileCount;
  
  // Check extracted content for each file
  for (const file of files) {
    if (file.extractedText) {
      const fields = file.extractedText.detectedFields;
      
      // +2 for invoice number found
      if (fields.invoiceNumber) {
        strength += 2;
      }
      
      // +2 for amount found
      if (fields.amount) {
        strength += 2;
      }
      
      // +1 for date found
      if (fields.date) {
        strength += 1;
      }
      
      // +1 for party/seller found
      if (fields.parties && fields.parties.length > 0) {
        strength += 1;
      }
      
      // +1 for keyword match (paid, refund, delivered, salary, etc.)
      if (fields.keywords && fields.keywords.length > 0) {
        strength += 1;
      }
    }
  }
  
  // Clamp to 0-10
  return Math.max(0, Math.min(10, strength));
}
