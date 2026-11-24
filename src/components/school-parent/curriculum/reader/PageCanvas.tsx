"use client";

import { memo, useEffect, useRef, useState } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import type { RenderTask } from "pdfjs-dist";
import { gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
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
  organizationId: string;
};

function isCancelledRender(error: unknown): boolean {
  return (error as { name?: string })?.name === "RenderingCancelledException";
}

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
  organizationId,
}: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aspect, setAspect] = useState<number | null>(null);
  const [painted, setPainted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const height = aspect ? Math.round(width * aspect) : fallbackHeight;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0) return;
    if (!active) {
      // Free the bitmap (a 2x A4 page is ~8 MB).
      canvas.width = 0;
      canvas.height = 0;
      queueMicrotask(() => {
        setPainted(false);
        setFailed(false);
      });
      return;
    }

    let cancelled = false;
    let task: RenderTask | null = null;

    const fail = (error: unknown) => {
      if (cancelled || isCancelledRender(error)) return;
      setPainted(false);
      setFailed(true);
      void reportPortalOperationalError(
        "parent_portal",
        {
          organizationId,
          operation: "curriculum.pdf_page_render",
          error: "",
          metadata: { pageNumber, thumbnail },
        },
        error,
      );
    };

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
        if (cancelled) return;
        if (!context) {
          fail(new Error("Could not get a canvas drawing context."));
          return;
        }
        task = page.render({ canvasContext: context, viewport, canvas }) as RenderTask;
        await task.promise;
        if (!cancelled) {
          setPainted(true);
          setFailed(false);
          page.cleanup();
        }
      } catch (error) {
        fail(error);
      }
    })();

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [active, attempt, doc, onSize, organizationId, pageNumber, thumbnail, width]);

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
      {failed ? (
        thumbnail ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-[var(--sf-peach)] text-[var(--sf-clay-deep)]"
          >
            <AlertTriangle className="h-4 w-4" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-white p-4" data-testid="curriculum-page-render-error">
            <div className="flex max-w-sm flex-col items-center gap-3 text-center">
              <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--sf-peach)] text-[var(--sf-clay-deep)]">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <p role="alert" className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">
                We couldn&apos;t load this page.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFailed(false);
                  setAttempt((value) => value + 1);
                }}
                className={gBtnOutlineSm}
              >
                <RotateCw className="h-4 w-4" aria-hidden />
                Try again
              </button>
            </div>
          </div>
        )
      ) : !painted ? (
        <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-[var(--sf-ink)]/[0.035] motion-reduce:animate-none" />
      ) : null}
    </div>
  );
}

const PageCanvas = memo(PageCanvasImpl);
export default PageCanvas;
