export type PipelineStep = 
  | "landing"
  | "intent"
  | "pslang"
  | "evidence"
  | "deliberation"
  | "verdict"
  | "agreement";

export type StepStatus = "locked" | "active" | "completed";

export interface StepState {
  status: StepStatus;
  data?: any;
}

export interface PipelineState {
  activeStep: PipelineStep;
  steps: Record<PipelineStep, StepState>;
  demoMode: boolean;
}

export interface IntentData {
  mode: "voice" | "text" | "upload";
  content: string;
  transcript?: string;
  audioBlob?: Blob;
  audioUrl?: string;
  duration?: number;
  caseType?: string;
}

export interface PSLangData {
  actor: string;
  claim: string;
  value?: string;
  context: string;
  evidenceRefs: string[];
  hash: string;
}

export interface ExtractedEvidence {
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

export interface SealedEvidenceFile {
  filename: string;
  size: number;
  type: string;
  hash: string;
  uploadedAt: number;
  evidenceId: string; // Stable ID derived from hash prefix
  extractedText?: ExtractedEvidence; // Extracted text for PDFs
}

export interface EvidenceData {
  files: SealedEvidenceFile[];
  sealedAt?: number; // Timestamp when evidence was sealed
  isSealed: boolean; // Immutability flag
}

export interface VerdictData {
  verdict: "guilty" | "not_guilty" | "inconclusive" | "APPROVE" | "PARTIAL" | "REJECT";
  decision?: "APPROVE" | "PARTIAL" | "REJECT"; // Alias for verdict
  rationale: string | string[]; // Can be string or array of bullets
  confidence: number;
  recommendedAction?: string;
  txHash?: string;
  engine?: "gemini" | "rules"; // Which judge engine was used
}

export interface ContractReceipt {
  receiptId: string;
  confidentialTermsHash: string;
  accessPolicy: string;
  timestamp: number;
}

export interface AgreementData {
  contractText: string;
  termsHash: string;
  agreementId: string;
  contractReceipt?: ContractReceipt;
  partyA?: {
    address: string;
    signature: string;
  };
  partyB?: {
    address: string;
    signature: string;
  };
  txHash?: string;
  verified?: boolean;
}

