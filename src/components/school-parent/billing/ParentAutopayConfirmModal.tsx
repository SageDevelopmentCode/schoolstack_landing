"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CreditCard, Loader2, Repeat, X } from "lucide-react";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  GIcon,
  G_FOCUS,
  gBtnOutlineSm,
  gBtnPopSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  formatPaymentMethodLabel,
  type SavedPaymentMethodSummary,
} from "@/lib/tuition/payment-methods";

type ParentAutopayConfirmModalProps = {
  /** Kept for call-site compatibility; the dialog uses Garden tokens. */
  C?: AdminThemeTokens;
  theme: ParentThemeTokens;
  open: boolean;
  enabling: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  saving: boolean;
  /** Opens card setup when no card is saved yet. */
  onAddPaymentMethod?: () => void;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Confirm turning autopay on or off (Garden dialog, outside the page frame). */
export default function ParentAutopayConfirmModal({
  theme,
  open,
  enabling,
  savedPaymentMethod,
  saving,
  onAddPaymentMethod,
  onConfirm,
  onCancel,
}: ParentAutopayConfirmModalProps) {
  const reduce = useReducedMotion() === true;
  const paymentLabel = formatPaymentMethodLabel(savedPaymentMethod);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancelRef.current();
    };
    window.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => dialogRef.current?.focus(), 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 cursor-default bg-[rgba(43,36,29,0.42)] backdrop-blur-[2px]"
            onClick={onCancel}
          />
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="autopay-confirm-title"
            className="relative w-full outline-none sm:max-w-md"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: PORTAL_EASE }}
          >
            <ParentGardenFrame
              theme={theme}
              className="flex flex-col gap-5 rounded-t-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:rounded-[24px] sm:p-6"
            >
              <div className="flex items-start gap-3">
                <GIcon>
                  <Repeat />
                </GIcon>
                <div className="min-w-0 flex-1">
                  <h2
                    id="autopay-confirm-title"
                    className="sf-display m-0 text-[1.4rem] leading-[1.05] text-[var(--sf-ink)]"
                  >
                    {enabling ? "Turn on autopay?" : "Turn off autopay?"}
                  </h2>
                  <p className="m-0 mt-1.5 text-sm font-semibold text-[var(--sf-soft)]">
                    {enabling
                      ? "Your saved payment method will be charged automatically on each due date."
                      : "You will need to pay each tuition charge manually in the parent portal."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onCancel}
                  aria-label="Close"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/20 text-[var(--sf-ink)]/70 hover:border-[var(--sf-ink)]/50 ${G_FOCUS}`}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              {enabling ? (
                paymentLabel ? (
                  <p className="sf-paper m-0 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--sf-soft)]">
                    <CreditCard className="h-4 w-4 text-[var(--sf-clay-deep)]" aria-hidden />
                    Saved card:{" "}
                    <span className="font-extrabold text-[var(--sf-ink)]">{paymentLabel}</span>
                  </p>
                ) : (
                  <div
                    className="rounded-2xl bg-[var(--sf-peach)] px-4 py-3 text-sm font-semibold text-[var(--sf-ink)]"
                    data-testid="autopay-no-card-warning"
                  >
                    <p className="m-0">
                      Add a payment method before autopay can run. You can add a card below
                      without paying a charge.
                    </p>
                    {onAddPaymentMethod ? (
                      <button
                        type="button"
                        className={`${gLinkSm} mt-2`}
                        onClick={onAddPaymentMethod}
                      >
                        Add a card →
                      </button>
                    ) : null}
                  </div>
                )
              ) : null}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={saving}
                  className={gBtnOutlineSm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={saving}
                  aria-busy={saving || undefined}
                  className={gBtnPopSm}
                  data-testid="autopay-confirm-button"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                  {saving
                    ? "Saving…"
                    : enabling
                      ? "Turn on autopay"
                      : "Turn off autopay"}
                </button>
              </div>
            </ParentGardenFrame>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
