"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { usePipelineContext } from "@/store/PipelineContext";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import StepShell from "./StepShell";
import { calculateFileHash, EvidenceFile, calculateEvidenceStrength, generateEvidenceId, computeEvidenceRoot } from "@/lib/evidenceUtils";
import { SealedEvidenceFile } from "@/types/pipeline";
import { extractPDFText, isPDF } from "@/lib/pdfExtractor";

export default function EvidenceStep() {
  const { activeStep, steps, completeStep, getStepData } = usePipelineContext();
  const isActive = activeStep === "evidence";
  const isCompleted = steps.evidence.status === "completed";
  const existingEvidence = getStepData("evidence");
  
  const [files, setFiles] = useState<EvidenceFile[]>(existingEvidence?.files || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [evidenceRoot, setEvidenceRoot] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute evidence root when sealed
  useEffect(() => {
    if (isCompleted && existingEvidence?.files) {
      computeEvidenceRoot(existingEvidence.files).then(root => {
        setEvidenceRoot(root);
      });
    }
  }, [isCompleted, existingEvidence]);

  const handleFiles = useCallback(async (fileList: FileList) => {
    setIsProcessing(true);
    const newFiles: EvidenceFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const hash = await calculateFileHash(file);
      
      // Extract PDF text if it's a PDF
      let extractedText;
      if (isPDF(file)) {
        try {
          extractedText = await extractPDFText(file);
        } catch (error) {
          console.warn("PDF extraction failed for", file.name, error);
          // Continue without extracted text
        }
      }
      
      newFiles.push({
        filename: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        hash,
        timestamp: Date.now(),
        file,
        extractedText,
      });
    }
    
    setFiles((prev) => [...prev, ...newFiles]);
    setIsProcessing(false);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    if (isCompleted) return; // Immutable when sealed
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, [isCompleted]);

  const handleComplete = () => {
    if (isCompleted) return; // Already sealed
    
    // Seal evidence: create immutable records with evidenceIds
    const sealedFiles: SealedEvidenceFile[] = files.map((file) => ({
      filename: file.filename,
      size: file.size,
      type: file.type,
      hash: file.hash,
      uploadedAt: file.timestamp,
      evidenceId: generateEvidenceId(file.hash),
    }));

    const evidenceData = {
      files: sealedFiles,
      sealedAt: Date.now(),
      isSealed: true,
    };
    
    setTimeout(() => {
      completeStep("evidence", evidenceData);
    }, 200);
  };

  const evidenceStrength = calculateEvidenceStrength(files);

  if (!isActive && !isCompleted) {
    return null;
  }

  return (
    <StepShell
      title="Add Files"
      subtitle="Upload evidence documents"
      rightSlot={isCompleted ? <Badge variant="sealed" animate>SEALED</Badge> : undefined}
      isActive={isActive}
      isCompleted={isCompleted}
      actions={
        !isCompleted ? (
          <Button onClick={handleComplete} disabled={isProcessing || files.length === 0}>
            Lock files & continue
          </Button>
        ) : (
          <div style={{ color: "var(--text-dim)", fontSize: "14px" }}>
            Files locked. Proceeding to next stage...
          </div>
        )
      }
    >

      {!isCompleted ? (
        <>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              minHeight: "200px",
              padding: "40px",
              background: dragActive ? "var(--background)" : "var(--bg-dim)",
              border: `2px dashed ${dragActive ? "var(--neon-accent)" : isActive ? "var(--neon-accent)" : "var(--border-dim)"}`,
              borderRadius: "4px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              color: "var(--text-dim)",
              marginBottom: "20px",
              cursor: "pointer",
              transition: "all 200ms ease-out",
            }}
          >
            <div style={{ fontSize: "48px" }}>📄</div>
            <div style={{ fontSize: "14px" }}>Drag & drop files or click to browse</div>
            <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>
              PDF, Images, Documents
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              style={{ display: "none" }}
            />
          </div>

          {isProcessing && (
            <div style={{
              padding: "12px",
              background: "var(--bg-dim)",
              border: "1px solid var(--border-dim)",
              borderRadius: "4px",
              marginBottom: "20px",
              textAlign: "center",
              color: "var(--text-dim)",
            }}>
              Processing files...
            </div>
          )}

          {files.length > 0 && (
            <>
              {/* Evidence Ledger Panel */}
              <GlassCard style={{ marginBottom: "20px", padding: "20px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}>
                  <h4 style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    fontFamily: "var(--font-body)",
                  }}>
                    Evidence Ledger ({files.length} file{files.length !== 1 ? "s" : ""})
                  </h4>
                  <Badge variant={evidenceStrength >= 6 ? "sealed" : evidenceStrength >= 3 ? "verified" : "default"}>
                    Strength: {evidenceStrength}/10
                  </Badge>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {files.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: "12px 16px",
                        background: "rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: "8px",
                      }}
                    >
                      <div>
                        <div style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--foreground)",
                          marginBottom: "6px",
                        }}>
                          {file.filename}
                        </div>
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "auto 1fr",
                          gap: "8px 16px",
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-dim)",
                        }}>
                          <span>Type:</span>
                          <span>{file.type || "application/octet-stream"}</span>
                          <span>Size:</span>
                          <span>{(file.size / 1024).toFixed(1)} KB</span>
                          <span>ID:</span>
                          <span>{generateEvidenceId(file.hash)}</span>
                          <span>Hash:</span>
                          <span>{file.hash.slice(2, 14)}...</span>
                        </div>
                      </div>
                      {!isCompleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          style={{
                            padding: "6px 12px",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "6px",
                            color: "var(--text-dim)",
                            cursor: "pointer",
                            fontSize: "11px",
                            alignSelf: "flex-start",
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              {/* Extracted PDF Fields Panel */}
              {files.some(f => f.extractedText) && (
                <GlassCard style={{ marginBottom: "20px", padding: "20px" }}>
                  <h4 style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    fontFamily: "var(--font-body)",
                    marginBottom: "16px",
                  }}>
                    Extracted Document Fields
                  </h4>
                  {files.map((file, index) => file.extractedText && (
                    <div key={index} style={{ marginBottom: "16px" }}>
                      <div style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--text-dim)",
                        marginBottom: "12px",
                        fontFamily: "var(--font-mono)",
                      }}>
                        {file.filename}
                      </div>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "120px 1fr",
                        gap: "8px 16px",
                        fontSize: "12px",
                        fontFamily: "var(--font-mono)",
                      }}>
                        {file.extractedText.detectedFields.invoiceNumber && (
                          <>
                            <div style={{ color: "var(--text-dim)" }}>Invoice #</div>
                            <div style={{ color: "var(--foreground)" }}>{file.extractedText.detectedFields.invoiceNumber}</div>
                          </>
                        )}
                        {file.extractedText.detectedFields.amount && (
                          <>
                            <div style={{ color: "var(--text-dim)" }}>Amount</div>
                            <div style={{ color: "var(--foreground)" }}>{file.extractedText.detectedFields.amount}</div>
                          </>
                        )}
                        {file.extractedText.detectedFields.date && (
                          <>
                            <div style={{ color: "var(--text-dim)" }}>Date</div>
                            <div style={{ color: "var(--foreground)" }}>{file.extractedText.detectedFields.date}</div>
                          </>
                        )}
                        {file.extractedText.detectedFields.parties && file.extractedText.detectedFields.parties.length > 0 && (
                          <>
                            <div style={{ color: "var(--text-dim)" }}>Parties</div>
                            <div style={{ color: "var(--foreground)" }}>{file.extractedText.detectedFields.parties.join(", ")}</div>
                          </>
                        )}
                      </div>
                      {file.extractedText.summary && (
                        <div style={{
                          marginTop: "12px",
                          padding: "12px",
                          background: "rgba(0, 0, 0, 0.2)",
                          borderRadius: "6px",
                          fontSize: "11px",
                          color: "var(--text-dim)",
                          fontStyle: "italic",
                          lineHeight: "1.6",
                        }}>
                          {file.extractedText.summary.substring(0, 200)}{file.extractedText.summary.length > 200 ? "..." : ""}
                        </div>
                      )}
                    </div>
                  ))}
                </GlassCard>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {/* Sealed Evidence Ledger */}
          <GlassCard style={{ marginBottom: "20px", padding: "20px" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}>
              <h4 style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--foreground)",
                fontFamily: "var(--font-body)",
              }}>
                Sealed Evidence Ledger
              </h4>
              <Badge variant="sealed">SEALED</Badge>
            </div>

            {existingEvidence?.sealedAt && (
              <div style={{
                marginBottom: "16px",
                padding: "12px",
                background: "rgba(0, 0, 0, 0.2)",
                borderRadius: "6px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-dim)",
              }}>
                <div>Sealed: {new Date(existingEvidence.sealedAt).toLocaleString()}</div>
                {evidenceRoot && (
                  <div style={{ marginTop: "8px" }}>
                    Evidence Root: {evidenceRoot.slice(2, 14)}...
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {existingEvidence?.files?.map((file: SealedEvidenceFile, index: number) => (
                <div
                  key={index}
                  style={{
                    padding: "12px 16px",
                    background: "rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    marginBottom: "6px",
                  }}>
                    {file.filename}
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "8px 16px",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-dim)",
                  }}>
                    <span>Type:</span>
                    <span>{file.type}</span>
                    <span>Size:</span>
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                    <span>ID:</span>
                    <span>{file.evidenceId}</span>
                    <span>Hash:</span>
                    <span>{file.hash.slice(2, 14)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </>
      )}
    </StepShell>
  );
}

