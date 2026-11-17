"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Tape } from "@/components/garden/ui";

interface Props {
  message: string;
  delayMs?: number;
}

const SPRING_TRANSITION = {
  type: "spring" as const,
  damping: 26,
  stiffness: 280,
  mass: 0.85,
};

const INNER_SPRING = {
  type: "spring" as const,
  damping: 28,
  stiffness: 320,
  mass: 0.8,
};

export default function DemoPreviewHint({ message, delayMs = 600 }: Props) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  return (
    <motion.div
      className={`absolute top-8 right-8 z-10 lg:top-12 lg:right-12 ${visible ? "pointer-events-auto" : "pointer-events-none"}`}
      initial={{ opacity: 0, y: -10, x: 12, scale: 0.96 }}
      animate={
        visible
          ? { opacity: 1, y: 0, x: 0, scale: 1 }
          : { opacity: 0, y: -10, x: 12, scale: 0.96 }
      }
      exit={{ opacity: 0, y: -6, x: 8, scale: 0.98 }}
      transition={SPRING_TRANSITION}
    >
      {visible ? (
        <AnimatePresence mode="popLayout" initial={false}>
          {expanded ? (
            <motion.div
              key="expanded"
              layout
              role="status"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={INNER_SPRING}
              style={{ rotate: "1.5deg" }}
              className="relative max-w-xs rounded-md bg-[var(--sf-butter)] px-3 pb-3 pt-3.5 shadow-[0_14px_30px_-16px_rgba(43,36,29,0.55)]"
            >
              <Tape color="var(--sf-peach)" className="-top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-2" />
              <div className="flex items-start gap-2.5">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...INNER_SPRING, delay: 0.05 }}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white ring-2 ring-[var(--sf-ink)]"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-[var(--sf-ink)]" strokeWidth={2.4} aria-hidden />
                </motion.div>
                <p className="flex-1 pt-0.5 text-[13px] font-bold leading-snug text-[var(--sf-ink)]">
                  {message}
                </p>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="shrink-0 rounded-full p-0.5 text-[var(--sf-ink)]/55 transition-colors hover:text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
                  aria-label="Collapse hint"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="collapsed"
              layout
              type="button"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={INNER_SPRING}
              onClick={() => setExpanded(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
              aria-label="Show hint"
            >
              <Lightbulb className="h-4 w-4" strokeWidth={2.4} aria-hidden />
            </motion.button>
          )}
        </AnimatePresence>
      ) : null}
    </motion.div>
  );
}
