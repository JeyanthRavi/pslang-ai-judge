"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export default function VerbaHammer() {
  const hammerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hammerRef.current || !handleRef.current || !headRef.current || !stampRef.current) return;

    // Continuous floating animation
    const floatAnimation = gsap.to(hammerRef.current, {
      y: -10,
      duration: 2,
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true,
    });

    // Swing and stamp animation (triggered on mount and periodically)
    const swingAndStamp = () => {
      const tl = gsap.timeline();

      // Swing down
      tl.to(handleRef.current, {
        rotation: 25,
        duration: 0.3,
        ease: "power2.out",
      })
        .to(
          headRef.current,
          {
            rotation: -15,
            duration: 0.3,
            ease: "power2.out",
          },
          "<"
        )
        // Impact
        .to(
          stampRef.current,
          {
            scale: 1.2,
            opacity: 1,
            duration: 0.1,
            ease: "power2.out",
          },
          "-=0.1"
        )
        // Bounce back
        .to(handleRef.current, {
          rotation: 0,
          duration: 0.4,
          ease: "elastic.out(1, 0.5)",
        })
        .to(
          headRef.current,
          {
            rotation: 0,
            duration: 0.4,
            ease: "elastic.out(1, 0.5)",
          },
          "<"
        )
        .to(
          stampRef.current,
          {
            scale: 0,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
          },
          "-=0.2"
        );
    };

    // Initial swing after a delay
    const initialDelay = setTimeout(swingAndStamp, 1000);

    // Periodic swings
    const interval = setInterval(swingAndStamp, 5000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
      floatAnimation.kill();
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center" style={{ height: "200px", width: "200px" }}>
      {/* Hammer */}
      <motion.div
        ref={hammerRef}
        className="relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Handle */}
        <div
          ref={handleRef}
          className="absolute"
          style={{
            width: "8px",
            height: "120px",
            background: "linear-gradient(180deg, #8B5CF6 0%, #6366F1 100%)",
            borderRadius: "4px",
            top: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
          }}
        />

        {/* Head */}
        <div
          ref={headRef}
          className="absolute"
          style={{
            width: "60px",
            height: "40px",
            background: "linear-gradient(135deg, #A855F7 0%, #8B5CF6 50%, #6366F1 100%)",
            borderRadius: "8px",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            boxShadow: "0 8px 24px rgba(139, 92, 246, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
          }}
        />
      </motion.div>

      {/* Stamp effect */}
      <motion.div
        ref={stampRef}
        className="absolute"
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0,
          scale: 0,
        }}
      />
    </div>
  );
}

