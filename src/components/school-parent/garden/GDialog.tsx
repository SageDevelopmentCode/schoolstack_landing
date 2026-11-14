"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Loader2, X } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import ParentGardenFrame from "./ParentGardenFrame";
import { PORTAL_EASE } from "./motion";
import { GIcon, G_FOCUS, gBtnOutlineSm, gBtnPopSm } from "./ui";

/*
 * Garden dialog shell for the parent portal.
 * - Portalled to <body> with its own ParentGardenFrame, so it is safe to
 *   mount from inside a page frame (cards use transforms, which would trap a
 *   fixed overlay) and never restyles portal chrome.
 * - Bottom sheet on phones, centred card from `sm`.
 * - role="dialog" + aria-modal, Escape closes, focus moves in on open, is
 *   trapped with Tab, and returns to the opener on close.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setIsClient(true));
  }, []);
  return isClient;
}

export function GDialog({
  theme,
  open,
  onClose,
  title,
  titleId: titleIdProp,
  description,
  icon,
  children,
  footer,
  size = "md",
  closeDisabled = false,
  initialFocusRef,
  "data-testid": testId,
  hideCloseButton = false,
}: {
  theme: ParentThemeTokens;
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  titleId?: string;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Blocks Escape/backdrop close while an action is running. */
  closeDisabled?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  "data-testid"?: string;
  hideCloseButton?: boolean;
}) {
  const reduce = useReducedMotion() === true;
  const isClient = useIsClient();
  const generatedTitleId = useId();
  const titleId = titleIdProp ?? generatedTitleId;
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const closeDisabledRef = useRef(closeDisabled);
  useEffect(() => {
    onCloseRef.current = onClose;
    closeDisabledRef.current = closeDisabled;
  }, [onClose, closeDisabled]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      const target =
        initialFocusRef?.current ??
        panelRef.current?.querySelector<HTMLElement>("[data-autofocus]") ??
        panelRef.current;
      target?.focus();
    }, 60);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (closeDisabledRef.current) return;
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
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [open, initialFocusRef]);

  if (!isClient) return null;

  const width = size === "lg" ? "sm:max-w-xl" : size === "sm" ? "sm:max-w-sm" : "sm:max-w-md";

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            className="absolute inset-0 cursor-default bg-[rgba(43,36,29,0.42)] backdrop-blur-[2px]"
            onClick={() => {
              if (!closeDisabled) onClose();
            }}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            data-testid={testId}
            className={`relative flex max-h-[92dvh] w-full outline-none ${width}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.28, ease: PORTAL_EASE }}
          >
            <ParentGardenFrame
              theme={theme}
              className="flex max-h-[92dvh] min-h-0 flex-col rounded-t-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:rounded-[24px]"
            >
              <span
                aria-hidden="true"
                className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-[var(--sf-ink)]/15 sm:hidden"
              />
              <div className="flex shrink-0 items-start gap-3 px-5 pt-4 sm:px-6 sm:pt-6">
                {icon ? <GIcon>{icon}</GIcon> : null}
                <div className="min-w-0 flex-1">
                  <h2
                    id={titleId}
                    className="sf-display m-0 text-[1.4rem] leading-[1.05] text-[var(--sf-ink)]"
                  >
                    {title}
                  </h2>
                  {description ? (
                    <div
                      id={descriptionId}
                      className="m-0 mt-1.5 text-sm font-semibold text-[var(--sf-soft)]"
                    >
                      {description}
                    </div>
                  ) : null}
                </div>
                {hideCloseButton ? null : (
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={closeDisabled}
                    aria-label="Close"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/20 text-[var(--sf-ink)]/70 transition-colors hover:border-[var(--sf-ink)]/50 hover:text-[var(--sf-ink)] disabled:opacity-50 ${G_FOCUS}`}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
              {children ? (
                <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 sm:px-6">{children}</div>
              ) : null}
              {footer ? (
                <div className="flex shrink-0 flex-col-reverse gap-2 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:flex-row sm:justify-end sm:px-6 sm:pb-6">
                  {footer}
                </div>
              ) : (
                <div className="h-5 shrink-0 sm:h-6" aria-hidden="true" />
              )}
            </ParentGardenFrame>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/** Garden confirm dialog: outline Cancel + the view's one toy confirm button. */
export function GConfirmDialog({
  theme,
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  loadingLabel,
  destructive = false,
  loading = false,
  icon,
  onConfirm,
  onClose,
  "data-testid": testId,
  confirmTestId,
}: {
  theme: ParentThemeTokens;
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  loadingLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  "data-testid"?: string;
  /** data-testid on the confirm button. */
  confirmTestId?: string;
}) {
  return (
    <GDialog
      theme={theme}
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      icon={icon ?? (destructive ? <AlertTriangle /> : undefined)}
      size="sm"
      closeDisabled={loading}
      data-testid={testId}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={gBtnOutlineSm}
            data-autofocus
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading || undefined}
            data-testid={confirmTestId}
            className={`${gBtnPopSm} ${destructive ? "!bg-[#b42318]" : ""}`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {loading ? (loadingLabel ?? `${confirmLabel}…`) : confirmLabel}
          </button>
        </>
      }
    />
  );
}
