"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ACCENT_HIGHLIGHT, BOLD_HEADING } from "@/components/home/bright-styles";

const PHRASES = [
  "MudKitchen",
  "parent enrollment",
  "family updates",
  "a home parents open",
  "tuition in one place",
] as const;

/** Time before the next crossfade, including the 0.9s fade. */
const PHRASE_MS = 4000;

const FADE = { duration: 0.9, ease: [0.45, 0, 0.55, 1] } as const;

export default function TryFreeHeadline() {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const phrase = prefersReducedMotion ? PHRASES[0] : PHRASES[index];

  useEffect(() => {
    if (prefersReducedMotion !== false) return;
    const id = window.setTimeout(() => {
      setIndex((current) => (current + 1) % PHRASES.length);
    }, PHRASE_MS);
    return () => window.clearTimeout(id);
  }, [prefersReducedMotion, index]);

  return (
    <h1 className={`${BOLD_HEADING} text-[2.4rem] sm:text-5xl`}>
      <span className="sr-only">Try MudKitchen for free</span>
      <span aria-hidden="true" className="grid">
        <AnimatePresence initial={false}>
          <motion.span
            key={phrase}
            className="col-start-1 row-start-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE}
          >
            Try{" "}
            <span className={ACCENT_HIGHLIGHT}>{phrase}</span>{" "}
            <span className="whitespace-nowrap">for free</span>
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}
