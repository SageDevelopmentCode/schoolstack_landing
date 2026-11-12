"use client";

import { useEffect, useRef, useState } from "react";
import { PRODUCT_INTRO_COPY } from "@/components/home/home-copy";
import { STICKERS_BY_DEMO } from "@/components/home/FloatingStickers";
import { prefetchDemoStage } from "@/components/home/DemoStage";
import { PRODUCT_PREVIEW_TABS, type ProductPreviewTabId } from "@/lib/marketing/product-preview-tabs";
import { MARK } from "@/components/garden/ui";
import GardenDemoFrame from "../../GardenDemoFrame";
import SectionIntro from "../../SectionIntro";
import StickerNote from "../../StickerNote";
import { GROUP_TINT, TAB_TO_DEMO } from "../../product-tabs";

/**
 * "What is Mud Kitchen?" as a field guide: chapters scroll past on the left
 * while one sticky live demo on the right follows along.
 */
export default function ModulesScrolly() {
  const [active, setActive] = useState<ProductPreviewTabId>(PRODUCT_PREVIEW_TABS[0].id);
  const listRef = useRef<HTMLOListElement>(null);
  const idx = PRODUCT_PREVIEW_TABS.findIndex((t) => t.id === active);
  const demo = TAB_TO_DEMO[active];

  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>("[data-chapter]");
    if (!items?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = (e.target as HTMLElement).dataset.chapter as ProductPreviewTabId;
          setActive(id);
          prefetchDemoStage(TAB_TO_DEMO[id]);
        });
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="product" className="relative scroll-mt-20 bg-[var(--sf-paper)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-12">
        <SectionIntro
          pill={`🧺 ${PRODUCT_INTRO_COPY.badge}`}
          tint="forest"
          lead={PRODUCT_INTRO_COPY.heading}
          squiggle={null}
          align="left"
          headingClassName="text-5xl md:text-6xl xl:text-7xl max-w-4xl"
          className="max-w-4xl"
        />
        <ul className="mt-8 grid gap-3 border-t-2 border-[var(--sf-ink)] pt-6 md:grid-cols-3">
          {PRODUCT_INTRO_COPY.bullets.map((b, i) => (
            <li key={b.title} className="text-lg text-[var(--sf-soft)]">
              <span className={i === 0 ? MARK.butter : i === 1 ? MARK.sky : MARK.mint}>{b.title}</span> {b.body}
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
          {/* Chapters */}
          <ol ref={listRef} className="lg:py-[18vh]">
            {PRODUCT_PREVIEW_TABS.map((t, i) => {
              const isActive = t.id === active;
              const Icon = t.icon;
              const g = GROUP_TINT[t.group];
              return (
                <li key={t.id} data-chapter={t.id} className="lg:flex lg:min-h-[52vh] lg:items-center">
                  <button
                    type="button"
                    aria-pressed={isActive}
                    aria-controls="home3-demo"
                    onClick={() => setActive(t.id)}
                    className={`group w-full cursor-pointer rounded-[26px] border-2 p-6 text-left transition-all duration-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 lg:p-7 ${
                      isActive ? `border-[var(--sf-ink)] ${g.bg} shadow-[0_6px_0_0_var(--sf-ink)]` : "border-transparent opacity-55 hover:opacity-90"
                    } mb-3 lg:mb-0`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="sf-display text-sm text-[var(--sf-ink)]/50">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-2 ring-[var(--sf-ink)]">
                        <Icon size={18} strokeWidth={2.3} aria-hidden />
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--sf-ink)]/60">
                        <span className={`h-2 w-2 rounded-full ${g.dot}`} aria-hidden="true" />
                        {g.label}
                      </span>
                    </div>
                    <h3 className="sf-display mt-4 text-3xl leading-[1] text-[var(--sf-ink)] lg:text-4xl">{t.caption}</h3>
                    <p className="mt-3 text-[16.5px] leading-relaxed text-[var(--sf-ink)]/75">{t.description}</p>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Sticky demo */}
          <div className="relative order-first lg:order-none">
            <div className="lg:sticky lg:top-[calc(50vh-min(23vw,330px))]">
              <div className="mb-5 flex items-center gap-4" aria-hidden="true">
                <span className="sf-display text-sm text-[var(--sf-ink)]">
                  {String(idx + 1).padStart(2, "0")} / {String(PRODUCT_PREVIEW_TABS.length).padStart(2, "0")}
                </span>
                <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-[var(--sf-ink)]/10">
                  <span
                    className="block h-full origin-left rounded-full bg-[var(--sf-clay)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ transform: `scaleX(${(idx + 1) / PRODUCT_PREVIEW_TABS.length})` }}
                  />
                </span>
              </div>
              <div id="home3-demo">
                <GardenDemoFrame active={demo} tilt={0.6} tape="var(--sf-sky)" tapeSide="right">
                  <div className="pointer-events-none absolute -bottom-7 -left-6 hidden xl:block" aria-hidden="true">
                    <StickerNote key={STICKERS_BY_DEMO[demo][0].id} sticker={STICKERS_BY_DEMO[demo][0]} tint="bg-[var(--sf-butter)]" tilt={-4} size="sm" />
                  </div>
                </GardenDemoFrame>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
