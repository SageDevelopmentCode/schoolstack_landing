"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { MarketingCarouselSidebar } from "@/components/admin/marketing/MarketingCarouselSidebar";
import {
  DEFAULT_CAROUSEL_ID,
  getMarketingCarousel,
  MARKETING_CAROUSELS,
  resolveMarketingCarouselId,
} from "@/components/admin/marketing/carousels/registry";
import type { MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/components/admin/marketing/slide-frame";

async function slideToPng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 1,
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    canvasWidth: SLIDE_WIDTH,
    canvasHeight: SLIDE_HEIGHT,
    skipAutoScale: true,
  });
}

function downloadUrl(href: string, fileName: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.click();
}

export default function MarketingStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stageRef = useRef<HTMLDivElement>(null);
  const exportRefs = useRef<Array<HTMLDivElement | null>>([]);

  const carouselParam = searchParams.get("carousel");
  const [selectedCarouselId, setSelectedCarouselId] = useState(() =>
    resolveMarketingCarouselId(carouselParam),
  );
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(0.42);
  const [exporting, setExporting] = useState<"slide" | "all" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const carousel = getMarketingCarousel(selectedCarouselId) ?? MARKETING_CAROUSELS[0];
  const carouselId = carousel?.id ?? "";
  const slides = carousel?.slides ?? [];
  const slide = slides[index] ?? slides[0];

  useEffect(() => {
    const resolved = resolveMarketingCarouselId(carouselParam);
    setSelectedCarouselId((current) => (current === resolved ? current : resolved));
  }, [carouselParam]);

  useEffect(() => {
    exportRefs.current = [];
  }, [carouselId]);

  const selectCarousel = useCallback(
    (id: string) => {
      const nextId = resolveMarketingCarouselId(id);
      setSelectedCarouselId(nextId);
      setIndex(0);
      setExportError(null);

      const params = new URLSearchParams(searchParams.toString());
      if (nextId === DEFAULT_CAROUSEL_ID) {
        params.delete("carousel");
      } else {
        params.set("carousel", nextId);
      }
      const query = params.toString();
      router.replace(query ? `/admin/marketing?${query}` : "/admin/marketing", { scroll: false });
    },
    [router, searchParams],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      const next = Math.min((rect.width - 120) / SLIDE_WIDTH, (rect.height - 24) / SLIDE_HEIGHT);
      setScale(Math.max(0.2, next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [carouselId]);

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  async function downloadCurrent() {
    const node = exportRefs.current[index];
    if (!node || !slide) return;
    setExporting("slide");
    setExportError(null);
    try {
      const dataUrl = await slideToPng(node);
      downloadUrl(dataUrl, slide.fileName);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Could not export this slide.");
    } finally {
      setExporting(null);
    }
  }

  async function downloadAll() {
    setExporting("all");
    setExportError(null);
    try {
      const zip = new JSZip();
      for (let i = 0; i < slides.length; i += 1) {
        const node = exportRefs.current[i];
        const item = slides[i];
        if (!node || !item) continue;
        const dataUrl = await slideToPng(node);
        const base64 = dataUrl.split(",")[1];
        if (!base64) throw new Error("Export returned an empty image.");
        zip.file(item.fileName, base64, { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      downloadUrl(url, `${carousel.fileSlug}.zip`);
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Could not export the carousel.");
    } finally {
      setExporting(null);
    }
  }

  if (!carousel) {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center text-sm text-admin-muted">
        No marketing carousels configured.
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] min-h-0 overflow-hidden">
      <MarketingCarouselSidebar
        carousels={MARKETING_CAROUSELS}
        selectedId={carousel.id}
        onSelect={selectCarousel}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border px-6 py-3">
          <div>
            <h1 className="text-lg font-semibold text-admin-text">Marketing</h1>
            <p className="text-sm text-admin-muted">{carousel.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void downloadCurrent()}
              disabled={exporting != null}
              className="inline-flex items-center gap-1.5 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-1.5 text-sm font-medium text-admin-text disabled:opacity-60"
            >
              {exporting === "slide" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Download this slide
            </button>
            <button
              type="button"
              onClick={() => void downloadAll()}
              disabled={exporting != null}
              className="inline-flex items-center gap-1.5 rounded-admin-md bg-admin-accent px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {exporting === "all" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Download all
            </button>
          </div>
        </header>

        {exportError ? (
          <p className="border-b border-admin-border px-6 py-2 text-sm text-red-700">{exportError}</p>
        ) : null}

        <div ref={stageRef} className="relative flex min-h-0 flex-1 items-center justify-center">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(-1)}
            className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-admin-border bg-admin-surface text-admin-text shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div style={{ width: SLIDE_WIDTH * scale, height: SLIDE_HEIGHT * scale }}>
            <div
              style={{
                width: SLIDE_WIDTH,
                height: SLIDE_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <SlideView slide={slide} />
            </div>
          </div>

          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(1)}
            className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-admin-border bg-admin-surface text-admin-text shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 pb-4">
          {slides.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Slide ${itemIndex + 1}`}
              aria-current={itemIndex === index}
              onClick={() => setIndex(itemIndex)}
              className={`h-2 rounded-full transition-all ${
                itemIndex === index ? "w-6 bg-admin-accent" : "w-2 bg-admin-border-strong"
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-admin-muted">
            {index + 1} / {slides.length}
          </span>
        </div>

        <div key={carousel.id} aria-hidden className="pointer-events-none fixed top-0 -left-[4000px]">
          {slides.map((item, itemIndex) => (
            <div
              key={item.id}
              ref={(node) => {
                exportRefs.current[itemIndex] = node;
              }}
            >
              <SlideView slide={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideView({ slide }: { slide: MarketingSlide }) {
  return slide.render();
}
