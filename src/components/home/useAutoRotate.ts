"use client";

import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Cycles through `count` items every `intervalMs` until the user picks one.
 * Progress visuals should animate independently (see `RotateProgressBar`) so
 * the consumer does not re-render every frame.
 */
export function useAutoRotate(count: number, intervalMs = 6000) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const running = !paused && !reduceMotion;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => window.clearTimeout(id);
  }, [running, index, count, intervalMs]);

  const select = useCallback((i: number) => {
    setPaused(true);
    setIndex(i);
  }, []);

  return { index, select, running, intervalMs };
}
