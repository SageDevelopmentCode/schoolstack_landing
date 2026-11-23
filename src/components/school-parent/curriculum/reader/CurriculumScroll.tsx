"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PageCanvas from "./PageCanvas";
import type { PDFDocumentProxy } from "./pdfjs";
import type { CurriculumPageSize } from "./useCurriculumDocument";

export type ReaderZoom = "fit-width" | "fit-page" | number;

export type CurriculumScrollHandle = {
  scrollToPage: (page: number, behavior?: ScrollBehavior) => void;
};

type CurriculumScrollProps = {
  /** Receives `{ scrollToPage }` on mount and null on unmount. */
  onHandle?: (handle: CurriculumScrollHandle | null) => void;
  doc: PDFDocumentProxy;
  numPages: number;
  firstPage: CurriculumPageSize;
  zoom: ReaderZoom;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  /** Extra content drawn under a page (e.g. note markers), keyed by page number. */
  renderPageAside?: (page: number) => React.ReactNode;
  className?: string;
  /** Max CSS width for "fit-width" so huge monitors stay readable. */
  maxFitWidth?: number;
  organizationId: string;
};

const GAP = 16;
const PAD_X = 16;
const PAD_Y = 20;

/** Width a page is drawn at for a zoom mode, given the scroll container size. */
export function pageWidthFor(
  zoom: ReaderZoom,
  box: { width: number; height: number },
  firstPage: CurriculumPageSize,
  maxFitWidth = 1100,
): number {
  const fitWidth = Math.max(160, Math.min(box.width - PAD_X * 2, maxFitWidth));
  if (zoom === "fit-width") return fitWidth;
  const aspect = firstPage.height / firstPage.width;
  if (zoom === "fit-page") {
    return Math.max(160, Math.min(fitWidth, (box.height - PAD_Y * 2) / aspect));
  }
  return Math.round(firstPage.width * zoom * (96 / 72));
}

/**
 * Continuous-scroll reader: every page has a sized placeholder, only pages
 * near the viewport are rendered, and the page in view is reported back.
 * Keeps the current page in place across zoom and resize.
 */
export default function CurriculumScroll({
  onHandle,
  doc,
  numPages,
  firstPage,
  zoom,
  initialPage = 1,
  onPageChange,
  renderPageAside,
  className = "",
  maxFitWidth,
  organizationId,
}: CurriculumScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [aspects, setAspects] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(Math.min(Math.max(1, initialPage), numPages));
  const currentRef = useRef(current);
  const restoredRef = useRef(false);

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const measure = () => setBox({ width: node.clientWidth, height: node.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const pageWidth = box.width > 0 ? pageWidthFor(zoom, box, firstPage, maxFitWidth) : 0;
  const defaultAspect = firstPage.height / firstPage.width;

  const offsets = useMemo(() => {
    const result: number[] = [];
    let y = PAD_Y;
    for (let page = 1; page <= numPages; page += 1) {
      result.push(y);
      const height = Math.round(pageWidth * (aspects[page] ?? defaultAspect));
      y += height + GAP;
    }
    return result;
  }, [aspects, defaultAspect, numPages, pageWidth]);

  const scrollToPage = useCallback(
    (page: number, behavior: ScrollBehavior = "auto") => {
      const node = scrollRef.current;
      const target = Math.min(Math.max(1, Math.round(page)), numPages);
      if (!node) return;
      const slot = node.querySelector<HTMLElement>(`[data-slot="${target}"]`);
      const top = slot ? slot.offsetTop - PAD_Y / 2 : offsets[target - 1] ?? 0;
      node.scrollTo({ top, behavior });
      currentRef.current = target;
      setCurrent(target);
      onPageChange?.(target);
    },
    [numPages, offsets, onPageChange],
  );

  useEffect(() => {
    if (!onHandle) return;
    onHandle({ scrollToPage });
    return () => onHandle(null);
  }, [onHandle, scrollToPage]);

  // Jump to the remembered page once the layout exists.
  useLayoutEffect(() => {
    if (restoredRef.current || pageWidth <= 0) return;
    restoredRef.current = true;
    if (initialPage > 1) scrollToPage(initialPage);
  }, [initialPage, pageWidth, scrollToPage]);

  // Keep the same page in view when zoom / width changes.
  const lastWidth = useRef(pageWidth);
  useLayoutEffect(() => {
    if (lastWidth.current === pageWidth || !restoredRef.current) {
      lastWidth.current = pageWidth;
      return;
    }
    lastWidth.current = pageWidth;
    const node = scrollRef.current;
    const slot = node?.querySelector<HTMLElement>(`[data-slot="${currentRef.current}"]`);
    if (node && slot) node.scrollTop = slot.offsetTop - PAD_Y / 2;
  }, [pageWidth]);

  const handleScroll = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    const probe = node.scrollTop + node.clientHeight * 0.35;
    const slots = node.querySelectorAll<HTMLElement>("[data-slot]");
    let found = 1;
    for (const slot of slots) {
      if (slot.offsetTop <= probe) found = Number(slot.dataset.slot);
      else break;
    }
    if (found !== currentRef.current) {
      currentRef.current = found;
      setCurrent(found);
      onPageChange?.(found);
    }
  }, [onPageChange]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(handleScroll);
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("scroll", onScroll);
    };
  }, [handleScroll]);

  const onSize = useCallback((page: number, aspect: number) => {
    setAspects((prev) => (Math.abs((prev[page] ?? 0) - aspect) < 0.001 ? prev : { ...prev, [page]: aspect }));
  }, []);

  const fallbackHeight = Math.round(pageWidth * defaultAspect);

  return (
    <div
      ref={scrollRef}
      tabIndex={0}
      role="region"
      aria-label={`Curriculum pages, page ${current} of ${numPages}`}
      className={`min-h-0 flex-1 overflow-auto overscroll-contain bg-[var(--sf-paper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sf-clay)]/40 ${className}`}
    >
      {pageWidth > 0 ? (
        <div className="flex flex-col items-center" style={{ gap: GAP, padding: `${PAD_Y}px ${PAD_X}px` }}>
          {Array.from({ length: numPages }, (_, index) => {
            const page = index + 1;
            // Render a small window around the page in view; free the rest.
            const active = page >= current - 2 && page <= current + 3;
            return (
              <div key={page} data-slot={page} className="flex flex-col items-center">
                <PageCanvas
                  doc={doc}
                  pageNumber={page}
                  width={pageWidth}
                  fallbackHeight={fallbackHeight}
                  active={active}
                  onSize={onSize}
                  organizationId={organizationId}
                  className="rounded-[6px] shadow-[0_2px_0_0_rgba(43,36,29,0.08),0_10px_24px_-18px_rgba(43,36,29,0.45)] ring-1 ring-[var(--sf-ink)]/10"
                />
                {renderPageAside ? renderPageAside(page) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
