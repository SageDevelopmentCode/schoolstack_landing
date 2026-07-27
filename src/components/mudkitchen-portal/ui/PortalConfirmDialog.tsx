"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { usePortalTheme } from "@/components/mudkitchen-portal/PortalThemeProvider";

export type PortalConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  eyebrow?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
};

export default function PortalConfirmDialog({
  open,
  title,
  description,
  eyebrow,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onClose,
  children,
}: PortalConfirmDialogProps) {
  const T = usePortalTheme();

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
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(250, 248, 244, 0.88)" }}
          onClick={loading ? undefined : onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ type: "spring", damping: 32, stiffness: 380 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="portal-confirm-dialog-title"
            aria-describedby="portal-confirm-dialog-description"
            className="w-full max-w-md overflow-hidden rounded-[14px] border"
            style={{
              backgroundColor: T.surface,
              borderColor: T.border,
              boxShadow: "0 24px 48px rgba(15, 23, 42, 0.12)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-6 pt-6">
              {eyebrow ? (
                <p
                  className="font-secondary text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: T.textFaint }}
                >
                  {eyebrow}
                </p>
              ) : null}
              <h2
                id="portal-confirm-dialog-title"
                className={`font-heading text-[1.35rem] font-medium leading-snug ${eyebrow ? "mt-2" : ""}`}
                style={{ color: T.textPrimary }}
              >
                {title}
              </h2>
              <p
                id="portal-confirm-dialog-description"
                className="font-secondary mt-2 text-[14px] leading-relaxed"
                style={{ color: T.textSecondary }}
              >
                {description}
              </p>
              {children ? <div className="mt-5">{children}</div> : null}
            </div>

            <div className="flex flex-col-reverse gap-2.5 px-6 pb-6 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="font-secondary inline-flex h-10 items-center justify-center rounded-[10px] border px-4 text-sm font-medium transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  color: T.textPrimary,
                  backgroundColor: "transparent",
                  borderColor: T.border,
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor = T.stepBg;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="font-secondary inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: T.accent }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
