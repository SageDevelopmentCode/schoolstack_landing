"use client";

import { useState } from "react";
import { PRODUCT_INTRO_COPY } from "@/components/home/home-copy";
import { STICKERS_BY_DEMO } from "@/components/home/FloatingStickers";
import { prefetchDemoStage } from "@/components/home/DemoStage";
import { PRODUCT_PREVIEW_TABS, type ProductPreviewTabId } from "@/lib/marketing/product-preview-tabs";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { Reveal } from "@/components/garden/motion";
import { Arrow, Draw, MARK, Tape } from "@/components/garden/ui";
import GardenDemoFrame from "../../GardenDemoFrame";
import SectionIntro from "../../SectionIntro";
import StickerNote from "../../StickerNote";
import { GROUP_TINT, TAB_TO_DEMO } from "../../product-tabs";

const CARD_TILTS = [-2, 1.5, -1, 2, -1.5, 1, -2.5];

/** "What is Mud Kitchen?" — taped index cards drive the live product demo. */
export default function Product() {
  const [active, setActive] = useState<ProductPreviewTabId>("website");
  const demo = TAB_TO_DEMO[active];
  const tab = PRODUCT_PREVIEW_TABS.find((t) => t.id === active)!;
  const [s1, s2] = STICKERS_BY_DEMO[demo];

  return (
    <section id="product" className="relative scroll-mt-20 bg-[var(--sf-paper)] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          pill={`🧺 ${PRODUCT_INTRO_COPY.badge}`}
          tint="forest"
          lead={PRODUCT_INTRO_COPY.heading}
          squiggle={null}
          headingClassName="text-5xl md:text-7xl"
        />
        <Reveal className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3" stagger={0.08} y={20}>
          {PRODUCT_INTRO_COPY.bullets.map((b, i) => (
            <span key={b.title} className="rounded-full bg-white px-5 py-2.5 text-[15px] text-[var(--sf-soft)] ring-2 ring-[var(--sf-ink)]/10">
              <span className={i === 0 ? MARK.butter : i === 1 ? MARK.sky : MARK.mint}>{b.title}</span> {b.body}
            </span>
          ))}
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-14">
          {/* Index cards */}
          <div>
            <p className="sf-hand mb-4 hidden text-xl text-[var(--sf-soft)] lg:block" aria-hidden="true">
              pick a card, any card →
            </p>
            <div
              role="tablist"
              aria-label="MudKitchen modules"
              className="sf-no-scrollbar -mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-4 pt-3 [scroll-padding-inline:1.5rem] lg:mx-0 lg:grid lg:gap-3 lg:overflow-visible lg:p-0"
            >
              {PRODUCT_PREVIEW_TABS.map((t, i) => {
                const isActive = t.id === active;
                const Icon = t.icon;
                const g = GROUP_TINT[t.group];
                return (
                  <button
                    key={t.id}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    aria-controls="garden-product-demo"
                    onClick={() => setActive(t.id)}
                    onPointerEnter={() => prefetchDemoStage(TAB_TO_DEMO[t.id])}
                    onFocus={() => prefetchDemoStage(TAB_TO_DEMO[t.id])}
                    className={`relative flex w-60 shrink-0 snap-start cursor-pointer items-center gap-3 rounded-2xl border-2 border-[var(--sf-ink)] px-4 py-3 text-left transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 lg:w-auto ${
                      isActive
                        ? `${g.bg} z-10 translate-x-0 shadow-[0_5px_0_0_var(--sf-ink)] lg:translate-x-3 lg:!rotate-0`
                        : "bg-white shadow-[0_2px_0_0_var(--sf-ink)] hover:-translate-y-0.5 hover:!rotate-0"
                    }`}
                    style={{ rotate: `${CARD_TILTS[i]}deg` }}
                  >
                    {isActive ? <Tape color="var(--sf-paper)" className="-top-2.5 left-6 h-5 w-14 -rotate-6" /> : null}
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white ring-2 ring-[var(--sf-ink)]">
                      <Icon size={19} strokeWidth={2.3} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-extrabold leading-tight text-[var(--sf-ink)]">{t.caption}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-[var(--sf-soft)]">
                        <span className={`h-2 w-2 rounded-full ${g.dot}`} aria-hidden="true" />
                        {g.label}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <a
              href={BOOK_DEMO_HASH_HREF}
              className="mt-5 hidden items-center justify-between rounded-2xl border-2 border-dashed border-[var(--sf-ink)]/30 px-4 py-3 font-extrabold text-[var(--sf-clay)] transition-colors hover:border-[var(--sf-clay)] hover:bg-[var(--sf-peach)]/40 lg:flex"
            >
              Book a Demo <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Live demo */}
          <div id="garden-product-demo" role="tabpanel" aria-label={tab.caption} className="relative min-w-0">
            <p className="mb-5 max-w-xl text-lg leading-relaxed text-[var(--sf-soft)]">
              <span className="font-extrabold text-[var(--sf-ink)]">{tab.caption}.</span> {tab.description}
            </p>
            <GardenDemoFrame active={demo} tilt={-0.6} tape="var(--sf-mint)">
              <div className="pointer-events-none absolute -right-4 -top-8 hidden xl:block" aria-hidden="true">
                <StickerNote key={s1.id} sticker={s1} tint="bg-[var(--sf-butter)]" tilt={6} size="sm" />
              </div>
              <div className="pointer-events-none absolute -bottom-7 -left-6 hidden xl:block" aria-hidden="true">
                <StickerNote key={s2.id} sticker={s2} tint="bg-[var(--sf-lav)]" tilt={-5} size="sm" />
              </div>
            </GardenDemoFrame>
            <div className="mt-8 hidden items-center gap-3 lg:flex" aria-hidden="true">
              <Draw className="block w-16 -scale-y-100">
                <Arrow color="var(--sf-soft)" />
              </Draw>
              <span className="sf-hand text-xl text-[var(--sf-soft)]">psst — it&rsquo;s interactive. click around!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
