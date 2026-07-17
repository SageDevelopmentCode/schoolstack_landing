"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PerformanceResultsPanel,
  type PerformanceResultDetail,
} from "@/components/admin/PerformanceResultsPanel";

type PerformanceDetailDrawerProps = {
  open: boolean;
  result: PerformanceResultDetail | null;
  onClose: () => void;
};

export function PerformanceDetailDrawer({
  open,
  result,
  onClose,
}: PerformanceDetailDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && result ? (
        <div className="fixed inset-x-0 bottom-0 top-12 z-40 flex justify-end">
          <motion.button
            type="button"
            aria-label="Close audit details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-xl"
            style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <PerformanceResultsPanel result={result} onClose={onClose} />
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
