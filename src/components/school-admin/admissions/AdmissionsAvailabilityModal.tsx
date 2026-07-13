"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import AdmissionsAvailabilityEditor from "./AdmissionsAvailabilityEditor";

type AdmissionsAvailabilityModalProps = {
  C: AdminThemeTokens;
  open: boolean;
  onClose: () => void;
  organizationId: string;
  readOnly: boolean;
  onMonthSlotCountChange?: (count: number) => void;
};

export default function AdmissionsAvailabilityModal({
  C,
  open,
  onClose,
  organizationId,
  readOnly,
  onMonthSlotCountChange,
}: AdmissionsAvailabilityModalProps) {
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
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="availability-modal-title"
            className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg shadow-xl"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <div>
                <p
                  id="availability-modal-title"
                  className="text-base font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  When are you available for visits?
                </p>
                <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                  Set open times so families can schedule visits after they apply.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="shrink-0 rounded p-1.5"
                style={{ color: C.textTertiary }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <AdmissionsAvailabilityEditor
                C={C}
                organizationId={organizationId}
                readOnly={readOnly}
                compactLayout
                onMonthSlotCountChange={onMonthSlotCountChange}
              />
            </div>

            <div
              className="flex justify-end border-t px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm px-4 py-2 text-xs font-semibold"
                style={{ backgroundColor: C.accent, color: "#FFFFFF" }}
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
