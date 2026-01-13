"use client";

import { usePipelineContext } from "@/store/PipelineContext";
import Button from "@/components/ui/Button";
import { IntentData, PSLangData, EvidenceData } from "@/types/pipeline";
import { calculateFileHash } from "@/lib/evidenceUtils";

export default function DemoDataButton() {
  const { reviewBuildMode, completeStep, navigateToStep } = usePipelineContext();

  if (!reviewBuildMode) {
    return null;
  }

  const handleLoadDemoData = async () => {
    // Demo transcript
    const demoTranscript = "I purchased a product for ₹5000 on 10 Jan 2026. The item was defective and the seller refused replacement. I want a full refund. I have attached the invoice and chat proof.";

    // Complete Intent step
    const intentData: IntentData = {
      mode: "text",
      content: demoTranscript,
      transcript: demoTranscript,
      caseType: "Refund dispute",
    };
    completeStep("intent", intentData);

    // Complete PSLang step (mock compilation)
    const pslangData: PSLangData = {
      actor: "User",
      claim: "Refund dispute",
      value: "₹5000",
      context: "Product defective, seller refused replacement",
      evidenceRefs: ["evd_demo_invoice"],
      hash: "0x" + "demo".repeat(16), // Deterministic demo hash
    };
    completeStep("pslang", pslangData);

    // Complete Evidence step with mock extracted fields
    const demoEvidenceHash = await calculateFileHash(
      new File(["demo invoice"], "invoice.pdf", { type: "application/pdf" })
    );

    const evidenceData: EvidenceData = {
      files: [
        {
          filename: "invoice.pdf",
          size: 1024,
          type: "application/pdf",
          hash: demoEvidenceHash,
          uploadedAt: Date.now(),
          evidenceId: "evd_demo_invoice",
          extractedText: {
            fullText: "Invoice INV-12345\nDate: 10 Jan 2026\nAmount: ₹5000\nBuyer: User\nSeller: ABC Traders",
            pages: ["Invoice INV-12345\nDate: 10 Jan 2026\nAmount: ₹5000\nBuyer: User\nSeller: ABC Traders"],
            detectedFields: {
              invoiceNumber: "INV-12345",
              date: "10 Jan 2026",
              amount: "5000",
              currency: "INR",
              parties: ["User", "ABC Traders"],
              keywords: ["refund", "defective"],
            },
            summary: "Invoice INV-12345 | Date: 10 Jan 2026 | Amount: ₹5000 | Parties: User, ABC Traders",
          },
        },
      ],
      sealedAt: Date.now(),
      isSealed: true,
    };
    completeStep("evidence", evidenceData);

    // Navigate to Deliberation step
    setTimeout(() => {
      navigateToStep("deliberation");
    }, 500);
  };

  return (
    <Button
      onClick={handleLoadDemoData}
      style={{
        position: "fixed",
        top: "20px",
        right: "140px",
        zIndex: 100,
        padding: "8px 14px",
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      Demo Data
    </Button>
  );
}

