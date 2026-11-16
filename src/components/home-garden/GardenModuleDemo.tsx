"use client";

import { useState, type ReactNode } from "react";
import { STICKERS_BY_DEMO } from "@/components/home/FloatingStickers";
import { prefetchDemoStage } from "@/components/home/DemoStage";
import { PRODUCT_PREVIEW_TABS, type ProductPreviewTabId } from "@/lib/marketing/product-preview-tabs";
import { Arrow, Draw, Tape } from "@/components/garden/ui";
import GardenDemoFrame from "./GardenDemoFrame";
import StickerNote from "./StickerNote";
import { GROUP_TINT, TAB_TO_DEMO } from "./product-tabs";

const CARD_TILTS = [-2, 1.5, -1, 2, -1.5, 1, -2.5];

/**
 * Taped index cards (one per product module) drive the live demo
 * (recipe 10, classroom wall). Cards become a snap rail below lg.
 */
export default function GardenModuleDemo({
  idPrefix,
  aside,
  initial = "website",
}: {
  /** Unique per page: keys the tabpanel id. */
  idPrefix: string;
  /** Extra content under the cards on desktop (e.g. a Book a Demo link). */
  aside?: ReactNode;
  initial?: ProductPreviewTabId;
}) {
  const [active, setActive] = useState<ProductPreviewTabId>(initial);
  const demo = TAB_TO_DEMO[active];
  const tab = PRODUCT_PREVIEW_TABS.find((t) => t.id === active)!;
  const [s1, s2] = STICKERS_BY_DEMO[demo];
  const panelId = `${idPrefix}-demo`;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[300px_1fr] lg:gap-14">
      <div>
        <p className="sf-hand mb-4 hidden text-xl text-[var(--sf-soft)] lg:block" aria-hidden="true">
          pick a card, any card →
        </p>
        <div
          role="tablist"
          aria-label="MudKitchen modules"
          className="sf-no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 pt-3 [scroll-padding-inline:1.5rem] sm:-mx-10 sm:px-10 sm:[scroll-padding-inline:2.5rem] lg:mx-0 lg:grid lg:gap-3 lg:overflow-visible lg:p-0"
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
                aria-controls={panelId}
                onClick={() => setActive(t.id)}
                onPointerEnter={() => prefetchDemoStage(TAB_TO_DEMO[t.id])}
                onFocus={() => prefetchDemoStage(TAB_TO_DEMO[t.id])}
                className={`relative flex w-60 shrink-0 snap-start cursor-pointer items-center gap-3 rounded-2xl border-2 border-[var(--sf-ink)] px-4 py-3 text-left transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 lg:w-auto ${
                  isActive
                    ? `${g.bg} z-10 shadow-[0_5px_0_0_var(--sf-ink)] lg:translate-x-3 lg:!rotate-0`
                    : "bg-white shadow-[0_2px_0_0_var(--sf-ink)] hover:-translate-y-0.5 hover:!rotate-0 focus-visible:!rotate-0"
                }`}
                style={{ rotate: `${CARD_TILTS[i % CARD_TILTS.length]}deg` }}
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
        {aside ? <div className="mt-5 hidden lg:block">{aside}</div> : null}
      </div>

      <div id={panelId} role="tabpanel" aria-label={tab.caption} className="relative min-w-0">
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
  );
}
