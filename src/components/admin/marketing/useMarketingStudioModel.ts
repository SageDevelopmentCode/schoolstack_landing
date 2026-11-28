"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import JSZip from "jszip";
import { downloadUrl, nodeToPng } from "@/components/admin/marketing/export-png";
import {
  DEFAULT_CAROUSEL_ID,
  getMarketingCarousel,
  MARKETING_CAROUSELS,
  resolveMarketingCarouselId,
} from "@/components/admin/marketing/carousels/registry";
import { resolveMarketingAdCopyVersions } from "@/lib/marketing/marketing-ad-copy";
import {
  DEFAULT_CAROUSEL_AUDIENCE_BANNER,
  SLIDE_SIZES,
  type SlideSize,
} from "@/components/admin/marketing/slide-frame";
import {
  countPostedSlides,
  emptyCarouselPostStatus,
  isSlidePosted,
  type MarketingCarouselPostStatus,
  type MarketingPostedFlag,
} from "@/lib/marketing/carousel-post-status";
import {
  isMarketingCarouselId,
  MARKETING_CAROUSEL_IDS,
  type MarketingCarouselId,
} from "@/lib/marketing/marketing-carousel-ids";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

/*
 * State for the Carousels studio (/admin/marketing): selection in the URL,
 * slide index + deep link, export size and offer, posted status, PNG export.
 * The Garden view (MarketingStudio) only renders what this returns.
 */

function emptyPostedByCarouselId(): Record<MarketingCarouselId, MarketingCarouselPostStatus> {
  return MARKETING_CAROUSEL_IDS.reduce(
    (acc, id) => {
      acc[id] = emptyCarouselPostStatus();
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

export const exportKey = (size: SlideSize, index: number) => `${size}:${index}`;

const FLASH_MS = 1600;

export function useMarketingStudioModel() {
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
  const [postedByCarouselId, setPostedByCarouselId] = useState(() => emptyPostedByCarouselId());
  const [postStatusLoading, setPostStatusLoading] = useState(true);
  const [postStatusSaving, setPostStatusSaving] = useState(false);
  const [postStatusLoadError, setPostStatusLoadError] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);

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
  const panelVersions = slide ? resolveMarketingAdCopyVersions(slide, offerOff) : [];
  const firstSlideAudienceBanner =
    slides.length > 1 && !carousel?.kind ? (carousel?.audienceBanner ?? DEFAULT_CAROUSEL_AUDIENCE_BANNER) : undefined;

  useEffect(() => {
    exportRefs.current = {};
  }, [carouselId]);

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const flash = useCallback((id: string) => {
    setFlashId(id);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashId(null), FLASH_MS);
  }, []);

  // Deep link from the Schedule tab: ?carousel=<id>&slide=<slide id> opens that slide (once per link).
  const slideParam = searchParams.get("slide");
  const deepLinkKey = slideParam ? `${carouselId}:${slideParam}` : null;
  const [appliedDeepLink, setAppliedDeepLink] = useState<string | null>(null);
  if (deepLinkKey && appliedDeepLink !== deepLinkKey) {
    setAppliedDeepLink(deepLinkKey);
    const target = slides.findIndex((item) => item.id === slideParam);
    if (target >= 0) setIndex(target);
  }

  const loadPostStatuses = useCallback(async (signal?: { cancelled: boolean }) => {
    setPostStatusLoading(true);
    setPostStatusLoadError(null);
    try {
      const response = await fetch("/api/admin/marketing-carousels/post-status");
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Could not load posted status.");
      }
      const payload = (await response.json()) as {
        statuses: Record<MarketingCarouselId, MarketingCarouselPostStatus>;
      };
      if (!signal?.cancelled) setPostedByCarouselId({ ...emptyPostedByCarouselId(), ...payload.statuses });
    } catch (error) {
      if (!signal?.cancelled) {
        setPostStatusLoadError(error instanceof Error ? error.message : "Could not load posted status.");
      }
    } finally {
      if (!signal?.cancelled) setPostStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    queueMicrotask(() => void loadPostStatuses(signal));
    return () => {
      signal.cancelled = true;
    };
  }, [loadPostStatuses]);

  /** Marks a whole entry, or one slide of an ad set / post set when `slideId` is given. */
  const setCarouselPosted = useCallback(
    async function setPosted(id: MarketingCarouselId, posted: boolean, slideId?: string): Promise<void> {
      let previous: MarketingCarouselPostStatus = emptyCarouselPostStatus();
      const withFlag = (status: MarketingCarouselPostStatus, flag: MarketingPostedFlag): MarketingCarouselPostStatus =>
        slideId ? { ...status, slides: { ...status.slides, [slideId]: flag } } : { ...status, ...flag };
      const errorId = `marketing-posted-${id}-error`;
      const entry = getMarketingCarousel(id);
      setPostStatusSaving(true);
      setPostedByCarouselId((current) => {
        previous = current[id] ?? emptyCarouselPostStatus();
        return {
          ...current,
          [id]: withFlag(previous, { posted, postedAt: posted ? new Date().toISOString() : null }),
        };
      });

      try {
        const response = await fetch(`/api/admin/marketing-carousels/${id}/post-status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slideId ? { posted, slideId } : { posted }),
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Could not update posted status.");
        }
        const payload = (await response.json()) as MarketingPostedFlag & { carouselId: MarketingCarouselId };
        let next: MarketingCarouselPostStatus = emptyCarouselPostStatus();
        setPostedByCarouselId((current) => {
          next = withFlag(current[id] ?? emptyCarouselPostStatus(), { posted: payload.posted, postedAt: payload.postedAt });
          return { ...current, [id]: next };
        });
        adminToast.dismiss(errorId);
        const slideIds = entry?.slides.map((item) => item.id) ?? [];
        const description = slideId
          ? `${countPostedSlides(next, slideIds)} of ${slideIds.length} slides posted.`
          : payload.posted
            ? "It shows as Posted in the list."
            : "It shows as Not posted in the list.";
        adminToast.success(
          slideId ? (payload.posted ? "Slide marked posted." : "Slide marked not posted.") : payload.posted ? "Marked posted." : "Marked not posted.",
          { id: `marketing-posted-${id}`, description },
        );
        flash(id);
      } catch (error) {
        setPostedByCarouselId((current) => ({ ...current, [id]: previous }));
        adminToast.error("Couldn't update posted status.", {
          id: errorId,
          description: `${formatActionError(error, "Could not update posted status.")} ${entry?.title ?? "It"} keeps its previous status.`,
          action: { label: "Retry", onClick: () => void setPosted(id, posted, slideId) },
        });
      } finally {
        setPostStatusSaving(false);
      }
    },
    [flash],
  );

  const selectCarousel = useCallback(
    (id: string) => {
      const nextId = resolveMarketingCarouselId(id);
      setIndex(0);
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
    [router, searchParams],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const rect = stage.getBoundingClientRect();
      const gutter = rect.width < 500 ? 96 : 120; // room for the prev/next buttons
      const next = Math.min((rect.width - gutter) / activeDims.width, (rect.height - 24) / activeDims.height);
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
    [slideCount],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      // Leave arrow keys alone while a control (radio, switch, input) has focus.
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [role='radio'], [role='tab'], [contenteditable='true']")) return;
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  async function downloadCurrent(): Promise<void> {
    const node = exportRefs.current[exportKey(activeSize, index)];
    if (!node || !slide) return;
    setExporting("slide");
    try {
      const dataUrl = await slideToPng(node, activeSize);
      const name = exportFileName(slide.fileName, activeSize, multiSize, offerOff);
      downloadUrl(dataUrl, name);
      adminToast.dismiss("marketing-export-error");
      adminToast.success("Slide downloaded.", { id: "marketing-export", description: name });
    } catch (error) {
      adminToast.error("Couldn't export this slide.", {
        id: "marketing-export-error",
        description: `${formatActionError(error, "The export failed.")} Nothing was downloaded.`,
        action: { label: "Retry", onClick: () => void downloadCurrent() },
      });
    } finally {
      setExporting(null);
    }
  }

  async function downloadAll(): Promise<void> {
    if (!carousel) return;
    setExporting("all");
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
      const zipName = `${carousel.fileSlug}${offerOff ? "-no-offer" : ""}.zip`;
      downloadUrl(url, zipName);
      URL.revokeObjectURL(url);
      const images = slides.length * sizes.length;
      adminToast.dismiss("marketing-export-error");
      adminToast.success(`${images} ${images === 1 ? "image" : "images"} exported.`, { id: "marketing-export", description: zipName });
    } catch (error) {
      adminToast.error("Couldn't export the carousel.", {
        id: "marketing-export-error",
        description: `${formatActionError(error, "The export failed.")} Nothing was downloaded.`,
        action: { label: "Retry", onClick: () => void downloadAll() },
      });
    } finally {
      setExporting(null);
    }
  }

  // Ad sets and post sets are separate posts, so "Posted" is per slide; a swipe carousel goes out as one post.
  const isSet = carousel?.kind === "ad" || carousel?.kind === "post";
  const currentStatus = isMarketingCarouselId(carouselId) ? postedByCarouselId[carouselId] : undefined;
  const slideIds = slides.map((item) => item.id);
  const postedSlideCount = countPostedSlides(currentStatus, slideIds);
  const currentPosted = isSet && slide ? isSlidePosted(currentStatus, slide.id) : (currentStatus?.posted ?? false);

  const togglePosted = (posted: boolean) => {
    if (!isMarketingCarouselId(carouselId)) return;
    void setCarouselPosted(carouselId, posted, isSet ? slide?.id : undefined);
  };

  return {
    carousels: MARKETING_CAROUSELS,
    carousel,
    slides,
    slide,
    index,
    setIndex,
    go,
    scale,
    stageRef,
    exportRefs,
    sizes,
    multiSize,
    activeSize,
    activeDims,
    setPreferredSize,
    hasOfferToggle,
    showOffer,
    setShowOffer,
    offerOff,
    panelVersions,
    firstSlideAudienceBanner,
    exporting,
    downloadCurrent,
    downloadAll,
    selectCarousel,
    postedByCarouselId,
    postStatusLoading,
    postStatusSaving,
    postStatusLoadError,
    reloadPostStatuses: () => void loadPostStatuses(),
    isSet,
    currentStatus,
    postedSlideCount,
    currentPosted,
    canMarkPosted: isMarketingCarouselId(carouselId),
    togglePosted,
    flashId,
  };
}

export type MarketingStudioModel = ReturnType<typeof useMarketingStudioModel>;
