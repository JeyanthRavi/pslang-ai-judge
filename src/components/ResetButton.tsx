"use client";

import { usePipelineContext } from "@/store/PipelineContext";
import Button from "@/components/ui/Button";

export default function ResetButton() {
  const { resetPipeline } = usePipelineContext();

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: 100,
    }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={resetPipeline}
        style={{
          fontSize: "11px",
          padding: "6px 12px",
        }}
      >
        Reset Pipeline
      </Button>
    </div>
  );
}

