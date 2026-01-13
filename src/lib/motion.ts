import { Variants, Transition } from "framer-motion";

/**
 * Certified Label UI Motion Timings
 * Based on cassette printing / analog authority feel
 */
export const MOTION_TIMINGS = {
  inputFeedback: 120, // 80-140ms range
  stepTransition: 300, // 260-340ms range
  verdictPause: 400, // 350-450ms range
  sealStamp: 220, // 180-260ms range
  pulseCycle: 1800, // 1600-2200ms range
} as const;

/**
 * Easing functions for analog authority feel
 */
export const EASINGS = {
  printIn: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // Crisp, like ink settling
  snap: [0.34, 1.56, 0.64, 1] as [number, number, number, number], // Quick snap
  stamp: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number], // Stamp settle
  serious: [0.4, 0, 0.2, 1] as [number, number, number, number], // Deliberate
  crisp: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // For compatibility
} as const;

/**
 * Base transition for step transitions
 */
export const stepTransition: Transition = {
  duration: MOTION_TIMINGS.stepTransition / 1000,
  ease: EASINGS.printIn,
};

/**
 * Step enter/exit variants (print-in feel)
 */
export const stepVariants: Variants = {
  initial: {
    opacity: 0,
    x: -10,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: stepTransition,
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: {
      duration: MOTION_TIMINGS.inputFeedback / 1000,
      ease: EASINGS.printIn,
    },
  },
};

/**
 * Print-in animation (slide 10px + opacity)
 */
export const printInVariants: Variants = {
  initial: {
    opacity: 0,
    x: -10,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: MOTION_TIMINGS.inputFeedback / 1000,
      ease: EASINGS.printIn,
    },
  },
};

/**
 * Snap animation (scale 0.98 → 1.00 quickly)
 */
export const snapVariants: Variants = {
  initial: {
    scale: 0.98,
  },
  animate: {
    scale: 1,
    transition: {
      duration: MOTION_TIMINGS.inputFeedback / 1000,
      ease: EASINGS.snap,
    },
  },
};

/**
 * Stamp animation (diagonal slide + rotation, then settle)
 */
export const stampVariants: Variants = {
  initial: {
    opacity: 0,
    x: -5,
    y: -5,
    rotate: -2,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: {
      duration: MOTION_TIMINGS.sealStamp / 1000,
      ease: EASINGS.stamp,
    },
  },
};

/**
 * Hero ID print-in (like T-120 identifier)
 */
export const heroIdVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: EASINGS.printIn,
    },
  },
};

/**
 * Line-by-line reveal (printer feel)
 */
export const lineRevealVariants: Variants = {
  initial: {
    opacity: 0,
    x: -12,
  },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.08,
      duration: MOTION_TIMINGS.inputFeedback / 1000,
      ease: EASINGS.printIn,
    },
  }),
};

/**
 * Button industrial variants
 */
export const buttonIndustrialVariants = {
  hover: {
    y: -1,
    boxShadow: "0 2px 8px rgba(26, 26, 26, 0.15)",
    transition: {
      duration: MOTION_TIMINGS.inputFeedback / 1000,
      ease: EASINGS.printIn,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      duration: MOTION_TIMINGS.inputFeedback / 1000 / 2,
      ease: EASINGS.snap,
    },
  },
};

/**
 * Rail status indicator variants (kept for compatibility)
 */
export const railStatusVariants: Variants = {
  locked: {
    scale: 1,
    opacity: 0.4,
  },
  active: {
    scale: 1.05,
    opacity: 1,
    transition: {
      duration: MOTION_TIMINGS.inputFeedback / 1000,
      ease: EASINGS.crisp,
    },
  },
  completed: {
    scale: 1,
    opacity: 0.7,
  },
};

/**
 * Checkmark scale-in animation (kept for compatibility)
 */
export const checkmarkVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: MOTION_TIMINGS.inputFeedback / 1000,
      ease: EASINGS.snap,
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
};

/**
 * Lock badge reveal animation (kept for compatibility)
 */
export const lockBadgeVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: MOTION_TIMINGS.inputFeedback / 1000,
      ease: EASINGS.snap,
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

/**
 * Focus zoom (1-2% scale on voice start)
 */
export const focusZoomVariants: Variants = {
  idle: {
    scale: 1,
  },
  focused: {
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: EASINGS.printIn,
    },
  },
};

/**
 * Scanline wipe (for PDF reading)
 */
export const scanlineVariants: Variants = {
  initial: {
    x: "-100%",
  },
  animate: {
    x: "100%",
    transition: {
      duration: 0.8,
      ease: "linear",
      repeat: Infinity,
      repeatDelay: 1.5,
    },
  },
};

/**
 * Ink fill effect (for status checkpoints)
 */
export const inkFillVariants: Variants = {
  initial: {
    width: "0%",
  },
  animate: {
    width: "100%",
    transition: {
      duration: 0.4,
      ease: EASINGS.printIn,
    },
  },
};

/**
 * Type-in effect (for extracted fields)
 */
export const typeInVariants: Variants = {
  initial: {
    opacity: 0,
    width: 0,
  },
  animate: {
    opacity: 1,
    width: "auto",
    transition: {
      duration: 0.1,
      ease: EASINGS.snap,
    },
  },
};

/**
 * Verdict reveal (hard snap + tiny vibration)
 */
export const verdictRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: MOTION_TIMINGS.verdictPause / 1000,
      duration: 0.2,
      ease: EASINGS.snap,
    },
  },
};

/**
 * Serious pulse (slow, deliberate)
 */
export const seriousPulseVariants: Variants = {
  pulse: {
    opacity: [1, 0.4, 1],
    transition: {
      duration: MOTION_TIMINGS.pulseCycle / 1000,
      ease: EASINGS.serious,
      repeat: Infinity,
    },
  },
};
