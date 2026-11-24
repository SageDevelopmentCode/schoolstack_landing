"use client";

import { useCallback, useEffect, useState } from "react";
import { loadPdfOutline, resolveDestToPageNumber, type PdfOutlineItem } from "@/lib/admissions/program-coop-curriculum-pdf-outline";
import type { PDFDocumentProxy } from "./pdfjs";

/* ------------------------------------------------------------------ */
/* Outline (the PDF's own bookmarks) with page numbers                 */
/* ------------------------------------------------------------------ */

export type OutlineEntry = { title: string; page: number; depth: number };

const OUTLINE_CACHE = new WeakMap<PDFDocumentProxy, Promise<OutlineEntry[]>>();

async function flattenOutline(doc: PDFDocumentProxy): Promise<OutlineEntry[]> {
  const outline = await loadPdfOutline(doc);
  if (!outline) return [];
  const result: OutlineEntry[] = [];
  const walk = async (items: PdfOutlineItem[], depth: number) => {
    for (const item of items) {
      const page = await resolveDestToPageNumber(doc, item.dest).catch(() => null);
      if (page) result.push({ title: item.title.trim() || `Page ${page}`, page, depth });
      // Two levels is plenty for a sidebar / dropdown.
      if (item.items?.length && depth < 1) await walk(item.items, depth + 1);
    }
  };
  await walk(outline, 0);
  return result;
}

/** The guide's bookmarks as a flat list (two levels), or [] when it has none. */
export function useOutline(doc: PDFDocumentProxy | null): { entries: OutlineEntry[]; loading: boolean } {
  const [state, setState] = useState<{ doc: PDFDocumentProxy | null; entries: OutlineEntry[] }>({ doc: null, entries: [] });

  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    let promise = OUTLINE_CACHE.get(doc);
    if (!promise) {
      promise = flattenOutline(doc).catch(() => []);
      OUTLINE_CACHE.set(doc, promise);
    }
    void promise.then((entries) => {
      if (!cancelled) setState({ doc, entries });
    });
    return () => {
      cancelled = true;
    };
  }, [doc]);

  return { entries: state.doc === doc ? state.entries : [], loading: Boolean(doc) && state.doc !== doc };
}

/** The outline entry a page sits under (last entry at or before it). */
export function sectionForPage(entries: OutlineEntry[], page: number): OutlineEntry | null {
  let found: OutlineEntry | null = null;
  for (const entry of entries) {
    if (entry.page <= page) found = entry;
    else if (entry.depth === 0) break;
  }
  return found;
}

/* ------------------------------------------------------------------ */
/* Last page per guide (this browser only)                             */
/* ------------------------------------------------------------------ */

const memoryKey = (programId: string, guideId: string) => `mk-curriculum-page:${programId}:${guideId}`;

export function readRememberedPage(programId: string, guideId: string): number | null {
  try {
    const value = Number(window.localStorage.getItem(memoryKey(programId, guideId)));
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function rememberPage(programId: string, guideId: string, page: number): void {
  try {
    window.localStorage.setItem(memoryKey(programId, guideId), String(page));
  } catch {
    // Private mode / blocked storage: memory is a convenience only.
  }
}

/** Last page opened per guide id (read after mount, so SSR never differs). */
export function useRememberedPages(programId: string, guideIds: string[]): Record<string, number> {
  const [pages, setPages] = useState<Record<string, number>>({});
  const key = guideIds.join(",");
  useEffect(() => {
    const next: Record<string, number> = {};
    for (const id of key.split(",").filter(Boolean)) {
      const page = readRememberedPage(programId, id);
      if (page) next[id] = page;
    }
    queueMicrotask(() => setPages(next));
  }, [key, programId]);
  return pages;
}

/* ------------------------------------------------------------------ */
/* Keyboard: ← → PageUp PageDown Home End + −                           */
/* ------------------------------------------------------------------ */

function isTypingTarget(target: EventTarget | null): boolean {
  const node = target as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || node.isContentEditable;
}

export function useReaderKeys(
  enabled: boolean,
  handlers: {
    prev: () => void;
    next: () => void;
    first?: () => void;
    last?: () => void;
    zoomIn?: () => void;
    zoomOut?: () => void;
    /** `t`: open / close the Pages panel. */
    toggleTray?: () => void;
    /** `g`: switch the Pages panel between strip and grid. */
    toggleTrayMode?: () => void;
  },
  { insideDialog = false }: { insideDialog?: boolean } = {},
): void {
  const { prev, next, first, last, zoomIn, zoomOut, toggleTray, toggleTrayMode } = handlers;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      // Don't steal keys from an open drawer / dialog.
      if (!insideDialog && document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const map: Record<string, (() => void) | undefined> = {
        ArrowLeft: prev,
        ArrowRight: next,
        PageUp: prev,
        PageDown: next,
        Home: first,
        End: last,
        "+": zoomIn,
        "=": zoomIn,
        "-": zoomOut,
        t: toggleTray,
        g: toggleTrayMode,
      };
      const action = map[event.key];
      if (action) {
        event.preventDefault();
        action();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, first, insideDialog, last, next, prev, toggleTray, toggleTrayMode, zoomIn, zoomOut]);
}

/* ------------------------------------------------------------------ */
/* Zoom steps                                                          */
/* ------------------------------------------------------------------ */

export const ZOOM_STEPS = [0.75, 1, 1.25, 1.5, 2] as const;

export function useZoomSteps(initial: "fit-width" | "fit-page" | number = "fit-width") {
  const [zoom, setZoom] = useState<"fit-width" | "fit-page" | number>(initial);
  const zoomIn = useCallback(
    () =>
      setZoom((value) => {
        if (typeof value !== "number") return 1.25;
        return ZOOM_STEPS.find((step) => step > value) ?? value;
      }),
    [],
  );
  const zoomOut = useCallback(
    () =>
      setZoom((value) => {
        if (typeof value !== "number") return 0.75;
        return [...ZOOM_STEPS].reverse().find((step) => step < value) ?? value;
      }),
    [],
  );
  return { zoom, setZoom, zoomIn, zoomOut };
}
