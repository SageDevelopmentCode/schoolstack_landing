"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import ParentGardenFrame from "./ParentGardenFrame";
import { GKicker, G_FOCUS } from "./ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type GSidePanelProps = {
  theme: ParentThemeTokens;
  open: boolean;
  title: string;
  kicker?: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** Sticky action row under the scrolling body (primary action last). */
  footer?: ReactNode;
  testId: string;
  panelId: string;
};

/**
 * Garden right-hand drawer for parent pages (billing receipts, calendar event
 * details, …). Mount it OUTSIDE the page's ParentGardenFrame: it carries its
 * own frame for fonts + school accent. Escape closes, focus moves to Close on
 * open and returns to the opener on close. Full width on phones.
 */
export default function GSidePanel({
  theme,
  open,
  title,
  kicker,
  subtitle,
  onClose,
  children,
  footer,
  testId,
  panelId,
}: GSidePanelProps) {
  const reduce = useReducedMotion() === true;
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-[rgba(43,36,29,0.42)] backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${panelId}-title`}
            initial={reduce ? { opacity: 0 } : { x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: "100%", opacity: 0 }}
            transition={reduce ? { duration: 0.15 } : { type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-full flex-col overflow-hidden sm:w-[min(100%,30rem)]"
            onClick={(event) => event.stopPropagation()}
            data-testid={testId}
          >
            <ParentGardenFrame
              theme={theme}
              className="flex h-full flex-col border-l-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-cream)] shadow-[-12px_0_40px_-20px_rgba(43,36,29,0.45)]"
            >
              <div className="flex items-start justify-between gap-3 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-white px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  {kicker ? <GKicker>{kicker}</GKicker> : null}
                  <h2
                    id={`${panelId}-title`}
                    className="sf-display m-0 mt-1 text-[1.5rem] leading-[1.05] text-[var(--sf-ink)]"
                  >
                    {title}
                  </h2>
                  {subtitle ? (
                    <div className="mt-1.5 text-[13px] font-semibold text-[var(--sf-soft)]">
                      {subtitle}
                    </div>
                  ) : null}
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)]/70 transition-all hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/50 hover:text-[var(--sf-ink)] ${G_FOCUS}`}
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
                {children}
              </div>
              {footer ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2.5 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
                  {footer}
                </div>
              ) : null}
            </ParentGardenFrame>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
