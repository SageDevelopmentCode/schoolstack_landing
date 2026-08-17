"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { EnrollmentDocumentChange } from "@/lib/admissions/enrollment-checklist-document-changes";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

export type EnrollmentChecklistResignConfirmDialogProps = {
  C: AdminThemeTokens;
  open: boolean;
  documentChanges: EnrollmentDocumentChange[];
  loading?: boolean;
  onConfirm: (input: { requireResign: boolean; message?: string }) => void;
  onClose: () => void;
};

export default function EnrollmentChecklistResignConfirmDialog({
  C,
  open,
  documentChanges,
  loading = false,
  onConfirm,
  onClose,
}: EnrollmentChecklistResignConfirmDialogProps) {
  const [requireResign, setRequireResign] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setRequireResign(true);
      setMessage("");
    });
  }, [open]);

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

  const primaryStyle = getAdminButtonStyle(C, "primary");
  const secondaryStyle = getAdminButtonStyle(C, "secondary");

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
            aria-labelledby="checklist-resign-dialog-title"
            className="w-full max-w-lg overflow-hidden rounded-lg shadow-xl"
            style={{ backgroundColor: C.surface }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-4 px-6 pt-6 pb-2">
              <h2
                id="checklist-resign-dialog-title"
                className="text-lg font-semibold"
                style={{ color: C.textPrimary }}
              >
                Agreement content changed
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                You edited enrollment agreement text. Families who already signed may
                need to review the updates.
              </p>
              <ul className="space-y-2 text-sm" style={{ color: C.textSecondary }}>
                {documentChanges.map((change) => (
                  <li key={change.checklistItemId}>
                    <span className="font-medium" style={{ color: C.textPrimary }}>
                      {change.checklistItemLabel}
                    </span>
                    <ul className="mt-1 list-disc pl-5">
                      {change.changedSections.map((section) => (
                        <li key={section.sectionId}>{section.sectionTitle}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={requireResign}
                  disabled={loading}
                  onChange={(event) => setRequireResign(event.target.checked)}
                />
                <span style={{ color: C.textPrimary }}>
                  Require families to review and re-sign the changed sections
                </span>
              </label>
              {requireResign ? (
                <div className="space-y-2">
                  <label
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: C.textTertiary }}
                    htmlFor="checklist-resign-message"
                  >
                    Message for families (optional)
                  </label>
                  <textarea
                    id="checklist-resign-message"
                    rows={3}
                    value={message}
                    disabled={loading}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="An enrollment agreement section was updated. Please review and re-sign."
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{
                      borderColor: C.border,
                      color: C.textPrimary,
                      backgroundColor: C.bg,
                    }}
                  />
                </div>
              ) : null}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium"
                style={secondaryStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  onConfirm({
                    requireResign,
                    message: message.trim() || undefined,
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                style={primaryStyle}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
