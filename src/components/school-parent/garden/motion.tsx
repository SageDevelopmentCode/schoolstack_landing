"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

/*
 * Parent Garden motion. Portal timing (220–350ms), framer + IntersectionObserver
 * only: the portal scrolls inside SchoolParentPageShell's overflow container,
 * so window-based GSAP ScrollTrigger helpers from the marketing kit never fire.
 */

export const PORTAL_EASE = [0.16, 1, 0.3, 1] as const;

/** Card entrance: short fade/slide, staggered by card index. Spread onto a motion element. */
export function gFade(index: number, reduce: boolean) {
  if (reduce) return { initial: false as const };
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.04 + index * 0.05, duration: 0.32, ease: PORTAL_EASE },
  };
}

/** Counts up once visible; renders the final value first (DOM writes, no re-renders). */
export function GCountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion() === true;
  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduce || value === 0) return;
    const controls = animate(0, value, {
      duration: 1,
      ease: PORTAL_EASE,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => {
      controls.stop();
      el.textContent = String(value);
    };
  }, [inView, reduce, value]);
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}

/**
 * Small confetti burst, once per browser session per key, in the school accent
 * plus Garden pastels. Skipped under reduced motion. Use only for real
 * success moments (all caught up, payment done, enrollment complete).
 */
export function useCelebrate(active: boolean, theme: ParentThemeTokens, key = "parent-garden-celebrated") {
  const reduce = useReducedMotion() === true;
  useEffect(() => {
    if (!active || reduce) return;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage unavailable: celebrate anyway.
    }
    let cancelled = false;
    void import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      confetti({
        particleCount: 90,
        spread: 75,
        startVelocity: 34,
        origin: { y: 0.4 },
        colors: [theme.primary, "#FFE58A", "#DDEBD5", "#E3EDFB", "#ECE2F3"],
        disableForReducedMotion: true,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [active, reduce, theme, key]);
}
