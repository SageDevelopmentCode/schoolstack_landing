"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PerformanceResultsPanel,
  type PerformanceResultDetail,
} from "@/components/admin/PerformanceResultsPanel";
import { PerformanceResultsPanelSkeleton } from "@/components/admin/PerformanceResultsPanelSkeleton";

type DetailPreview = {
  label: string;
  category: string;
  url: string;
};

type PerformanceDetailDrawerProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  preview: DetailPreview | null;
  result: PerformanceResultDetail | null;
  onClose: () => void;
};

export function PerformanceDetailDrawer({
  open,
  loading,
  error,
  preview,
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
      {open ? (
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
            aria-busy={loading}
            className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-xl"
            style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              {result ? (
                <PerformanceResultsPanel result={result} onClose={onClose} />
              ) : error ? (
                <div className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {preview ? (
                        <>
                          <h1 className="font-display text-lg font-semibold text-text">
                            {preview.label}
                          </h1>
                          <p className="font-secondary text-sm text-text-muted capitalize">
                            {preview.category.replace(/_/g, " ")}
                          </p>
                        </>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="shrink-0 rounded-lg border border-border px-2 py-1 text-xs text-text-muted hover:bg-surface-soft"
                    >
                      Close
                    </button>
                  </div>
                  <p className="rounded-lg border border-clay/30 bg-clay/5 px-3 py-2 text-sm text-clay">
                    {error}
                  </p>
                </div>
              ) : (
                <PerformanceResultsPanelSkeleton
                  label={preview?.label}
                  category={preview?.category}
                  onClose={onClose}
                />
              )}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export type { DetailPreview };
