"use client";

import { usePipelineContext } from "@/store/PipelineContext";
import Badge from "@/components/ui/Badge";

export default function DemoModeBadge() {
  const { demoMode, setDemoMode } = usePipelineContext();

  return (
    <div
      onClick={() => setDemoMode(!demoMode)}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 100,
        cursor: "pointer",
      }}
    >
      <Badge variant={demoMode ? "warning" : "info"}>
        {demoMode ? "Demo Mode" : "Live Mode"}
      </Badge>
    </div>
  );
}

