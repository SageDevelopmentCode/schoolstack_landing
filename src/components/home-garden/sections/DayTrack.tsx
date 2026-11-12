"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PRODUCT_INTRO_COPY } from "@/components/home/home-copy";
import { STICKERS_BY_DEMO, type Sticker } from "@/components/home/FloatingStickers";
import { prefetchDemoStage, type DemoStageKey } from "@/components/home/DemoStage";
import { PRODUCT_PREVIEW_TABS, type ProductPreviewTabId } from "@/lib/marketing/product-preview-tabs";
import { DOWNLOAD_APP_SLIDES } from "@/lib/marketing/download-app-slides";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { useMediaQuery } from "@/components/garden/motion";
import { MARK, Tape } from "@/components/garden/ui";
import { TAPES } from "../assets";
import GardenDemoFrame from "../GardenDemoFrame";
import SectionIntro from "../SectionIntro";
import StickerNote from "../StickerNote";

const tab = (id: ProductPreviewTabId) => PRODUCT_PREVIEW_TABS.find((t) => t.id === id)!;

type Moment = {
  /** Decorative handwritten time-of-day label. */
  when: string;
  sticker: Sticker;
  title: string;
  description: string;
  /** The live demo shown while this moment is active. */
  demo: DemoStageKey;
  tint: string;
};

/** One school day, told through the notifications MudKitchen sends along the way. */
const DAY: Moment[] = [
  { when: "first thing", sticker: STICKERS_BY_DEMO.timeclock[0], title: tab("timeclock").caption, description: tab("timeclock").description, demo: "timeclock", tint: "bg-[var(--sf-butter)]" },
  { when: "morning", sticker: STICKERS_BY_DEMO.attendance[0], title: tab("teachers").caption, description: tab("teachers").description, demo: "attendance", tint: "bg-[var(--sf-mint)]" },
  { when: "mid-morning", sticker: STICKERS_BY_DEMO.parent[1], title: "Messages", description: DOWNLOAD_APP_SLIDES[2].caption, demo: "messages", tint: "bg-[var(--sf-sky)]" },
  { when: "lunchtime", sticker: STICKERS_BY_DEMO.admin[0], title: tab("admin").caption, description: tab("admin").description, demo: "admin", tint: "bg-[var(--sf-peach)]" },
  { when: "afternoon", sticker: STICKERS_BY_DEMO.parent[0], title: tab("parents").caption, description: tab("parents").description, demo: "tuition", tint: "bg-[var(--sf-lav)]" },
  { when: "after pickup", sticker: STICKERS_BY_DEMO.website[0], title: tab("website").caption, description: tab("website").description, demo: "website", tint: "bg-[var(--sf-mint)]" },
  { when: "tonight", sticker: STICKERS_BY_DEMO.marketing[0], title: tab("marketing").caption, description: tab("marketing").description, demo: "marketing", tint: "bg-[var(--sf-butter)]" },
];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "What is Mud Kitchen?" told as a school day. On desktop the moments scroll
 * past on the left while one sticky live demo follows along on the right; on
 * phones they become a snap rail of tappable cards above the demo.
 */
export default function DayTrack() {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduce = useReducedMotion();
  const uid = useId();
  const demoId = `${uid}-demo`;
  const moment = DAY[active];

  // Desktop only: the moment crossing mid-screen drives the demo. The phone rail
  // is horizontal, so every card would cross the band at once there.
  useEffect(() => {
    if (!isDesktop) return;
    const items = listRef.current?.querySelectorAll<HTMLElement>("[data-moment]");
    if (!items?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = Number((e.target as HTMLElement).dataset.moment);
          setActive(i);
          prefetchDemoStage(DAY[i].demo);
        });
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isDesktop]);

  return (
    <section className="relative bg-[var(--sf-paper)] py-24 lg:py-32">
      <div id="product" className="mx-auto w-full max-w-7xl scroll-mt-24 px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionIntro
            pill={`🧺 ${PRODUCT_INTRO_COPY.badge}`}
            tint="forest"
            lead={PRODUCT_INTRO_COPY.heading}
            squiggle={null}
            align="left"
            headingClassName="text-5xl md:text-6xl lg:text-[3.4rem] xl:text-6xl"
          />
          <ul className="flex max-w-sm flex-col gap-2 lg:pb-2">
            {PRODUCT_INTRO_COPY.bullets.map((b, i) => (
              <li key={b.title} className="text-[15px] text-[var(--sf-soft)]">
                <span className={i === 0 ? MARK.butter : i === 1 ? MARK.sky : MARK.mint}>{b.title}</span> {b.body}
              </li>
            ))}
          </ul>
        </div>
        <p className="sf-hand mt-4 text-xl text-[var(--sf-forest)]" aria-hidden="true">
          a day at school, with MudKitchen ↓
        </p>
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] gap-8 px-6 sm:px-10 lg:mt-4 lg:grid-cols-[0.8fr_1.2fr] lg:gap-x-14 lg:gap-y-0 lg:px-16">
        {/* Moments: a snap rail on phones, a vertical scrolly list on desktop */}
        <ol
          ref={listRef}
          className="sf-no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 pt-5 [scroll-padding-inline:1.5rem] sm:-mx-10 sm:px-10 sm:[scroll-padding-inline:2.5rem] lg:col-start-1 lg:row-start-1 lg:mx-0 lg:block lg:snap-none lg:overflow-visible lg:px-0 lg:pb-[8vh] lg:pt-[18vh]"
        >
          {DAY.map((m, i) => {
            const isActive = i === active;
            return (
              <li
                key={m.when}
                data-moment={i}
                className="w-[78vw] max-w-[320px] shrink-0 snap-start lg:flex lg:min-h-[52vh] lg:w-auto lg:max-w-none lg:items-center"
              >
                <button
                  type="button"
                  aria-pressed={isActive}
                  aria-controls={demoId}
                  aria-labelledby={`${uid}-t${i}`}
                  aria-describedby={`${uid}-d${i}`}
                  onClick={() => setActive(i)}
                  onPointerEnter={() => prefetchDemoStage(m.demo)}
                  onFocus={() => prefetchDemoStage(m.demo)}
                  className={`relative flex h-full w-full cursor-pointer flex-col items-start rounded-[26px] border-2 p-5 text-left transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 motion-reduce:transition-none lg:h-auto lg:p-7 ${
                    isActive
                      ? `${m.tint} border-[var(--sf-ink)] shadow-[0_6px_0_0_var(--sf-ink)]`
                      : "border-[var(--sf-ink)]/20 bg-white opacity-75 hover:opacity-100 lg:border-transparent lg:bg-transparent lg:opacity-50 lg:hover:opacity-90"
                  }`}
                >
                  {isActive ? <Tape color={TAPES[i % TAPES.length]} className="-top-3 left-10 -rotate-6" /> : null}
                  <span className="sf-hand text-xl text-[var(--sf-ink)]/70 lg:text-2xl" aria-hidden="true">
                    {m.when}
                  </span>
                  <StickerNote sticker={m.sticker} tint="bg-white" size="sm" className="mt-2 w-fit lg:mt-3" tilt={i % 2 ? 2 : -2} />
                  <h3 id={`${uid}-t${i}`} className="sf-display mt-4 text-2xl leading-[1.05] text-[var(--sf-ink)] lg:mt-5 lg:text-3xl lg:leading-[1]">
                    {m.title}
                  </h3>
                  <p id={`${uid}-d${i}`} className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-[var(--sf-ink)]/80 lg:mt-3 lg:line-clamp-none lg:text-[16px]">
                    {m.description}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>

        {/* The live demo: sticky beside the list on desktop, right under the rail on phones */}
        <div className="relative lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="lg:sticky lg:top-[calc(50vh-min(17vw,250px))]">
            <div className="mb-5 flex items-center gap-4" aria-hidden="true">
              <span className="sf-display text-sm text-[var(--sf-ink)]">
                {pad(active + 1)} / {pad(DAY.length)}
              </span>
              <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-[var(--sf-ink)]/10">
                <span
                  className="block h-full origin-left rounded-full bg-[var(--sf-clay)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                  style={{ transform: `scaleX(${(active + 1) / DAY.length})` }}
                />
              </span>
            </div>
            <div id={demoId}>
              <GardenDemoFrame active={moment.demo} tilt={0.6} tape="var(--sf-sky)" tapeSide="right">
                <div className="pointer-events-none absolute -bottom-7 -left-6 z-20 hidden lg:block" aria-hidden="true">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={moment.sticker.id}
                      initial={reduce ? false : { opacity: 0, scale: 0.6, y: 14 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.85, y: -8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <StickerNote sticker={moment.sticker} tint={moment.tint} tilt={-4} size="sm" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </GardenDemoFrame>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 lg:col-start-1 lg:row-start-2 lg:flex-col lg:items-start lg:gap-4 lg:pl-7">
          <span className="sf-hand text-3xl text-[var(--sf-forest)]" aria-hidden="true">
            …and that&rsquo;s a day. 🌙
          </span>
          <a
            href={BOOK_DEMO_HASH_HREF}
            className="sf-display rounded-md text-4xl leading-none text-[var(--sf-clay)] underline decoration-[var(--sf-butter)] decoration-[6px] underline-offset-8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
          >
            Book a Demo →
          </a>
        </div>
      </div>
    </section>
  );
}
