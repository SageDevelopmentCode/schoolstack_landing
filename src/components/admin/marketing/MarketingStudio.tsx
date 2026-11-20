"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Copy, Download, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { downloadUrl, nodeToPng } from "@/components/admin/marketing/export-png";
import { MarketingCarouselSidebar } from "@/components/admin/marketing/MarketingCarouselSidebar";
import {
  DEFAULT_CAROUSEL_ID,
  getMarketingCarousel,
  MARKETING_CAROUSELS,
  resolveMarketingCarouselId,
} from "@/components/admin/marketing/carousels/registry";
import type { MarketingAdCopy, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { resolveMarketingAdCopy } from "@/lib/marketing/marketing-ad-copy";
import {
  AdOfferProvider,
  DEFAULT_CAROUSEL_AUDIENCE_BANNER,
  MarketingSlideShell,
  SLIDE_SIZES,
  SlideSizeProvider,
  type SlideSize,
} from "@/components/admin/marketing/slide-frame";
import { AdminSwitch } from "@/components/admin/ui/AdminSwitch";
import type { MarketingCarouselPostStatus } from "@/lib/marketing/carousel-post-status";
import {
  isMarketingCarouselId,
  MARKETING_CAROUSEL_IDS,
  type MarketingCarouselId,
} from "@/lib/marketing/marketing-carousel-ids";

function emptyPostedByCarouselId(): Record<MarketingCarouselId, MarketingCarouselPostStatus> {
  return MARKETING_CAROUSEL_IDS.reduce(
    (acc, id) => {
      acc[id] = { posted: false, postedAt: null };
      return acc;
    },
    {} as Record<MarketingCarouselId, MarketingCarouselPostStatus>,
  );
}

function slideToPng(node: HTMLElement, size: SlideSize): Promise<string> {
  const { width, height } = SLIDE_SIZES[size];
  return nodeToPng(node, width, height);
}

/** `01-gift.png` → `01-gift-story-no-offer.png` (size suffix only when an entry has several sizes). */
function exportFileName(fileName: string, size: SlideSize, multiSize: boolean, offerOff: boolean): string {
  const suffix = `${multiSize ? `-${size}` : ""}${offerOff ? "-no-offer" : ""}`;
  return suffix ? fileName.replace(/\.png$/, `${suffix}.png`) : fileName;
}

const exportKey = (size: SlideSize, index: number) => `${size}:${index}`;

export default function MarketingStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stageRef = useRef<HTMLDivElement>(null);
  const exportRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const carouselParam = searchParams.get("carousel");
  const selectedCarouselId = resolveMarketingCarouselId(carouselParam);
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(0.42);
  const [preferredSize, setPreferredSize] = useState<SlideSize>("feed");
  const [showOffer, setShowOffer] = useState(true);
  const [exporting, setExporting] = useState<"slide" | "all" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [postedByCarouselId, setPostedByCarouselId] = useState(() => emptyPostedByCarouselId());
  const [postStatusLoading, setPostStatusLoading] = useState(true);
  const [postStatusSaving, setPostStatusSaving] = useState(false);
  const [postStatusError, setPostStatusError] = useState<string | null>(null);

  const carousel = getMarketingCarousel(selectedCarouselId) ?? MARKETING_CAROUSELS[0];
  const carouselId = carousel?.id ?? "";
  const slides = carousel?.slides ?? [];
  const slide = slides[index] ?? slides[0];
  const isAd = carousel?.kind === "ad";
  const sizes: SlideSize[] = carousel?.sizes?.length ? carousel.sizes : ["feed"];
  const multiSize = sizes.length > 1;
  const activeSize: SlideSize = sizes.includes(preferredSize) ? preferredSize : sizes[0];
  const activeDims = SLIDE_SIZES[activeSize];
  const hasOfferToggle = isAd && Boolean(carousel?.offerToggle);
  const offerOff = hasOfferToggle && !showOffer;
  const panelCopy = slide ? resolveMarketingAdCopy(slide, offerOff) : undefined;
  const firstSlideAudienceBanner =
    slides.length > 1 && !carousel?.kind ? (carousel?.audienceBanner ?? DEFAULT_CAROUSEL_AUDIENCE_BANNER) : undefined;

  useEffect(() => {
    exportRefs.current = {};
  }, [carouselId]);

  // Deep link from the Schedule tab: ?carousel=<id>&slide=<slide id> opens that slide (once per link).
  const slideParam = searchParams.get("slide");
  const deepLinkKey = slideParam ? `${carouselId}:${slideParam}` : null;
  const [appliedDeepLink, setAppliedDeepLink] = useState<string | null>(null);
  if (deepLinkKey && appliedDeepLink !== deepLinkKey) {
    setAppliedDeepLink(deepLinkKey);
    const target = slides.findIndex((item) => item.id === slideParam);
    if (target >= 0) setIndex(target);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPostStatuses() {
      setPostStatusLoading(true);
      setPostStatusError(null);
      try {
        const response = await fetch("/api/admin/marketing-carousels/post-status");
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Could not load posted status.");
        }
        const payload = (await response.json()) as {
          statuses: Record<MarketingCarouselId, MarketingCarouselPostStatus>;
        };
        if (!cancelled) {
          setPostedByCarouselId({ ...emptyPostedByCarouselId(), ...payload.statuses });
        }
      } catch (error) {
        if (!cancelled) {
          setPostStatusError(
            error instanceof Error ? error.message : "Could not load posted status.",
          );
        }
      } finally {
        if (!cancelled) {
          setPostStatusLoading(false);
        }
      }
    }

    void loadPostStatuses();
    return () => {
      cancelled = true;
    };
  }, []);

  const setCarouselPosted = useCallback(async (id: MarketingCarouselId, posted: boolean) => {
    let previous: MarketingCarouselPostStatus = { posted: false, postedAt: null };
    setPostStatusSaving(true);
    setPostStatusError(null);
    setPostedByCarouselId((current) => {
      previous = current[id] ?? { posted: false, postedAt: null };
      return {
        ...current,
        [id]: {
          posted,
          postedAt: posted ? new Date().toISOString() : null,
        },
      };
    });

    try {
      const response = await fetch(`/api/admin/marketing-carousels/${id}/post-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posted }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Could not update posted status.");
      }
      const payload = (await response.json()) as MarketingCarouselPostStatus & {
        carouselId: MarketingCarouselId;
      };
      setPostedByCarouselId((current) => ({
        ...current,
        [id]: { posted: payload.posted, postedAt: payload.postedAt },
      }));
    } catch (error) {
      setPostedByCarouselId((current) => ({
        ...current,
        [id]: previous,
      }));
      setPostStatusError(
        error instanceof Error ? error.message : "Could not update posted status.",
      );
    } finally {
      setPostStatusSaving(false);
    }
  }, []);

  const selectCarousel = useCallback(
    (id: string) => {
      const nextId = resolveMarketingCarouselId(id);
      setIndex(0);
      setExportError(null);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("slide");
      if (nextId === DEFAULT_CAROUSEL_ID) {
        params.delete("carousel");
      } else {
        params.set("carousel", nextId);
      }
      const query = params.toString();
      router.replace(query ? `/admin/marketing?${query}` : "/admin/marketing", { scroll: false });
    },
    [router, searchParams, setIndex, setExportError],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      const next = Math.min((rect.width - 120) / activeDims.width, (rect.height - 24) / activeDims.height);
      setScale(Math.max(0.15, next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [carouselId, activeDims.width, activeDims.height]);

  const slideCount = slides.length;
  const go = useCallback(
    (delta: number) => {
      setIndex((current) => {
        if (slideCount === 0) return 0;
        return (current + delta + slideCount) % slideCount;
      });
    },
    [slideCount, setIndex],
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
    const node = exportRefs.current[exportKey(activeSize, index)];
    if (!node || !slide) return;
    setExporting("slide");
    setExportError(null);
    try {
      const dataUrl = await slideToPng(node, activeSize);
      downloadUrl(dataUrl, exportFileName(slide.fileName, activeSize, multiSize, offerOff));
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
      for (const size of sizes) {
        for (let i = 0; i < slides.length; i += 1) {
          const node = exportRefs.current[exportKey(size, i)];
          const item = slides[i];
          if (!node || !item) continue;
          const dataUrl = await slideToPng(node, size);
          const base64 = dataUrl.split(",")[1];
          if (!base64) throw new Error("Export returned an empty image.");
          const name = exportFileName(item.fileName, size, multiSize, offerOff);
          zip.file(multiSize ? `${size}/${name}` : name, base64, { base64: true });
        }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      downloadUrl(url, `${carousel.fileSlug}${offerOff ? "-no-offer" : ""}.zip`);
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Could not export the carousel.");
    } finally {
      setExporting(null);
    }
  }

  const currentCarouselPosted =
    isMarketingCarouselId(carouselId) && (postedByCarouselId[carouselId]?.posted ?? false);

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
        postedByCarouselId={postedByCarouselId}
        onSelect={selectCarousel}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border px-6 py-3">
          <div>
            <h1 className="text-lg font-semibold text-admin-text">Marketing</h1>
            <p className="text-sm text-admin-muted">{carousel.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {multiSize ? (
              <div
                role="radiogroup"
                aria-label="Export size"
                className="flex items-center rounded-admin-md border border-admin-border bg-admin-canvas p-0.5"
              >
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={size === activeSize}
                    onClick={() => setPreferredSize(size)}
                    className={`rounded-admin-md px-2.5 py-1 text-xs font-medium ${
                      size === activeSize ? "bg-admin-surface text-admin-text shadow-sm" : "text-admin-muted"
                    }`}
                  >
                    {SLIDE_SIZES[size].label}
                  </button>
                ))}
              </div>
            ) : null}
            {hasOfferToggle ? (
              <div className="flex items-center gap-2 border-r border-admin-border pr-3">
                <AdminSwitch checked={showOffer} label="Show the gift-card offer" onChange={setShowOffer} />
                <div>
                  <p className="text-sm font-medium text-admin-text">Offer</p>
                  <p className="text-[11px] text-admin-muted">Off = no-incentive control</p>
                </div>
              </div>
            ) : null}
            <div className="flex items-center gap-2 border-r border-admin-border pr-3">
              <AdminSwitch
                checked={currentCarouselPosted}
                disabled={postStatusLoading || postStatusSaving || !isMarketingCarouselId(carouselId)}
                label="Mark carousel as posted"
                onChange={(posted) => {
                  if (!isMarketingCarouselId(carouselId)) return;
                  void setCarouselPosted(carouselId, posted);
                }}
              />
              <div>
                <p className="text-sm font-medium text-admin-text">Posted</p>
                <p className="text-[11px] text-admin-muted">Mark when this is live on social</p>
              </div>
            </div>
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
        {postStatusError ? (
          <p className="border-b border-admin-border px-6 py-2 text-sm text-red-700">{postStatusError}</p>
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

          <div style={{ width: activeDims.width * scale, height: activeDims.height * scale }}>
            <div
              style={{
                width: activeDims.width,
                height: activeDims.height,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <SlideSizeProvider size={activeSize}>
                <AdOfferProvider show={!offerOff}>
                  <MarketingSlideShell
                    audienceBanner={index === 0 ? firstSlideAudienceBanner : undefined}
                  >
                    <SlideView slide={slide} />
                  </MarketingSlideShell>
                </AdOfferProvider>
              </SlideSizeProvider>
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

        {panelCopy ? <AdCopyPanel copy={panelCopy} /> : null}

        <div key={carousel.id} aria-hidden className="pointer-events-none fixed top-0 -left-[4000px]">
          {sizes.map((size) =>
            slides.map((item, itemIndex) => (
              <div
                key={exportKey(size, itemIndex)}
                ref={(node) => {
                  exportRefs.current[exportKey(size, itemIndex)] = node;
                }}
                style={{
                  width: SLIDE_SIZES[size].width,
                  height: SLIDE_SIZES[size].height,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <SlideSizeProvider size={size}>
                  <AdOfferProvider show={!offerOff}>
                    <MarketingSlideShell
                      audienceBanner={itemIndex === 0 ? firstSlideAudienceBanner : undefined}
                    >
                      <SlideView slide={item} />
                    </MarketingSlideShell>
                  </AdOfferProvider>
                </SlideSizeProvider>
              </div>
            )),
          )}
        </div>
      </div>
    </div>
  );
}

function SlideView({ slide }: { slide: MarketingSlide }) {
  return slide.render();
}

/** Text to paste into the ad manager next to this image. */
function AdCopyPanel({ copy }: { copy: MarketingAdCopy }) {
  const fields: Array<{ key: string; label: string; value: string }> = [
    { key: "primary", label: "Primary text", value: copy.primaryText },
    { key: "headline", label: "Headline", value: copy.headline },
    ...(copy.description ? [{ key: "description", label: "Description", value: copy.description }] : []),
  ];
  return (
    <section
      aria-label="Ad copy"
      className="grid shrink-0 gap-2 border-t border-admin-border px-6 py-3 md:grid-cols-[2fr_1fr_1fr]"
    >
      {fields.map((field) => (
        <AdCopyField key={field.key} label={field.label} value={field.value} />
      ))}
    </section>
  );
}

function AdCopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div className="min-w-0 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-admin-faint">
          {label} <span className="font-normal normal-case">· {value.length} chars</span>
        </p>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(value).then(() => setCopied(true));
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-admin-accent"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-1 text-xs leading-snug text-admin-text">{value}</p>
    </div>
  );
}
