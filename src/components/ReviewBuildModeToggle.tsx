"use client";

import { usePipelineContext } from "@/store/PipelineContext";
import Badge from "@/components/ui/Badge";

export default function ReviewBuildModeToggle() {
  const { reviewBuildMode, setReviewBuildMode } = usePipelineContext();

  return (
    <div
      onClick={() => setReviewBuildMode(!reviewBuildMode)}
      style={{
        position: "fixed",
        top: "140px",
        right: "20px",
        zIndex: 100,
        cursor: "pointer",
      }}
    >
      <Badge variant={reviewBuildMode ? "info" : "default"}>
        {reviewBuildMode ? "Review Build ON" : "Review Build OFF"}
      </Badge>
    </div>
  );
}

