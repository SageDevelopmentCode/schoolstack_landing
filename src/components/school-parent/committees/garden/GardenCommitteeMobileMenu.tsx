"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GKicker, G_FOCUS } from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Phone menu button: shows the current section, with a dot when anything is unread. */
export function GardenCommitteeMobileMenuButton({
  currentSectionLabel,
  expanded,
  hasUnread,
  onClick,
  buttonRef,
}: {
  currentSectionLabel: string;
  expanded: boolean;
  hasUnread: boolean;
  onClick: () => void;
  buttonRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-haspopup="dialog"
      data-testid="committee-mobile-menu-button"
      className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] border-[var(--sf-ink)]/25 bg-white px-3 py-2 text-[13px] font-extrabold text-[var(--sf-ink)] transition-colors hover:border-[var(--sf-ink)]/50 ${G_FOCUS}`}
    >
      <Menu className="h-4 w-4 shrink-0" aria-hidden />
      <span className="max-w-[8rem] truncate">{currentSectionLabel}</span>
      {hasUnread ? (
        <>
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--sf-clay)]"
          />
          <span className="sr-only">(new updates)</span>
        </>
      ) : null}
    </button>
  );
}

/**
 * Phone section menu for the committee workspace: a Garden sheet that slides
 * in from the right, portalled with its own frame (so the page's Garden type
 * reset never reaches it twice). Escape and the backdrop close it, focus moves
 * to Close on open and is trapped inside while open.
 */
export default function GardenCommitteeMobileMenu({
  theme,
  open,
  title,
  kicker,
  chips,
  description,
  nav,
  onClose,
}: {
  theme: ParentThemeTokens;
  open: boolean;
  title: string;
  kicker?: ReactNode;
  chips?: ReactNode;
  description?: ReactNode;
  nav: ReactNode;
  onClose: () => void;
}) {
  const reduce = useReducedMotion() === true;
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    queueMicrotask(() => setIsClient(true));
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const nodes = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (node) => node.offsetParent !== null,
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="committee-mobile-menu-sheet"
        >
          <ParentGardenFrame theme={theme} className="!min-h-0 h-full">
            <div
              className="absolute inset-0 bg-[rgba(43,36,29,0.42)] backdrop-blur-[2px]"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-label="Committee sections"
              initial={reduce ? { opacity: 0 } : { x: "100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }}
              transition={{ duration: 0.3, ease: PORTAL_EASE }}
              className="absolute inset-y-0 right-0 flex w-[min(100%,26rem)] max-w-full flex-col overflow-hidden rounded-l-[24px] border-l-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[-12px_0_40px_-20px_rgba(43,36,29,0.5)]"
            >
              <div className="flex items-start justify-between gap-3 border-b-[1.5px] border-[var(--sf-ink)]/10 px-5 pb-4 pt-5">
                <div className="min-w-0 flex-1">
                  {kicker ? <GKicker className="mb-1">{kicker}</GKicker> : null}
                  <h2 id={titleId} className="sf-display m-0 text-[1.4rem] leading-[1.05] text-[var(--sf-ink)]">
                    {title}
                  </h2>
                  {chips ? <div className="mt-2 flex flex-wrap items-center gap-1.5">{chips}</div> : null}
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close committee menu"
                  className={`-mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--sf-ink)]/70 hover:bg-[var(--sf-ink)]/[0.06] ${G_FOCUS} focus-visible:ring-offset-0`}
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {description ? <div className="mb-4 px-1">{description}</div> : null}
                <GKicker className="mb-2 px-1">Workspace</GKicker>
                {nav}
              </div>
            </motion.aside>
          </ParentGardenFrame>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
