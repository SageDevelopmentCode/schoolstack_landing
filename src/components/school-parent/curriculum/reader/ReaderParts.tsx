"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Check, MessageSquare, MoreHorizontal, RotateCw } from "lucide-react";
import CurriculumDiscussionSidebar from "@/components/school-parent/curriculum/CurriculumDiscussionSidebar";
import { G_FOCUS, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { CurriculumWorkspace } from "../useCurriculumWorkspace";
import CurriculumScroll, { type ReaderZoom } from "./CurriculumScroll";
import PresentOverlay from "./PresentOverlay";

/** Round icon button used in reader toolbars. */
export const ICON_BTN = `inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/75 transition-colors hover:border-[var(--sf-ink)]/40 hover:text-[var(--sf-ink)] disabled:cursor-not-allowed disabled:opacity-40 ${G_FOCUS}`;

/** "Page [12] of 240": type a number and press Enter to jump. */
export function PageBox({
  page,
  numPages,
  onGo,
  compact = false,
}: {
  page: number;
  numPages: number;
  onGo: (page: number) => void;
  compact?: boolean;
}) {
  const id = useId();
  const [draft, setDraft] = useState(String(page));
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing) queueMicrotask(() => setDraft(String(page)));
  }, [editing, page]);

  return (
    <form
      className="flex items-center gap-1.5 text-[13px] font-extrabold text-[var(--sf-soft)]"
      onSubmit={(event) => {
        event.preventDefault();
        const value = Number(draft);
        if (Number.isFinite(value) && value >= 1) onGo(Math.min(numPages, Math.round(value)));
        (event.currentTarget.querySelector("input") as HTMLInputElement | null)?.blur();
      }}
    >
      {compact ? null : <label htmlFor={id}>Page</label>}
      <input
        id={id}
        inputMode="numeric"
        aria-label={compact ? "Page number" : undefined}
        value={draft}
        onFocus={(event) => {
          setEditing(true);
          event.currentTarget.select();
        }}
        onBlur={() => setEditing(false)}
        onChange={(event) => setDraft(event.target.value.replace(/[^0-9]/g, ""))}
        className={`h-8 w-12 rounded-[10px] border-[1.5px] border-[var(--sf-ink)]/15 bg-white text-center text-[14px] font-extrabold tabular-nums text-[var(--sf-ink)] outline-none focus:border-[var(--sf-clay)] focus:ring-4 focus:ring-[var(--sf-clay)]/15`}
      />
      <span className="tabular-nums">of {numPages || "…"}</span>
    </form>
  );
}

export const ZOOM_OPTIONS: Array<{ value: ReaderZoom; label: string }> = [
  { value: "fit-width", label: "Fit width" },
  { value: "fit-page", label: "Fit page" },
  { value: 0.75, label: "75%" },
  { value: 1, label: "100%" },
  { value: 1.25, label: "125%" },
  { value: 1.5, label: "150%" },
  { value: 2, label: "200%" },
];

export type ReaderMenuItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  /** Set for radio items (zoom). */
  checked?: boolean;
  disabled?: boolean;
  /** Extra classes on the row, e.g. `sm:hidden` for phone-only items. */
  className?: string;
  /** Keyboard hint shown on the right. */
  hint?: string;
};
export type ReaderMenuGroup = { label?: string; className?: string; items: ReaderMenuItem[] };

const MENU_ITEM_SELECTOR = '[role^="menuitem"]:not([disabled])';

/**
 * "⋯ More" button for the reader bar: secondary actions (zoom, first / last
 * page, …) in a small popover menu. Arrow keys / Home / End move, Escape or a
 * click outside closes, focus returns to the button.
 */
export function ReaderMoreMenu({ groups, footer }: { groups: ReaderMenuGroup[]; footer?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? []).filter(
      (item) => item.offsetParent !== null,
    );
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const list = Array.from(menuRef.current?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? []).filter(
      (item) => item.offsetParent !== null,
    );
    (list.find((item) => item.getAttribute("aria-checked") === "true") ?? list[0])?.focus();
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        data-testid="curriculum-more-menu"
        className={ICON_BTN}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="More options"
          onKeyDown={(event) => {
            const list = items();
            const index = list.indexOf(document.activeElement as HTMLElement);
            const move = (to: number) => {
              event.preventDefault();
              list[(to + list.length) % list.length]?.focus();
            };
            if (event.key === "ArrowDown") move(index + 1);
            else if (event.key === "ArrowUp") move(index - 1);
            else if (event.key === "Home") move(0);
            else if (event.key === "End") move(list.length - 1);
            else if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              close();
            } else if (event.key === "Tab") close(false);
            else if (event.key === "ArrowLeft" || event.key === "ArrowRight") event.preventDefault();
          }}
          className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/15 bg-white py-1.5 shadow-[0_18px_40px_-18px_rgba(40,28,18,0.45)]"
        >
          {groups.map((group, groupIndex) => (
            <div
              key={group.label ?? groupIndex}
              role="group"
              aria-label={group.label}
              className={`${groupIndex ? "mt-1.5 border-t border-[var(--sf-ink)]/10 pt-1.5" : ""} ${group.className ?? ""}`}
            >
              {group.label ? (
                <p aria-hidden className="m-0 px-4 pb-1 pt-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--sf-soft)]">
                  {group.label}
                </p>
              ) : null}
              {group.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role={item.checked === undefined ? "menuitem" : "menuitemradio"}
                  aria-checked={item.checked}
                  disabled={item.disabled}
                  tabIndex={-1}
                  onClick={() => {
                    item.onSelect();
                    close();
                  }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-[14px] font-bold text-[var(--sf-ink)] outline-none hover:bg-[var(--sf-accent-wash)] focus-visible:bg-[var(--sf-accent-wash)] disabled:cursor-not-allowed disabled:opacity-40 ${item.className ?? ""}`}
                >
                  <span aria-hidden className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--sf-ink)]/70">
                    {item.checked ? <Check className="h-4 w-4 text-[var(--sf-clay-deep)]" /> : item.icon}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.hint ? (
                    <span aria-hidden className="text-[12px] font-bold text-[var(--sf-soft)]">
                      {item.hint}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ))}
          {footer ? (
            <div className="mt-1.5 border-t border-[var(--sf-ink)]/10 px-4 pb-1 pt-2 text-[12px] font-semibold leading-relaxed text-[var(--sf-soft)]">
              {footer}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Loading skeleton / error card while the guide opens. Null once ready. */
export function ReaderStatus({ ws, className = "" }: { ws: CurriculumWorkspace; className?: string }) {
  if (ws.pdf.status === "ready") return null;
  if (ws.pdf.status === "error") {
    return (
      <div className={`flex min-h-0 flex-1 items-center justify-center p-6 ${className}`}>
        <div className="flex max-w-sm flex-col items-center gap-3 rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-6 text-center">
          <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--sf-peach)] text-[var(--sf-clay-deep)]">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <p role="alert" className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
            {ws.pdf.error}
          </p>
          <button type="button" onClick={ws.pdf.retry} className={gBtnOutlineSm}>
            <RotateCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="curriculum-pdf-viewer-skeleton"
      className={`flex min-h-0 flex-1 flex-col items-center gap-4 overflow-hidden bg-[var(--sf-paper)] p-5 ${className}`}
    >
      <span className="sr-only">Opening {ws.guideLabel}…</span>
      <div aria-hidden className="aspect-[8.5/11] w-full max-w-[640px] animate-pulse rounded-[6px] bg-white ring-1 ring-[var(--sf-ink)]/10 motion-reduce:animate-none" />
    </div>
  );
}

/** Continuous-scroll reader bound to the workspace (+ per-page note markers). */
export function WorkspaceScrollReader({
  ws,
  maxFitWidth,
  showNoteMarkers = true,
  onOpenPageNotes,
}: {
  ws: CurriculumWorkspace;
  maxFitWidth?: number;
  showNoteMarkers?: boolean;
  onOpenPageNotes?: (page: number) => void;
}) {
  const { doc, numPages, firstPage } = ws.pdf;
  if (!doc || !firstPage || !ws.guide) return <ReaderStatus ws={ws} />;
  return (
    <CurriculumScroll
      key={ws.guide.id}
      onHandle={ws.registerReader}
      doc={doc}
      numPages={numPages}
      firstPage={firstPage}
      zoom={ws.zoom.zoom}
      initialPage={ws.page}
      onPageChange={ws.setPage}
      maxFitWidth={maxFitWidth}
      organizationId={ws.organizationId}
      renderPageAside={
        showNoteMarkers
          ? (pageNumber) => {
              const count = ws.noteCounts.get(pageNumber) ?? 0;
              if (!count) return null;
              return (
                <button
                  type="button"
                  onClick={() => onOpenPageNotes?.(pageNumber)}
                  className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-extrabold text-[var(--sf-clay-deep)] ring-1 ring-[var(--sf-ink)]/12 hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`}
                >
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                  {count} {count === 1 ? "note" : "notes"} on page {pageNumber}
                </button>
              );
            }
          : undefined
      }
    />
  );
}

/** The discussion drawer, wired to the workspace (outside the page frame). */
export function WorkspaceDiscussionDrawer({ ws, theme }: { ws: CurriculumWorkspace; theme: ParentThemeTokens }) {
  const threadId = ws.discussion.threadId;
  if (ws.curricula.length === 0) return null;
  return (
    <CurriculumDiscussionSidebar
      theme={theme}
      open={ws.discussion.open}
      onClose={ws.closeDiscussion}
      organizationId={ws.organizationId}
      programId={ws.programId}
      curricula={ws.curricula}
      activeCurriculumId={threadId}
      onActiveCurriculumIdChange={ws.setDiscussionThread}
      initialThreadMessages={ws.initialThreadMessages}
      currentGuardianId={ws.currentGuardianId}
      previewMode={ws.previewMode}
      readerThread={ws.thread}
      currentPage={ws.guide && threadId === ws.guide.id ? ws.page : null}
      onJumpToPage={threadId ? (page) => ws.openGuideAtPage(threadId, page) : undefined}
    />
  );
}

/** Present overlay for the open guide. */
export function WorkspacePresent({ ws, theme }: { ws: CurriculumWorkspace; theme: ParentThemeTokens }) {
  const { doc, numPages, firstPage } = ws.pdf;
  if (!doc || !firstPage) return null;
  return (
    <PresentOverlay
      open={ws.presenting}
      onClose={() => {
        ws.stopPresenting();
        // Bring the scroll reader to wherever the lesson ended.
        ws.scrollReaderTo(ws.page);
      }}
      theme={theme}
      doc={doc}
      numPages={numPages}
      firstPage={firstPage}
      page={ws.page}
      onPageChange={ws.setPage}
      title={ws.guideLabel}
      organizationId={ws.organizationId}
    />
  );
}
