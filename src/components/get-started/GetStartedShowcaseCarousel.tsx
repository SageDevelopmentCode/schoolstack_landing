"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
} from "react";
import GetStartedShowcaseSlide from "@/components/get-started/GetStartedShowcaseSlide";
import { GET_STARTED_SHOWCASE_SLIDES } from "@/lib/marketing/get-started-showcase-slides";
import { prefetchProductPreviewTab } from "@/lib/marketing/product-preview-tabs";
import {
  prefetchAdminDemo,
  prefetchParentDemo,
  prefetchTeacherDemo,
  prefetchWebsiteDemo,
} from "@/components/sections/lazyDemos";
import { scheduleOnIdle } from "@/lib/schedule-on-idle";
import { useGetStartedShowcaseActiveSlideIds } from "@/hooks/useGetStartedShowcaseActiveSlideIds";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const MARQUEE_DURATION = "110s";
/** Matches marquee: 50% of duplicated track width in 110s. */
const MOBILE_AUTO_SCROLL_HALF_TRACK_MS = 110_000;
const MOBILE_SCROLL_IDLE_MS = 250;

const SHOWCASE_SLIDE_IDS = GET_STARTED_SHOWCASE_SLIDES.map((slide) => slide.id);

const SCROLL_STRIP_BASE =
  "flex items-stretch gap-4 overflow-x-auto px-4 pb-2 scroll-pl-4 touch-pan-x [-webkit-overflow-scrolling:touch] sm:px-6";

function scrollStripClass(mode: "scrollOnly" | "mobileScrollAutoplay"): string {
  if (mode === "scrollOnly") {
    return `${SCROLL_STRIP_BASE} snap-x snap-mandatory`;
  }
  return `${SCROLL_STRIP_BASE} snap-none`;
}

const DEMO_PREFETCHERS = {
  prefetchWebsiteDemo,
  prefetchParentDemo,
  prefetchTeacherDemo,
  prefetchAdminDemo,
};

type CarouselMode = "scrollOnly" | "mobileScrollAutoplay" | "desktopMarquee";

function prefetchShowcaseSlides(slideIds: Set<string>) {
  for (const slide of GET_STARTED_SHOWCASE_SLIDES) {
    if (!slideIds.has(slide.id)) continue;
    if (slide.demo.kind === "productPreview") {
      prefetchProductPreviewTab(slide.demo.tabId, DEMO_PREFETCHERS);
    }
  }
}

function prefetchAllProductPreviewShowcaseSlides() {
  for (const slide of GET_STARTED_SHOWCASE_SLIDES) {
    if (slide.demo.kind === "productPreview") {
      prefetchProductPreviewTab(slide.demo.tabId, DEMO_PREFETCHERS);
    }
  }
}

export default function GetStartedShowcaseCarousel() {
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [paused, setPaused] = useState(false);
  const [userInteracting, setUserInteracting] = useState(false);
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const userInteractingRef = useRef(false);
  /** Fractional scroll position. Mobile Safari truncates scrollLeft, so sub-pixel steps must live here. */
  const scrollOffsetRef = useRef(0);
  const scrollIdleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const isMobileStrip = useMediaQuery("(max-width: 639px)", {
    serverSnapshot: true,
  });

  const carouselMode: CarouselMode = reduceMotion
    ? "scrollOnly"
    : isMobileStrip
      ? "mobileScrollAutoplay"
      : "desktopMarquee";

  const slideIds = useMemo(() => SHOWCASE_SLIDE_IDS, []);

  const useScrollVisibility = carouselMode !== "desktopMarquee";

  const { activeSlideIds, setSlideItemRef, setSlideCloneRef } =
    useGetStartedShowcaseActiveSlideIds(slideIds, {
      marqueeAnimating: carouselMode === "desktopMarquee",
      scrollRootRef: useScrollVisibility ? scrollRootRef : undefined,
      enableScrollListener: useScrollVisibility,
    });

  useEffect(() => {
    userInteractingRef.current = userInteracting;
  }, [userInteracting]);

  const syncScrollOffsetFromElement = useCallback(() => {
    const el = scrollRootRef.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    let next = el.scrollLeft;
    if (half > 0 && next >= half) {
      next -= half;
      el.scrollLeft = next;
    }
    scrollOffsetRef.current = next;
  }, []);

  const endUserInteraction = useCallback(() => {
    if (scrollIdleTimeoutRef.current) {
      clearTimeout(scrollIdleTimeoutRef.current);
      scrollIdleTimeoutRef.current = null;
    }
    userInteractingRef.current = false;
    syncScrollOffsetFromElement();
    setUserInteracting(false);
  }, [syncScrollOffsetFromElement]);

  const scheduleEndAfterScrollIdle = useCallback(() => {
    if (scrollIdleTimeoutRef.current) {
      clearTimeout(scrollIdleTimeoutRef.current);
    }
    scrollIdleTimeoutRef.current = setTimeout(() => {
      scrollIdleTimeoutRef.current = null;
      endUserInteraction();
    }, MOBILE_SCROLL_IDLE_MS);
  }, [endUserInteraction]);

  const handleScrollPointerDown = useCallback(() => {
    if (scrollIdleTimeoutRef.current) {
      clearTimeout(scrollIdleTimeoutRef.current);
      scrollIdleTimeoutRef.current = null;
    }
    userInteractingRef.current = true;
    setUserInteracting(true);
  }, []);

  const handleScrollPointerUp = useCallback(() => {
    scheduleEndAfterScrollIdle();
  }, [scheduleEndAfterScrollIdle]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    prefetchAllProductPreviewShowcaseSlides();
  }, []);

  useEffect(() => {
    scheduleOnIdle(() => prefetchShowcaseSlides(activeSlideIds));
  }, [activeSlideIds]);

  useEffect(() => {
    if (carouselMode !== "mobileScrollAutoplay") return;

    const el = scrollRootRef.current;
    if (!el) return;

    scrollOffsetRef.current = el.scrollLeft;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const half = el.scrollWidth / 2;
      if (half > 0 && !userInteractingRef.current) {
        let next =
          scrollOffsetRef.current +
          (half / MOBILE_AUTO_SCROLL_HALF_TRACK_MS) * dt;
        if (next >= half) next %= half;
        scrollOffsetRef.current = next;
        el.scrollLeft = next;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [carouselMode]);

  useEffect(() => {
    if (carouselMode !== "mobileScrollAutoplay") return;

    const el = scrollRootRef.current;
    if (!el) return;

    const onScroll = () => {
      if (!userInteractingRef.current) return;
      scheduleEndAfterScrollIdle();
    };

    const onScrollEnd = () => {
      if (!userInteractingRef.current) return;
      endUserInteraction();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", onScrollEnd);

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", onScrollEnd);
    };
  }, [carouselMode, endUserInteraction, scheduleEndAfterScrollIdle]);

  useEffect(() => {
    return () => {
      if (scrollIdleTimeoutRef.current) {
        clearTimeout(scrollIdleTimeoutRef.current);
      }
    };
  }, []);

  const scrollPointerHandlers =
    carouselMode === "mobileScrollAutoplay"
      ? {
          onPointerDown: handleScrollPointerDown,
          onPointerUp: handleScrollPointerUp,
          onPointerCancel: handleScrollPointerUp,
        }
      : undefined;

  return (
    <section
      className="relative border-b border-white/10 bg-accent py-8"
      aria-label="Product preview samples"
    >
      <div
        className="relative"
        {...(carouselMode === "desktopMarquee"
          ? {
              onMouseEnter: () => setPaused(true),
              onMouseLeave: () => setPaused(false),
              onFocusCapture: () => setPaused(true),
              onBlurCapture: (e: FocusEvent<HTMLDivElement>) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setPaused(false);
                }
              },
            }
          : undefined)}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-14 bg-gradient-to-r from-accent/85 via-accent/25 to-transparent sm:block"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-14 bg-gradient-to-l from-accent/85 via-accent/25 to-transparent sm:block"
          aria-hidden
        />

        {carouselMode === "scrollOnly" ? (
          <div
            ref={scrollRootRef}
            className={scrollStripClass("scrollOnly")}
            role="list"
          >
            {GET_STARTED_SHOWCASE_SLIDES.map((slide) => (
              <div
                key={slide.id}
                ref={(el) => setSlideItemRef(slide.id, el)}
                role="listitem"
                className="snap-start"
              >
                <GetStartedShowcaseSlide
                  slide={slide}
                  mountDemo={activeSlideIds.has(slide.id)}
                />
              </div>
            ))}
          </div>
        ) : carouselMode === "mobileScrollAutoplay" ? (
          <div
            ref={scrollRootRef}
            className={scrollStripClass("mobileScrollAutoplay")}
            role="list"
            {...scrollPointerHandlers}
          >
            {GET_STARTED_SHOWCASE_SLIDES.map((slide) => (
              <div
                key={slide.id}
                ref={(el) => setSlideItemRef(slide.id, el)}
                role="listitem"
                className="shrink-0"
              >
                <GetStartedShowcaseSlide
                  slide={slide}
                  mountDemo={activeSlideIds.has(slide.id)}
                />
              </div>
            ))}
            {GET_STARTED_SHOWCASE_SLIDES.map((slide) => (
              <div
                key={`${slide.id}-clone`}
                ref={(el) => setSlideCloneRef(slide.id, el)}
                role="listitem"
                aria-hidden
                className="pointer-events-none shrink-0"
              >
                <GetStartedShowcaseSlide
                  slide={slide}
                  mountDemo={activeSlideIds.has(slide.id)}
                  ariaHidden
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-hidden px-4 sm:px-6">
            <div
              className="get-started-showcase-marquee flex w-max items-stretch gap-4"
              style={{
                animation: `get-started-showcase-marquee ${MARQUEE_DURATION} linear infinite`,
                animationPlayState: paused ? "paused" : "running",
              }}
              role="list"
            >
              {GET_STARTED_SHOWCASE_SLIDES.map((slide) => (
                <div
                  key={slide.id}
                  ref={(el) => setSlideItemRef(slide.id, el)}
                  role="listitem"
                >
                  <GetStartedShowcaseSlide
                    slide={slide}
                    mountDemo={activeSlideIds.has(slide.id)}
                  />
                </div>
              ))}
              {GET_STARTED_SHOWCASE_SLIDES.map((slide) => (
                <div
                  key={`${slide.id}-clone`}
                  role="listitem"
                  aria-hidden
                  className="pointer-events-none"
                >
                  <GetStartedShowcaseSlide
                    slide={slide}
                    mountDemo={false}
                    ariaHidden
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes get-started-showcase-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
