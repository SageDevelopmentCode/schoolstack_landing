"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { PORTAL_EASE } from "./PortalReveal";
import { btnSmForest, btnSmOutline } from "./buttons";

/**
 * Garden confirm dialog for the MudKitchen account area. Confirm is the forest
 * toy (confirmation colour); Cancel is an outline. Focus moves into the dialog
 * on open, Tab stays inside it, and focus returns to the opener on close.
 */
export default function PortalGardenConfirmDialog({
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
}: {
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
}) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => cancelRef.current?.focus());

    return () => {
      cancelAnimationFrame(frame);
      openerRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.22, ease: PORTAL_EASE }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[var(--sf-cream)]/85 p-4 backdrop-blur-sm"
          onClick={loading ? undefined : onClose}
          role="presentation"
        >
          <motion.div
            ref={dialogRef}
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 6 }}
            transition={{ type: "spring", damping: 26, stiffness: 380 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="w-full max-w-md rounded-[28px] border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] p-6 shadow-[0_10px_0_0_var(--sf-ink)] sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            {eyebrow ? (
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--sf-soft)]">{eyebrow}</p>
            ) : null}
            <h2
              id={titleId}
              className={`sf-display text-[1.9rem] leading-[1.05] text-[var(--sf-ink)] ${eyebrow ? "mt-2" : ""}`}
            >
              {title}
            </h2>
            <p id={descriptionId} className="mt-3 text-[15px] leading-relaxed text-[var(--sf-soft)]">
              {description}
            </p>
            {children ? <div className="mt-5">{children}</div> : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                onClick={onClose}
                disabled={loading}
                className={btnSmOutline}
              >
                {cancelLabel}
              </button>
              <button type="button" onClick={onConfirm} disabled={loading} className={btnSmForest}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
