"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  message: string;
  delayMs?: number;
}

export default function DemoPreviewHint({ message, delayMs = 600 }: Props) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!visible) return null;

  return (
    <div className="pointer-events-auto absolute top-6 right-6 z-10">
      <AnimatePresence mode="wait" initial={false}>
        {expanded ? (
          <motion.div
            key="expanded"
            role="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-md"
          >
            <div className="flex items-start gap-2">
              <Lightbulb
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay"
                aria-hidden
              />
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
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={() => setExpanded(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-clay shadow-md transition-colors hover:border-gray-300 hover:bg-gray-50"
            aria-label="Show hint"
          >
            <Lightbulb className="h-4 w-4" aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
