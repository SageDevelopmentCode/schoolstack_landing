"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/*
 * Collapsed-sidebar flyout: hover or focus an icon and a card opens to its
 * right with the name, the count and (for groups) the child links. Fixed
 * positioning escapes the aside's overflow clip; the card is a DOM child of
 * the row, so Tab moves from the icon straight into its links and moving the
 * mouse onto the card keeps it open. Escape or scrolling closes it.
 */

export default function SidebarFlyout({
  enabled,
  interactive = false,
  panel,
  children,
  className = "",
}: {
  enabled: boolean;
  /** Groups hold links; leaf tooltips are aria-hidden (the trigger is labelled). */
  interactive?: boolean;
  panel: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const open = enabled && anchor != null;

  const show = useCallback(() => {
    if (!enabled || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setAnchor({ top: rect.top, left: rect.right });
  }, [enabled]);
  const hide = useCallback(() => setAnchor(null), []);

  // Keep the card on screen: nudge it up if it would run off the bottom.
  useLayoutEffect(() => {
    const node = panelRef.current;
    if (!open || !node || !anchor) return;
    const height = node.offsetHeight;
    const maxTop = window.innerHeight - height - 8;
    node.style.top = `${Math.max(8, Math.min(anchor.top - 4, maxTop))}px`;
  }, [anchor, open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setAnchor(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={(event) => {
        if (!wrapRef.current?.contains(event.relatedTarget as Node | null)) hide();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          hide();
        }
      }}
    >
      {children}
      {open && anchor ? (
        <div
          ref={panelRef}
          aria-hidden={interactive ? undefined : true}
          className={`fixed z-[90] pl-2.5 ${interactive ? "" : "pointer-events-none"}`}
          style={{ top: anchor.top, left: anchor.left }}
        >
          <div className="min-w-[180px] max-w-[260px] rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/15 bg-white p-1.5 shadow-[0_3px_0_0_rgba(29,26,22,0.12),0_12px_28px_-12px_rgba(29,26,22,0.35)] motion-safe:animate-[sf-admin-flyout-in_140ms_ease-out]">
            {panel}
          </div>
        </div>
      ) : null}
    </div>
  );
}
