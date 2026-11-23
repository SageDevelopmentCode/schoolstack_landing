"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import { useHydrated } from "@/hooks/useHydrated";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import SinglePageView from "./SinglePageView";
import { useReaderKeys } from "./hooks";
import type { PDFDocumentProxy } from "./pdfjs";
import type { CurriculumPageSize } from "./useCurriculumDocument";

const EDGE_BTN =
  "flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50";

/**
 * Present: the page fills the screen on a dark background for teaching from
 * a laptop or a projector. Uses the Fullscreen API when it can (desktop,
 * Android) and a full-viewport overlay otherwise (iPhone Safari).
 * ← → / PageUp PageDown flip, Escape leaves.
 */
export default function PresentOverlay({
  open,
  onClose,
  theme,
  doc,
  numPages,
  firstPage,
  page,
  onPageChange,
  title,
  organizationId,
}: {
  open: boolean;
  onClose: () => void;
  theme: ParentThemeTokens;
  doc: PDFDocumentProxy;
  numPages: number;
  firstPage: CurriculumPageSize;
  page: number;
  onPageChange: (page: number) => void;
  title: string;
  organizationId: string;
}) {
  const hydrated = useHydrated();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const prev = useCallback(() => onPageChange(Math.max(1, page - 1)), [onPageChange, page]);
  const next = useCallback(() => onPageChange(Math.min(numPages, page + 1)), [numPages, onPageChange, page]);
  const first = useCallback(() => onPageChange(1), [onPageChange]);
  const last = useCallback(() => onPageChange(numPages), [numPages, onPageChange]);
  useReaderKeys(open, { prev, next, first, last }, { insideDialog: true });

  // Latest onClose without re-running the fullscreen effect: the parent passes
  // a fresh closure each render, and re-running it on every page turn used to
  // exit fullscreen, whose async `fullscreenchange` then closed Present.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const close = () => onCloseRef.current();
    const node = rootRef.current;
    const opener = document.activeElement as HTMLElement | null;
    if (node?.requestFullscreen && !document.fullscreenElement) {
      node.requestFullscreen().catch(() => {});
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) close();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    const timer = window.setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.clearTimeout(timer);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [open]);

  if (!hydrated || !open) return null;

  return createPortal(
    <ParentGardenScope theme={theme}>
      <div
        ref={rootRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Presenting ${title}`}
        className="fixed inset-0 z-[400] flex flex-col bg-[#1d1915] text-white"
        data-testid="curriculum-present"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
          <p className="m-0 min-w-0 truncate text-[14px] font-extrabold text-white/80">{title}</p>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-extrabold tabular-nums" aria-live="polite">
              {page} / {numPages}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Stop presenting"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
        <div className="relative flex min-h-0 flex-1 items-stretch">
          <div className="flex items-center px-2 sm:px-4">
            <button type="button" onClick={prev} disabled={page <= 1} aria-label="Previous page" className={EDGE_BTN}>
              <ChevronLeft className="h-7 w-7" aria-hidden />
            </button>
          </div>
          <SinglePageView
            doc={doc}
            page={page}
            numPages={numPages}
            firstPage={firstPage}
            padding={8}
            pageClassName="rounded-[4px]"
            organizationId={organizationId}
          />
          <div className="flex items-center px-2 sm:px-4">
            <button type="button" onClick={next} disabled={page >= numPages} aria-label="Next page" className={EDGE_BTN}>
              <ChevronRight className="h-7 w-7" aria-hidden />
            </button>
          </div>
        </div>
        <p className="m-0 shrink-0 pb-3 text-center text-[12px] font-semibold text-white/45">
          ← → to turn pages · Esc to stop presenting
        </p>
      </div>
    </ParentGardenScope>,
    document.body,
  );
}
