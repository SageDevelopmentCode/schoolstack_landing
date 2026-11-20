"use client";

import { useState } from "react";
import { STICKERS_BY_DEMO } from "@/components/home/FloatingStickers";
import { prefetchDemoStage, type DemoStageKey } from "@/components/home/DemoStage";
import { Arrow, Draw, Tape } from "@/components/garden/ui";
import GardenDemoFrame from "@/components/home-garden/GardenDemoFrame";
import StickerNote from "@/components/home-garden/StickerNote";
import { FREE_PREVIEW_COPY } from "./free-preview-copy";

const COPY = FREE_PREVIEW_COPY.whatYouGet;
const CARDS = COPY.cards;
const CARD_TILTS = [-1.5, 1.2, -1, 1.5];

/**
 * The four parts of a preview (website, parent app, teacher portal, admin portal) as taped
 * index cards driving one large, live, interactive demo. Same pattern as GardenModuleDemo;
 * the cards become a snap rail below lg.
 */
export default function FreePreviewShowcase({ idPrefix = "free-preview" }: { idPrefix?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const card = CARDS[activeIndex];
  const demo = card.demo as DemoStageKey;
  const [s1, s2] = STICKERS_BY_DEMO[demo];
  const panelId = `${idPrefix}-showcase`;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr] lg:gap-14">
      <div>
        <p className="sf-hand mb-4 hidden text-xl text-[var(--sf-soft)] lg:block" aria-hidden="true">
          {COPY.hint}
        </p>
        <div
          role="tablist"
          aria-label="What's in your preview"
          className="sf-no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 pt-3 [scroll-padding-inline:1.5rem] sm:-mx-10 sm:px-10 sm:[scroll-padding-inline:2.5rem] lg:mx-0 lg:grid lg:gap-4 lg:overflow-visible lg:p-0"
        >
          {CARDS.map((c, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={c.title}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={panelId}
                onClick={() => setActiveIndex(i)}
                onPointerEnter={() => prefetchDemoStage(c.demo as DemoStageKey)}
                onFocus={() => prefetchDemoStage(c.demo as DemoStageKey)}
                className={`relative flex w-64 shrink-0 snap-start cursor-pointer items-center gap-3 rounded-2xl border-2 border-[var(--sf-ink)] px-4 py-3.5 text-left transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 lg:w-auto ${
                  isActive
                    ? `${c.tint} z-10 shadow-[0_5px_0_0_var(--sf-ink)] lg:translate-x-3 lg:!rotate-0`
                    : "bg-white shadow-[0_2px_0_0_var(--sf-ink)] hover:-translate-y-0.5 hover:!rotate-0 focus-visible:!rotate-0"
                }`}
                style={{ rotate: `${CARD_TILTS[i % CARD_TILTS.length]}deg` }}
              >
                {isActive ? <Tape color="var(--sf-paper)" className="-top-2.5 left-6 h-5 w-14 -rotate-6" /> : null}
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl ring-2 ring-[var(--sf-ink)]"
                >
                  {c.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block font-extrabold leading-tight text-[var(--sf-ink)]">{c.title}</span>
                  <span className="mt-0.5 block text-xs font-bold text-[var(--sf-soft)]">{c.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div id={panelId} role="tabpanel" aria-label={card.title} className="relative min-w-0">
        <p className="mb-6 max-w-2xl text-lg leading-relaxed text-[var(--sf-soft)]">
          <span className="font-extrabold text-[var(--sf-ink)]">{card.title}.</span> {card.body}
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
          <span className="sf-hand text-xl text-[var(--sf-soft)]">{COPY.interactiveNote}</span>
        </div>
      </div>
    </div>
  );
}
