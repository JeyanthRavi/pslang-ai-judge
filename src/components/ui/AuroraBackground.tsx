"use client";

import { useEffect, useRef } from "react";

export default function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Aurora gradient effect
      const gradient1 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient1.addColorStop(0, `rgba(139, 92, 246, ${0.15 + Math.sin(time * 0.001) * 0.05})`);
      gradient1.addColorStop(0.5, `rgba(59, 130, 246, ${0.1 + Math.cos(time * 0.0012) * 0.05})`);
      gradient1.addColorStop(1, `rgba(236, 72, 153, ${0.12 + Math.sin(time * 0.0008) * 0.05})`);

      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Second layer for depth
      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.3 + Math.sin(time * 0.0005) * 100,
        canvas.height * 0.4 + Math.cos(time * 0.0007) * 80,
        0,
        canvas.width * 0.3,
        canvas.height * 0.4,
        canvas.width * 0.8
      );
      gradient2.addColorStop(0, `rgba(168, 85, 247, ${0.08})`);
      gradient2.addColorStop(1, "rgba(168, 85, 247, 0)");

      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 16; // ~60fps
      animationFrameId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{
        opacity: 0.6,
        mixBlendMode: "screen",
        pointerEvents: "none", // Don't intercept clicks
      }}
      aria-hidden="true"
    />
  );
}

