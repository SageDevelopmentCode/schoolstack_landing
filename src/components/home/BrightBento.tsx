"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import {
  PRODUCT_PREVIEW_GROUP_COLORS,
  PRODUCT_PREVIEW_GROUP_META,
  PRODUCT_PREVIEW_TABS,
  type ProductPreviewTabId,
} from "@/lib/marketing/product-preview-tabs";
import DemoStage, { prefetchDemoStage } from "./DemoStage";
import { PREVIEW_TAB_TO_DEMO_KEY } from "./chapters";
import { HERO_COPY, PRODUCT_INTRO_COPY } from "./home-copy";
import { BOLD_HEADING, GROUP_TINTS } from "./bright-styles";

const GROUP_LABEL = Object.fromEntries(PRODUCT_PREVIEW_GROUP_META.map((g) => [g.id, g.label]));

export default function BrightBento() {
  const [activeId, setActiveId] = useState<ProductPreviewTabId>("admin");
  const active = PRODUCT_PREVIEW_TABS.find((t) => t.id === activeId)!;
  const color = PRODUCT_PREVIEW_GROUP_COLORS[active.group];

  return (
    <section id="product" className="scroll-mt-20 bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
        <FadeInView>
          <div className="mx-auto max-w-[820px] text-center">
            <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
              {PRODUCT_INTRO_COPY.badge}
            </p>
            <h2 className={`mt-4 text-[clamp(2rem,4.4vw,3.6rem)] ${BOLD_HEADING}`}>{PRODUCT_INTRO_COPY.heading}</h2>
            <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
              {PRODUCT_INTRO_COPY.bullets.map((item) => (
                <li
                  key={item.title}
                  className="font-secondary flex items-center gap-2 rounded-pill bg-[#F4F1EC] px-4 py-2 text-[14px] text-[#1d1a16]/80"
                >
                  <Check size={14} className="text-clay" aria-hidden />
                  <span>
                    <strong className="font-semibold text-[#1d1a16]">{item.title}</strong> {item.body}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="mt-14 grid gap-4 lg:grid-cols-[400px_minmax(0,1fr)]">
            <div
              className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0"
              style={{ scrollbarWidth: "none" }}
              role="tablist"
              aria-label="Product modules"
            >
              {PRODUCT_PREVIEW_TABS.map((t) => {
                const isActive = t.id === activeId;
                const tColor = PRODUCT_PREVIEW_GROUP_COLORS[t.group];
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveId(t.id)}
                    onMouseEnter={() => prefetchDemoStage(PREVIEW_TAB_TO_DEMO_KEY[t.id])}
                    className={`flex w-[170px] shrink-0 flex-col justify-between gap-6 rounded-[22px] p-4 text-left transition-all duration-200 lg:w-auto ${
                      isActive ? "bg-white shadow-[0_14px_36px_rgba(0,0,0,0.10)]" : "hover:-translate-y-0.5"
                    }`}
                    style={{
                      backgroundColor: isActive ? "#fff" : GROUP_TINTS[t.group],
                      boxShadow: isActive ? `inset 0 0 0 2px ${tColor}, 0 14px 36px rgba(0,0,0,0.08)` : undefined,
                    }}
                  >
                    <span className="flex items-center justify-between">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ backgroundColor: tColor, color: "#fff" }}
                      >
                        <t.icon size={17} aria-hidden />
                      </span>
                      <span
                        className="font-secondary text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: tColor }}
                      >
                        {GROUP_LABEL[t.group]}
                      </span>
                    </span>
                    <span className="font-secondary text-[16px] font-bold tracking-tight text-[#1d1a16]">{t.caption}</span>
                  </button>
                );
              })}
              <a
                href={BOOK_DEMO_HASH_HREF}
                className="flex w-[170px] shrink-0 flex-col justify-between gap-6 rounded-[22px] bg-[#1d1a16] p-4 text-white transition-colors hover:bg-clay lg:w-auto"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <ArrowRight size={17} aria-hidden />
                </span>
                <span className="font-secondary text-[16px] font-bold tracking-tight">{HERO_COPY.primaryCta}</span>
              </a>
            </div>

            <div className="min-w-0 rounded-[28px] p-3" style={{ backgroundColor: GROUP_TINTS[active.group] }}>
              <div className="flex min-h-[3.5rem] items-center gap-3 px-3 pb-3 pt-1">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
                <AnimatePresence mode="wait">
                  <motion.p
                    key={active.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ duration: 0.2 }}
                    className="text-[14px] leading-snug text-[#1d1a16]/70"
                  >
                    <strong className="font-semibold text-[#1d1a16]">{active.caption}.</strong> {active.description}
                  </motion.p>
                </AnimatePresence>
              </div>
              <DemoStage
                active={PREVIEW_TAB_TO_DEMO_KEY[active.id]}
                interactive
                designHeight={700}
                minScale={0.5}
                maxScale={0.8}
                className="rounded-[20px] border border-black/5 bg-white"
              />
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
