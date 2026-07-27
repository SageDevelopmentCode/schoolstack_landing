"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

type MarkEnrolledDialogProps = {
  C: AdminThemeTokens;
  open: boolean;
  loading?: boolean;
  hasPublishedChecklist?: boolean;
  onCompleteChecklist: () => void;
  onEnrollOnly: () => void;
  onClose: () => void;
};

export default function MarkEnrolledDialog({
  C,
  open,
  loading = false,
  hasPublishedChecklist = true,
  onCompleteChecklist,
  onEnrollOnly,
  onClose,
}: MarkEnrolledDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={loading ? undefined : onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mark-enrolled-dialog-title"
            aria-describedby="mark-enrolled-dialog-description"
            className="w-full max-w-lg overflow-hidden rounded-lg shadow-xl"
            style={{ backgroundColor: C.surface }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-2">
              <h2
                id="mark-enrolled-dialog-title"
                className="text-lg font-semibold"
                style={{ color: C.textPrimary }}
              >
                Mark as enrolled?
              </h2>
              <p
                id="mark-enrolled-dialog-description"
                className="mt-2 text-sm leading-relaxed"
                style={{ color: C.textSecondary }}
              >
                {hasPublishedChecklist
                  ? "Choose how to handle the enrollment checklist and any fees. The family will be able to access the parent portal once their account is linked."
                  : "This marks the student as enrolled immediately. The family will be able to access the parent portal once their account is linked."}
              </p>
            </div>

            <div
              className="flex flex-col gap-2 px-6 py-4"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              {hasPublishedChecklist ? (
                <>
                  <button
                    type="button"
                    onClick={onCompleteChecklist}
                    disabled={loading}
                    className="flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-left text-sm font-semibold disabled:opacity-50"
                    style={getAdminButtonStyle(C, "primary")}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Complete checklist and record payments
                  </button>
                  <p className="px-1 text-xs leading-relaxed" style={{ color: C.textTertiary }}>
                    Marks every enrollment step done and records supply or activity fees in
                    Payments and Finances.
                  </p>
                  <button
                    type="button"
                    onClick={onEnrollOnly}
                    disabled={loading}
                    className="mt-1 rounded-md px-4 py-2.5 text-sm font-medium disabled:opacity-50"
                    style={getAdminButtonStyle(C, "neutral")}
                  >
                    Enroll only
                  </button>
                  <p className="px-1 text-xs leading-relaxed" style={{ color: C.textTertiary }}>
                    Changes status to enrolled without updating checklist items or payments.
                  </p>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onEnrollOnly}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                  style={getAdminButtonStyle(C, "primary")}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Mark as enrolled
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="mt-1 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
                style={{ color: C.textSecondary }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
