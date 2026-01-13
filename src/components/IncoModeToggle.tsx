"use client";

import { usePipelineContext } from "@/store/PipelineContext";
import Badge from "@/components/ui/Badge";

export default function IncoModeToggle() {
  const { incoMode, setIncoMode } = usePipelineContext();

  return (
    <div
      onClick={() => setIncoMode(!incoMode)}
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        zIndex: 100,
        cursor: "pointer",
      }}
    >
      <Badge variant={incoMode ? "info" : "default"}>
        {incoMode ? "INCO Mode ON" : "INCO Mode OFF"}
      </Badge>
    </div>
  );
}

