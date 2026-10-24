"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  DOWNLOAD_APP_SLIDE_ASPECT_RATIO,
  DOWNLOAD_APP_SLIDES,
  DOWNLOAD_APP_SLIDE_COUNT,
  type DownloadAppSlideGroup,
} from "@/lib/marketing/download-app-slides";

const AUTO_ADVANCE_MS = 6000;

function DownloadSlideSkeleton() {
  return (
    <div
      className="absolute inset-0 animate-pulse rounded-[28px] bg-gradient-to-b from-[#E8DFD3] via-[#F0E6D8] to-[#C5D5B8]/40"
      aria-hidden
    />
  );
}

export type DownloadAppScreenshotCarouselHandle = {
  goToIndex: (index: number) => void;
};

type DownloadAppScreenshotCarouselProps = {
  activeIndex: number;
  onIndexChange: (index: number, group: DownloadAppSlideGroup) => void;
  className?: string;
};

const DownloadAppScreenshotCarousel = forwardRef<
  DownloadAppScreenshotCarouselHandle,
  DownloadAppScreenshotCarouselProps
>(function DownloadAppScreenshotCarousel(
  { activeIndex, onIndexChange, className = "" },
  ref,
) {
  const reduceMotion = useReducedMotion();
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(() => new Set([0]));
  const [paused, setPaused] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const slide = DOWNLOAD_APP_SLIDES[activeIndex];
  const isLoaded = loadedIndices.has(activeIndex);

  const goToIndex = useCallback(
    (index: number) => {
      const next = ((index % DOWNLOAD_APP_SLIDE_COUNT) + DOWNLOAD_APP_SLIDE_COUNT) %
        DOWNLOAD_APP_SLIDE_COUNT;
      const nextSlide = DOWNLOAD_APP_SLIDES[next];
      if (nextSlide) {
        onIndexChange(next, nextSlide.group);
      }
    },
    [onIndexChange],
  );

  useImperativeHandle(ref, () => ({ goToIndex }), [goToIndex]);

  const goPrev = useCallback(() => {
    goToIndex(activeIndex - 1);
  }, [activeIndex, goToIndex]);

  const goNext = useCallback(() => {
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);

  useEffect(() => {
    if (reduceMotion || paused) return;

    const id = window.setInterval(() => {
      goToIndex(activeIndex + 1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(id);
  }, [activeIndex, goToIndex, paused, reduceMotion]);

  useEffect(() => {
    const nextIndex = (activeIndex + 1) % DOWNLOAD_APP_SLIDE_COUNT;
    const img = new window.Image();
    img.src = DOWNLOAD_APP_SLIDES[nextIndex].src;
  }, [activeIndex]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  };

  const markLoaded = (index: number) => {
    setLoadedIndices((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  return (
    <div
      className={`mx-auto w-full max-w-[380px] ${className}`.trim()}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        ref={regionRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="MudKitchen mobile app screenshots"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative outline-none focus-visible:ring-2 focus-visible:ring-clay/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-[30px]"
      >
        <div
          className="relative w-full overflow-hidden rounded-[28px] shadow-[0_20px_50px_rgba(43,36,29,0.12)]"
          style={{ aspectRatio: DOWNLOAD_APP_SLIDE_ASPECT_RATIO }}
        >
          {!isLoaded ? <DownloadSlideSkeleton /> : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={slide.src}
              className="absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 90vw, 380px"
                priority={activeIndex === 0}
                loading={activeIndex === 0 ? undefined : "lazy"}
                onLoad={() => markLoaded(activeIndex)}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={goPrev}
          className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/[0.08] bg-white/95 text-accent shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/50"
          aria-label="Previous screenshot"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/[0.08] bg-white/95 text-accent shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/50"
          aria-label="Next screenshot"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {slide.alt}
      </p>

      <div
        className="mt-5 flex flex-wrap items-center justify-center gap-2"
        role="group"
        aria-label="Screenshot slides"
      >
        {DOWNLOAD_APP_SLIDES.map((item, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={item.src}
              type="button"
              aria-current={selected ? "true" : undefined}
              aria-label={`Slide ${index + 1}: ${item.alt}`}
              onClick={() => goToIndex(index)}
              className="rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/50"
              style={{
                width: selected ? 22 : 8,
                height: 8,
                backgroundColor: selected ? "#2E4A3C" : "color-mix(in srgb, #2E4A3C 28%, transparent)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
});

export default DownloadAppScreenshotCarousel;
