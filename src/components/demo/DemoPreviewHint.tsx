"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { useEffect, useState } from "react";

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
      className={`absolute top-6 right-6 z-10 ${visible ? "pointer-events-auto" : "pointer-events-none"}`}
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
              className="max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-md"
            >
              <div className="flex items-start gap-2">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...INNER_SPRING, delay: 0.05 }}
                  className="mt-0.5 shrink-0"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-clay" aria-hidden />
                </motion.div>
                <p className="flex-1 text-xs font-secondary leading-snug text-gray-600">
                  {message}
                </p>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600"
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
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-clay shadow-md transition-colors hover:border-gray-300 hover:bg-gray-50"
              aria-label="Show hint"
            >
              <Lightbulb className="h-4 w-4" aria-hidden />
            </motion.button>
          )}
        </AnimatePresence>
      ) : null}
    </motion.div>
  );
}
