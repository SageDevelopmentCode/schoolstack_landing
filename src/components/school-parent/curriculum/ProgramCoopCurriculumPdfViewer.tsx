"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Minus,
  PanelLeft,
  Plus,
} from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import CurriculumPdfContentsPanel from "@/components/school-parent/curriculum/CurriculumPdfContentsPanel";
import ProgramCoopCurriculumPdfViewerSkeleton from "@/components/school-parent/curriculum/ProgramCoopCurriculumPdfViewerSkeleton";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type ProgramCoopCurriculumPdfViewerProps = {
  organizationId: string;
  programId: string;
  curriculumId: string;
  fileName: string;
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.1;
const DEFAULT_SCALE = 1;

type RenderTask = {
  cancel: () => void;
  promise: Promise<unknown>;
};

type PanState = {
  active: boolean;
  pointerId: number | null;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
};

function buildCurriculumPdfUrl(
  organizationId: string,
  programId: string,
  curriculumId: string,
): string {
  const params = new URLSearchParams({ organizationId, programId, curriculumId });
  return `/api/parent-portal/curriculum/pdf?${params.toString()}`;
}

function containerOverflows(container: HTMLElement): boolean {
  return (
    container.scrollWidth > container.clientWidth + 1 ||
    container.scrollHeight > container.clientHeight + 1
  );
}

export default function ProgramCoopCurriculumPdfViewer({
  organizationId,
  programId,
  curriculumId,
  fileName,
}: ProgramCoopCurriculumPdfViewerProps) {
  const { theme } = useParentTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const panStateRef = useRef<PanState>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [fitScale, setFitScale] = useState(DEFAULT_SCALE);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isPannable, setIsPannable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      setPdfDoc(null);
      setPageNum(1);
      setNumPages(0);
      setScale(DEFAULT_SCALE);
      setFitScale(DEFAULT_SCALE);
      setContentsOpen(false);
      setIsPannable(false);
      setIsPanning(false);

      try {
        const response = await fetch(
          buildCurriculumPdfUrl(organizationId, programId, curriculumId),
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load curriculum PDF.");
        }

        const data = await response.arrayBuffer();
        if (cancelled) return;

        const loadingTask = pdfjs.getDocument({ data });
        const doc = await loadingTask.promise;
        if (cancelled) {
          void loadingTask.destroy();
          return;
        }

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNum(1);
      } catch {
        if (!cancelled) {
          setError("We couldn't load the curriculum PDF. Please try again later.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPdf();

    return () => {
      cancelled = true;
    };
  }, [curriculumId, organizationId, programId]);

  useEffect(() => {
    return () => {
      renderTaskRef.current?.cancel();
      void pdfDoc?.cleanup();
    };
  }, [pdfDoc]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;
    const canvas = canvasRef.current;

    async function renderPage() {
      renderTaskRef.current?.cancel();
      setRendering(true);

      try {
        const page = await pdfDoc!.getPage(pageNum);
        if (cancelled) return;

        const outputScale = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale * outputScale });
        const displayViewport = page.getViewport({ scale });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(displayViewport.width)}px`;
        canvas.style.height = `${Math.floor(displayViewport.height)}px`;

        const context = canvas.getContext("2d");
        if (!context || cancelled) return;

        const renderTask = page.render({
          canvasContext: context,
          viewport,
          canvas,
        }) as RenderTask;

        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (renderError) {
        if (
          !cancelled &&
          renderError instanceof Error &&
          renderError.name !== "RenderingCancelledException"
        ) {
          setError("We couldn't render this page. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setRendering(false);
        }
      }
    }

    void renderPage();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [pdfDoc, pageNum, scale]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollLeft = 0;
    container.scrollTop = 0;
  }, [pageNum]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updatePannable = () => {
      const overflows = containerOverflows(container);
      const zoomedBeyondFit = scale > fitScale + 0.01;
      setIsPannable(overflows || zoomedBeyondFit);
    };

    updatePannable();

    const observer = new ResizeObserver(updatePannable);
    observer.observe(container);
    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => observer.disconnect();
  }, [fitScale, pageNum, rendering, scale]);

  const handlePanPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isPannable || event.button !== 0) return;

      const container = scrollContainerRef.current;
      if (!container) return;

      panStateRef.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop,
      };
      setIsPanning(true);
      container.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    [isPannable],
  );

  const handlePanPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const panState = panStateRef.current;
    if (!panState.active || panState.pointerId !== event.pointerId) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    event.preventDefault();
    const deltaX = event.clientX - panState.startX;
    const deltaY = event.clientY - panState.startY;
    container.scrollLeft = panState.scrollLeft - deltaX;
    container.scrollTop = panState.scrollTop - deltaY;
  }, []);

  const endPan = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const panState = panStateRef.current;
    if (!panState.active || panState.pointerId !== event.pointerId) return;

    panStateRef.current = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      scrollLeft: 0,
      scrollTop: 0,
    };
    setIsPanning(false);
    scrollContainerRef.current?.releasePointerCapture(event.pointerId);
  }, []);

  const goPrev = useCallback(() => {
    setPageNum((current) => Math.max(1, current - 1));
  }, []);

  const goNext = useCallback(() => {
    setPageNum((current) => Math.min(numPages, current + 1));
  }, [numPages]);

  const zoomOut = useCallback(() => {
    setScale((current) =>
      Math.max(MIN_SCALE, Math.round((current - SCALE_STEP) * 10) / 10),
    );
  }, []);

  const zoomIn = useCallback(() => {
    setScale((current) =>
      Math.min(MAX_SCALE, Math.round((current + SCALE_STEP) * 10) / 10),
    );
  }, []);

  const handleSelectPage = useCallback((pageNumber: number) => {
    setPageNum(pageNumber);
    setContentsOpen(false);
  }, []);

  if (loading) {
    return <ProgramCoopCurriculumPdfViewerSkeleton theme={theme} />;
  }

  if (error || !pdfDoc) {
    return (
      <p
        className="rounded-[12px] border px-4 py-6 text-sm"
        style={{
          borderColor: theme.line,
          backgroundColor: theme.cream,
          color: theme.muted,
        }}
      >
        {error ?? "Curriculum is unavailable right now."}
      </p>
    );
  }

  const zoomPercent = Math.round(scale * 100);

  return (
    <>
      <style>{`
        @media print {
          .curriculum-pdf-viewer-root {
            display: none !important;
          }
        }
      `}</style>
      <ParentCard
        theme={theme}
        className="curriculum-pdf-viewer-root flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] p-0"
      >
        <div
          className="flex shrink-0 items-center justify-between gap-2 border-b px-2 py-1.5"
          style={{ borderColor: theme.line, backgroundColor: theme.cream }}
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setContentsOpen((open) => !open)}
              aria-label="Contents"
              aria-expanded={contentsOpen}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md"
              style={{
                color: contentsOpen ? theme.primary : theme.ink,
                backgroundColor: contentsOpen ? theme.primarySoft : "transparent",
              }}
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goPrev}
              disabled={pageNum <= 1 || rendering}
              aria-label="Previous page"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md disabled:opacity-40"
              style={{ color: theme.ink }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[5.5rem] text-center text-xs tabular-nums" style={{ color: theme.muted }}>
              Page {pageNum} of {numPages}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={pageNum >= numPages || rendering}
              aria-label="Next page"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md disabled:opacity-40"
              style={{ color: theme.ink }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE || rendering}
              aria-label="Zoom out"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md disabled:opacity-40"
              style={{ color: theme.ink }}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[3rem] text-center text-xs tabular-nums" style={{ color: theme.muted }}>
              {zoomPercent}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={scale >= MAX_SCALE || rendering}
              aria-label="Zoom in"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md disabled:opacity-40"
              style={{ color: theme.ink }}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className={`relative min-h-0 flex-1 overflow-auto bg-white ${
            isPannable ? (isPanning ? "cursor-grabbing select-none" : "cursor-grab") : ""
          }`}
          style={{ touchAction: isPannable ? "none" : "auto" }}
          onPointerDown={handlePanPointerDown}
          onPointerMove={handlePanPointerMove}
          onPointerUp={endPan}
          onPointerCancel={endPan}
        >
          <CurriculumPdfContentsPanel
            theme={theme}
            open={contentsOpen}
            pdfDoc={pdfDoc}
            numPages={numPages}
            currentPage={pageNum}
            onClose={() => setContentsOpen(false)}
            onSelectPage={handleSelectPage}
          />

          {rendering ? (
            <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center">
              <Loader2
                className="h-4 w-4 animate-spin"
                style={{ color: theme.muted }}
                aria-hidden
              />
            </div>
          ) : null}
          <div className="inline-block min-w-full p-3">
            <canvas
              ref={canvasRef}
              title={fileName}
              className="mx-auto block shadow-sm"
              onContextMenu={(event) => event.preventDefault()}
            />
          </div>
        </div>
      </ParentCard>
    </>
  );
}
