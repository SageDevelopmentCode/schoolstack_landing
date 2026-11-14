"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { G_FOCUS } from "@/components/school-parent/garden/ui";

/*
 * Garden popover for the parent portal header (More, profile, program switch).
 *
 * - From `sm` up: an anchored card that hangs off the trigger's wrapper
 *   (render it inside a `relative` element next to the trigger).
 * - On phones: a bottom sheet portalled to <body> in its own Garden scope,
 *   with a backdrop, grab handle, title and close button.
 * - Outside click and Escape close it; Escape returns focus to the trigger.
 * - Focus moves to the `[data-autofocus]` item (or the first one) on open.
 * - Arrow keys / Home / End move between `[data-roving]` items; pass
 *   `columns` for a grid (↑/↓ jump a whole row).
 *
 * Skill: `.claude/skills/parent-portal-garden-design` › Header / nav.
 */

export const POPOVER_ITEM_ATTR = { "data-roving": "" } as const;

const PHONE_QUERY = "(max-width: 639px)";

function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setIsClient(true));
  }, []);
  return isClient;
}

function rovingItems(panel: HTMLElement | null): HTMLElement[] {
  if (!panel) return [];
  return Array.from(
    panel.querySelectorAll<HTMLElement>("[data-roving]:not([disabled])"),
  );
}

export default function GardenHeaderPopover({
  open,
  onClose,
  theme,
  id,
  triggerRef,
  anchorRef,
  label,
  sheetTitle,
  align = "right",
  widthClass = "w-[20.5rem]",
  columns,
  role = "dialog",
  children,
  "data-testid": testId,
}: {
  open: boolean;
  onClose: () => void;
  theme: ParentThemeTokens;
  id: string;
  /** The button that opens it (focus returns here). */
  triggerRef: RefObject<HTMLElement | null>;
  /** Wrapper around trigger + inline panel (outside-click boundary). Defaults to the trigger. */
  anchorRef?: RefObject<HTMLElement | null>;
  label: string;
  /** Heading shown in the phone sheet. Defaults to `label`. */
  sheetTitle?: string;
  align?: "left" | "right";
  widthClass?: string;
  /** Grid columns for arrow-key navigation (omit for a vertical list). */
  columns?: number;
  role?: "dialog" | "menu";
  children: ReactNode;
  "data-testid"?: string;
}) {
  const reduce = useReducedMotion() === true;
  const isClient = useIsClient();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closeAndReturnFocus = useCallback(() => {
    onCloseRef.current();
    queueMicrotask(() => triggerRef.current?.focus());
  }, [triggerRef]);

  // Outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const boundary = anchorRef?.current ?? triggerRef.current;
      if (boundary?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      onCloseRef.current();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeAndReturnFocus();
      }
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, anchorRef, triggerRef, closeAndReturnFocus]);

  // Move focus in on open: the current item, else the first item.
  useEffect(() => {
    if (!open) return;
    // A timer (not rAF) so it still runs in background/hidden tabs.
    const timer = window.setTimeout(() => {
      const items = rovingItems(panelRef.current);
      const current = items.find((el) => el.hasAttribute("data-autofocus"));
      (current ?? items[0] ?? panelRef.current)?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, isPhone]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const items = rovingItems(panelRef.current);
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    const step = columns ?? 1;
    let next = index;
    switch (event.key) {
      case "ArrowDown":
        next = index < 0 ? 0 : Math.min(items.length - 1, index + step);
        break;
      case "ArrowUp":
        next = index < 0 ? items.length - 1 : Math.max(0, index - step);
        break;
      case "ArrowRight":
        if (!columns) return;
        next = Math.min(items.length - 1, index + 1);
        break;
      case "ArrowLeft":
        if (!columns) return;
        next = Math.max(0, index - 1);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = items.length - 1;
        break;
    }
    event.preventDefault();
    items[next]?.focus();
  };

  // Closing when keyboard focus leaves (Tab past the last item).
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next) return;
    const boundary = anchorRef?.current ?? triggerRef.current;
    if (panelRef.current?.contains(next) || boundary?.contains(next)) return;
    onCloseRef.current();
  };

  const ariaProps = {
    id,
    role,
    "aria-label": label,
    "data-testid": testId,
    tabIndex: -1,
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
  };

  if (isPhone) {
    if (!isClient) return null;
    return createPortal(
      <AnimatePresence>
        {open ? (
          <ParentGardenScope theme={theme} className="fixed inset-0 z-[300] !bg-transparent">
            <motion.div
              key="backdrop"
              aria-hidden="true"
              className="absolute inset-0 bg-[var(--sf-ink)]/35"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => onCloseRef.current()}
            />
            <motion.div
              key="sheet"
              ref={panelRef}
              {...ariaProps}
              aria-modal="true"
              className="absolute inset-x-0 bottom-0 flex max-h-[86dvh] flex-col rounded-t-[28px] border-[1.5px] border-b-0 border-[var(--sf-ink)]/12 bg-[var(--sf-paper)] shadow-[0_-12px_40px_-20px_rgba(43,36,29,0.55)] outline-none"
              initial={reduce ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reduce ? { y: "100%", transition: { duration: 0 } } : { y: "100%" }}
              transition={{ duration: 0.3, ease: PORTAL_EASE }}
            >
              <div className="flex shrink-0 flex-col items-center px-5 pb-2 pt-2.5">
                <span aria-hidden="true" className="h-1.5 w-10 rounded-full bg-[var(--sf-ink)]/15" />
                <div className="mt-2.5 flex w-full items-center justify-between gap-3">
                  <p className="sf-display m-0 text-[1.25rem] leading-none text-[var(--sf-ink)]">
                    {sheetTitle ?? label}
                  </p>
                  <button
                    type="button"
                    onClick={closeAndReturnFocus}
                    aria-label="Close"
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)] ${G_FOCUS}`}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {children}
              </div>
            </motion.div>
          </ParentGardenScope>
        ) : null}
      </AnimatePresence>,
      document.body,
    );
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="popover"
          ref={panelRef}
          {...ariaProps}
          className={`absolute top-full z-[120] mt-2.5 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[22px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white text-[var(--sf-ink)] shadow-[0_4px_0_0_rgba(43,36,29,0.08),0_24px_48px_-24px_rgba(43,36,29,0.45)] outline-none ${
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          } ${widthClass}`}
          initial={reduce ? false : { opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.2, ease: PORTAL_EASE }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
