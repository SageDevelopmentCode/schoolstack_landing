"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

export type ConfirmDialogProps = {
  C: AdminThemeTokens;
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  C,
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
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

  const confirmStyle =
    variant === "destructive"
      ? getAdminButtonStyle(C, "danger")
      : getAdminButtonStyle(C, "primary");

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
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            className="w-full max-w-md overflow-hidden rounded-lg shadow-xl"
            style={{ backgroundColor: C.surface }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-2">
              <h2
                id="confirm-dialog-title"
                className="text-lg font-semibold"
                style={{ color: C.textPrimary }}
              >
                {title}
              </h2>
              <p
                id="confirm-dialog-description"
                className="mt-2 text-sm leading-relaxed"
                style={{ color: C.textSecondary }}
              >
                {description}
              </p>
            </div>

            <div
              className="flex justify-end gap-2 px-6 py-4"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
                style={getAdminButtonStyle(C, "neutral")}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
                style={confirmStyle}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
