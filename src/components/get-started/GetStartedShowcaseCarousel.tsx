"use client";

import { useEffect, useState } from "react";
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

const MARQUEE_DURATION = "110s";

export default function GetStartedShowcaseCarousel() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [paused, setPaused] = useState(false);

  const trackSlides = [
    ...GET_STARTED_SHOWCASE_SLIDES,
    ...GET_STARTED_SHOWCASE_SLIDES,
  ];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    scheduleOnIdle(() => {
      for (const slide of GET_STARTED_SHOWCASE_SLIDES) {
        if (slide.demo.kind === "productPreview") {
          prefetchProductPreviewTab(slide.demo.tabId, {
            prefetchWebsiteDemo,
            prefetchParentDemo,
            prefetchTeacherDemo,
            prefetchAdminDemo,
          });
        }
      }
    });
  }, []);

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
            className="flex items-stretch gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scroll-pl-4 sm:px-6"
            role="list"
          >
            {GET_STARTED_SHOWCASE_SLIDES.map((slide) => (
              <div key={slide.id} role="listitem" className="snap-start">
                <GetStartedShowcaseSlide slide={slide} />
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
              {trackSlides.map((slide, index) => (
                <div
                  key={`${slide.id}-${index}`}
                  role="listitem"
                  aria-hidden={index >= GET_STARTED_SHOWCASE_SLIDES.length}
                >
                  <GetStartedShowcaseSlide
                    slide={slide}
                    ariaHidden={index >= GET_STARTED_SHOWCASE_SLIDES.length}
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
