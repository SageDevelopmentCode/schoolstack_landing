"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useSyncExternalStore,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import DemoPreviewFrame from "@/components/demo/DemoPreviewFrame";
import MobileAppDownloadBadges from "@/components/download/MobileAppDownloadBadges";
import { Pill } from "@/components/garden/ui";
import { TAPES } from "@/components/home-garden/assets";
import PhoneCard from "@/components/home-garden/PhoneCard";
import {
  DOWNLOAD_APP_SLIDE_ASPECT_RATIO,
  DOWNLOAD_APP_SLIDES,
} from "@/lib/marketing/download-app-slides";

const COUNT = DOWNLOAD_APP_SLIDES.length;
const AUTO_ADVANCE_MS = 6000;
/** Vertical room below the stage: caption, controls and store badges. */
const FOOTER_HEIGHT = 168;
/** PhoneCard's white border (p-2 on each side). */
const CARD_PADDING = 16;
/** Neighbour cards: how much smaller and how far out each ring sits. */
const SIDE_SCALE = 0.8;
const SIDE_GAP = 28;
const TILTS = [-2, 2.5, -1.5, 2, -2.5];

const wrap = (index: number) => ((index % COUNT) + COUNT) % COUNT;

/** Signed distance from the active slide, the short way round the loop. */
function offsetFrom(active: number, index: number) {
  let offset = index - active;
  if (offset > COUNT / 2) offset -= COUNT;
  if (offset < -COUNT / 2) offset += COUNT;
  return offset;
}

/** SSR-safe media query: false on the server and during hydration. */
function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const controlButton =
  "flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-white text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-lav)]";

/**
 * The walkthrough's mobile step: the MudKitchen app store screenshots as taped
 * phone cards. Same for every school, so there is no per-demo mobile code.
 */
export default function ScaledMobileAppPreview() {
  const bodyRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
  // Only mount the layout in use, so the hidden one doesn't fetch images too.
  const isPhone = useMedia("(max-width: 639px)");

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const update = () =>
      setStage({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const goTo = useCallback((index: number) => setActive(wrap(index)), []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = window.setTimeout(
      () => setActive((i) => wrap(i + 1)),
      AUTO_ADVANCE_MS,
    );
    return () => window.clearTimeout(id);
  }, [active, paused, reducedMotion]);

  // Phones: keep the snap rail on the active slide (dots, auto-advance).
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || rail.offsetParent === null) return;
    const card = rail.children[active] as HTMLElement | undefined;
    if (!card) return;
    const left = card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2;
    if (Math.abs(rail.scrollLeft - left) > 4) {
      rail.scrollTo({ left, behavior: reducedMotion ? "auto" : "smooth" });
    }
  }, [active, reducedMotion]);

  const onRailScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const centre = rail.scrollLeft + rail.clientWidth / 2;
    let nearest = 0;
    let best = Infinity;
    Array.from(rail.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const distance = Math.abs(el.offsetLeft + el.clientWidth / 2 - centre);
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });
    setActive((current) => (current === nearest ? current : nearest));
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(active - 1);
    }
  };

  // Desktop stage: the active card fills the height; neighbours ring out while they fit.
  const imageHeight = Math.max(stage.height - CARD_PADDING - 12, 0);
  const cardWidth = Math.round(
    imageHeight * DOWNLOAD_APP_SLIDE_ASPECT_RATIO + CARD_PADDING,
  );
  const step = cardWidth * ((1 + SIDE_SCALE) / 2) + SIDE_GAP;
  const rings =
    cardWidth > 0
      ? Math.max(
          0,
          Math.min(
            2,
            Math.floor((stage.width / 2 - cardWidth / 2) / (step * 0.85)),
          ),
        )
      : 0;
  const slide = DOWNLOAD_APP_SLIDES[active];
  // Phones: one card, as tall as fits, never wider than ~70% of the frame.
  const railCardWidth = Math.round(Math.min(stage.width * 0.7, cardWidth));
  const railPadding = Math.max(0, (stage.width - railCardWidth) / 2);

  return (
    <DemoPreviewFrame variant="mobile">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="MudKitchen app screenshots"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setPaused(false);
        }}
        className="flex h-full flex-col bg-[var(--sf-cream)] font-[family-name:var(--font-sf-body)] text-[var(--sf-ink)] outline-none sf-grid"
      >
        <div ref={bodyRef} className="relative mt-5 min-h-0 flex-1">
          {/* Desktop and tablet: a fanned stage sized from the frame height. */}
          <div className="absolute inset-0 hidden sm:block">
            {cardWidth > 0 && !isPhone
              ? DOWNLOAD_APP_SLIDES.map((s, i) => {
                  const offset = offsetFrom(active, i);
                  const distance = Math.abs(offset);
                  const visible = distance <= rings;
                  const scale = distance === 0 ? 1 : SIDE_SCALE ** distance;
                  return (
                    <div
                      key={s.src}
                      aria-hidden={offset !== 0}
                      className="absolute left-1/2 top-0 origin-top"
                      style={{
                        width: cardWidth,
                        transform: `translateX(calc(-50% + ${offset * step}px)) scale(${scale})`,
                        opacity: visible
                          ? distance === 0
                            ? 1
                            : distance === 1
                              ? 0.6
                              : 0.3
                          : 0,
                        zIndex: 10 - distance,
                        pointerEvents: visible ? "auto" : "none",
                        transition: reducedMotion
                          ? "opacity 200ms linear"
                          : "transform 600ms cubic-bezier(0.34,1.36,0.64,1), opacity 400ms ease",
                      }}
                    >
                      {offset === 0 ? (
                        <PhoneCard
                          slide={s}
                          tilt={0}
                          tape={TAPES[i % TAPES.length]}
                          sizes={`${cardWidth}px`}
                          showCaption={false}
                          priority={i === 0}
                        />
                      ) : (
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => goTo(i)}
                          aria-label={`Show screenshot ${i + 1}`}
                          className="block w-full cursor-pointer text-left"
                        >
                          <PhoneCard
                            slide={s}
                            tilt={TILTS[i % TILTS.length]}
                            tape={null}
                            sizes={`${Math.round(cardWidth * SIDE_SCALE)}px`}
                            showCaption={false}
                            loading={distance <= 1 ? "eager" : "lazy"}
                          />
                        </button>
                      )}
                    </div>
                  );
                })
              : null}
          </div>

          {/* Phones: one card at a time in a snap rail. */}
          <div
            ref={railRef}
            onScroll={onRailScroll}
            className="absolute inset-0 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden"
            style={{ paddingLeft: railPadding, paddingRight: railPadding }}
          >
            {railCardWidth > 0 && isPhone
              ? DOWNLOAD_APP_SLIDES.map((s, i) => (
                  <div
                    key={s.src}
                    className="shrink-0 snap-center"
                    style={{ width: railCardWidth }}
                    aria-hidden={i !== active}
                  >
                    <PhoneCard
                      slide={s}
                      tilt={0}
                      tape={null}
                      sizes={`${railCardWidth}px`}
                      showCaption={false}
                      loading={
                        Math.abs(offsetFrom(active, i)) <= 1 ? "eager" : "lazy"
                      }
                    />
                  </div>
                ))
              : null}
          </div>
        </div>

        <div
          className="flex shrink-0 flex-col items-center gap-2.5 px-4 pb-4 pt-3"
          style={{ minHeight: FOOTER_HEIGHT }}
        >
          <p
            aria-live="polite"
            className="max-w-md text-center text-sm font-bold leading-snug text-[var(--sf-soft)]"
          >
            {slide.caption}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous screenshot"
              className={controlButton}
            >
              <ChevronLeft
                className="h-5 w-5"
                strokeWidth={2.6}
                aria-hidden="true"
              />
            </button>
            <div className="flex items-center gap-1.5">
              {DOWNLOAD_APP_SLIDES.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Screenshot ${i + 1} of ${COUNT}`}
                  aria-current={i === active}
                  className={`h-2.5 rounded-full border-2 border-[var(--sf-ink)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-lav)] ${
                    i === active
                      ? "w-6 bg-[var(--sf-ink)]"
                      : "w-2.5 bg-white hover:bg-[var(--sf-lav)]"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next screenshot"
              className={controlButton}
            >
              <ChevronRight
                className="h-5 w-5"
                strokeWidth={2.6}
                aria-hidden="true"
              />
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Pill
              tint="lav"
              className="!px-3 !py-1 !text-xs max-md:!hidden"
            >
              <span aria-hidden="true">📱</span> Families · Teachers · Admins
            </Pill>
            <MobileAppDownloadBadges
              className="flex items-center gap-2"
              badgeClassName="h-9 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </DemoPreviewFrame>
  );
}
