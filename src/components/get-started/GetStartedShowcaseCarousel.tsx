"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const MARQUEE_DURATION = "110s";

const SHOWCASE_SLIDE_IDS = GET_STARTED_SHOWCASE_SLIDES.map((slide) => slide.id);

const DEMO_PREFETCHERS = {
  prefetchWebsiteDemo,
  prefetchParentDemo,
  prefetchTeacherDemo,
  prefetchAdminDemo,
};

function prefetchShowcaseSlides(slideIds: Set<string>) {
  for (const slide of GET_STARTED_SHOWCASE_SLIDES) {
    if (!slideIds.has(slide.id)) continue;
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
  const scrollRootRef = useRef<HTMLDivElement>(null);

  const slideIds = useMemo(() => SHOWCASE_SLIDE_IDS, []);

  const { activeSlideIds, setSlideItemRef } = useGetStartedShowcaseActiveSlideIds(
    slideIds,
    {
      marqueeAnimating: !reduceMotion,
      scrollRootRef,
      enableScrollListener: reduceMotion,
    },
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    scheduleOnIdle(() => prefetchShowcaseSlides(activeSlideIds));
  }, [activeSlideIds]);

  return (
    <section
      className="relative border-b border-white/10 bg-accent py-8"
      aria-label="Product preview samples"
    >
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setPaused(false);
          }
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-14 bg-gradient-to-r from-accent/85 via-accent/25 to-transparent sm:block"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-14 bg-gradient-to-l from-accent/85 via-accent/25 to-transparent sm:block"
          aria-hidden
        />

        {reduceMotion ? (
          <div
            ref={scrollRootRef}
            className="flex items-stretch gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scroll-pl-4 sm:px-6"
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
