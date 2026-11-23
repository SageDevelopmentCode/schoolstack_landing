"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { RenderTask } from "pdfjs-dist";
import { outputScale, type PDFDocumentProxy } from "./pdfjs";

type PageCanvasProps = {
  doc: PDFDocumentProxy;
  pageNumber: number;
  /** CSS width to draw the page at. */
  width: number;
  /** Placeholder height until the page's real size is known. */
  fallbackHeight: number;
  /** Only render (and keep pixels) while true; off-screen pages free their canvas. */
  active: boolean;
  /** Lower resolution for thumbnails. */
  thumbnail?: boolean;
  className?: string;
  onSize?: (pageNumber: number, aspect: number) => void;
};

/**
 * One PDF page on a canvas at a given CSS width. Renders only while `active`
 * (range requests fetch just this page's bytes) and clears its pixels when
 * it goes inactive, so long books stay light on memory.
 */
function PageCanvasImpl({
  doc,
  pageNumber,
  width,
  fallbackHeight,
  active,
  thumbnail = false,
  className = "",
  onSize,
}: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aspect, setAspect] = useState<number | null>(null);
  const [painted, setPainted] = useState(false);
  const height = aspect ? Math.round(width * aspect) : fallbackHeight;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0) return;
    if (!active) {
      // Free the bitmap (a 2x A4 page is ~8 MB).
      canvas.width = 0;
      canvas.height = 0;
      queueMicrotask(() => setPainted(false));
      return;
    }

    let cancelled = false;
    let task: RenderTask | null = null;

    void (async () => {
      try {
        const page = await doc.getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const pageAspect = base.height / base.width;
        setAspect(pageAspect);
        onSize?.(pageNumber, pageAspect);

        const cssScale = width / base.width;
        const pixelScale = cssScale * (thumbnail ? 1 : outputScale());
        const viewport = page.getViewport({ scale: pixelScale });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const context = canvas.getContext("2d");
        if (!context || cancelled) return;
        task = page.render({ canvasContext: context, viewport, canvas }) as RenderTask;
        await task.promise;
        if (!cancelled) {
          setPainted(true);
          page.cleanup();
        }
      } catch (error) {
        if ((error as { name?: string })?.name !== "RenderingCancelledException" && !cancelled) {
          setPainted(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [active, doc, onSize, pageNumber, thumbnail, width]);

  return (
    <div
      className={`relative overflow-hidden bg-white ${className}`}
      style={{ width, height }}
      data-page-number={pageNumber}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`block h-full w-full transition-opacity duration-200 motion-reduce:transition-none ${painted ? "opacity-100" : "opacity-0"}`}
        onContextMenu={(event) => event.preventDefault()}
      />
      {!painted ? (
        <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-[var(--sf-ink)]/[0.035] motion-reduce:animate-none" />
      ) : null}
    </div>
  );
}

const PageCanvas = memo(PageCanvasImpl);
export default PageCanvas;
