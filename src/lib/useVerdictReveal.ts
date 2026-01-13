import { useState, useEffect } from "react";
import { MOTION_TIMINGS } from "./motion";

/**
 * Hook for verdict reveal delay (300-500ms)
 * Returns true after the delay, false initially
 */
export function useVerdictReveal(shouldReveal: boolean): boolean {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (shouldReveal && !isRevealed) {
      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, MOTION_TIMINGS.verdictPause);

      return () => clearTimeout(timer);
    }
  }, [shouldReveal, isRevealed]);

  return isRevealed;
}

