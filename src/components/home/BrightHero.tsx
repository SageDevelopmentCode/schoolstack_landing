"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, BookOpen, LayoutDashboard, Users, type LucideIcon } from "lucide-react";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { PRODUCT_PREVIEW_GROUP_COLORS } from "@/lib/marketing/product-preview-tabs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import DemoStage, { prefetchDemoStage, type DemoStageKey } from "./DemoStage";
import FloatingStickers, { STICKERS_BY_DEMO } from "./FloatingStickers";
import { HERO_COPY } from "./home-copy";
import { ACCENT_HIGHLIGHT, BOLD_HEADING, DARK_PILL, OUTLINE_PILL } from "./bright-styles";

const TABS: { key: DemoStageKey; label: string; caption: string; icon: LucideIcon; color: string }[] = [
  { key: "parent", label: "Parent View", caption: "Parent portal", icon: Users, color: PRODUCT_PREVIEW_GROUP_COLORS.parent },
  { key: "teacher", label: "Teacher View", caption: "Teacher portal", icon: BookOpen, color: PRODUCT_PREVIEW_GROUP_COLORS.teacher },
  { key: "admin", label: "Admin View", caption: "Admin workspace", icon: LayoutDashboard, color: PRODUCT_PREVIEW_GROUP_COLORS.admin },
];

export default function BrightHero() {
  const [active, setActive] = useState<DemoStageKey>("parent");
  const tab = TABS.find((t) => t.key === active)!;
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const isLg = useMediaQuery("(min-width: 1024px)");
  const tilt = isLg && !reduceMotion;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 0.45], [24, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.86, 1]);
  const y = useTransform(scrollYProgress, [0, 0.45], [0, -40]);
  const glow = useTransform(scrollYProgress, [0, 0.45], [0.45, 0.9]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white pb-16 pt-[116px] lg:pb-20 lg:pt-[150px]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 top-[420px] h-[520px] w-[520px] rounded-full bg-[#FDE3D3] opacity-70 blur-[120px]" />
        <div className="absolute -right-32 top-[360px] h-[560px] w-[560px] rounded-full bg-[#DCE8FD] opacity-80 blur-[120px]" />
        <div className="absolute left-1/2 top-[760px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#DDF3E8] opacity-80 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-5 lg:px-10">
        <div className="mx-auto max-w-[980px] text-center">
          <div className="hero-enter" style={{ "--hero-delay": "0ms" } as React.CSSProperties}>
            <span className="font-secondary inline-flex items-center gap-1.5 rounded-pill bg-[#F4F1EC] px-4 py-1.5 text-[12px] font-semibold text-[#1d1a16]">
              🌿 {HERO_COPY.badge}
            </span>
          </div>
          <h1 className={`mt-6 text-[clamp(2.6rem,6.4vw,5.6rem)] ${BOLD_HEADING}`}>
            {HERO_COPY.headlineLead} <span className={ACCENT_HIGHLIGHT}>{HERO_COPY.headlineAccent}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-[17px] leading-relaxed text-[#1d1a16]/70 md:text-[19px]">
            {HERO_COPY.body}
          </p>
          <div className="hero-enter mt-8 flex flex-wrap items-center justify-center gap-3" style={{ "--hero-delay": "200ms" } as React.CSSProperties}>
            <a href={BOOK_DEMO_HASH_HREF} className={DARK_PILL}>
              {HERO_COPY.primaryCta}
              <ArrowRight size={16} aria-hidden />
            </a>
            <a href="#product" className={OUTLINE_PILL}>
              {HERO_COPY.secondaryCta}
              <ArrowDown size={16} aria-hidden />
            </a>
          </div>
        </div>

        <div className="mt-14 flex justify-center">
          <div
            className="flex items-center gap-1 rounded-full bg-white p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] ring-1 ring-black/5"
            role="tablist"
            aria-label="Portal views"
          >
            {TABS.map((t) => {
              const isActive = t.key === active;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(t.key)}
                  onMouseEnter={() => prefetchDemoStage(t.key)}
                  className={`font-secondary flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2.5 text-[12px] font-semibold transition-all duration-200 sm:px-5 sm:text-[14px] ${
                    isActive ? "bg-[#1d1a16] text-white shadow-sm" : "text-[#1d1a16]/60 hover:text-[#1d1a16]"
                  }`}
                >
                  <t.icon size={15} className="hidden sm:block" style={{ color: t.color }} aria-hidden />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hero-frame-enter relative mx-auto mt-8 max-w-[1120px]" style={{ perspective: tilt ? 1600 : undefined }}>
          <motion.div style={tilt ? { rotateX, scale, y, transformOrigin: "50% 0%" } : undefined} className="relative">
            <FloatingStickers stickers={STICKERS_BY_DEMO[active]} />
            <motion.div
              className="pointer-events-none absolute -inset-8 rounded-[48px] bg-[radial-gradient(closest-side,rgba(253,214,190,0.9),rgba(220,232,253,0.7),transparent)] blur-2xl"
              style={{ opacity: tilt ? glow : 0.7 }}
              aria-hidden="true"
            />
            <DemoStage
              active={active}
              tour
              designHeight={680}
              minScale={0.42}
              className="relative rounded-[28px] border border-black/10 bg-white shadow-[0_50px_120px_rgba(20,20,40,0.16)]"
              header={
                <div className="flex h-11 items-center gap-2 border-b border-black/5 bg-[#FAF9F7] px-4">
                  <span className="h-3 w-3 rounded-full bg-[#FF6159]" />
                  <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                  <span className="h-3 w-3 rounded-full bg-[#28C941]" />
                  <span className="font-secondary mx-auto truncate rounded-pill bg-white px-4 py-1 text-[12px] text-[#1d1a16]/50 ring-1 ring-black/5">
                    trymudkitchen.com · {tab.caption}
                  </span>
                  <span className="w-[52px]" aria-hidden />
                </div>
              }
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
