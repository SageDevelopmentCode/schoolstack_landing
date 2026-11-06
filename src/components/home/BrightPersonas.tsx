"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import DemoStage, { prefetchDemoStage } from "./DemoStage";
import { CHAPTERS } from "./chapters";
import { BOLD_HEADING, DARK_PILL } from "./bright-styles";

export default function BrightPersonas() {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const chapter = CHAPTERS[chapterIndex];
  const tab = chapter.tabs[tabIndex];

  const chooseChapter = (i: number) => {
    setChapterIndex(i);
    setTabIndex(0);
  };

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
        <FadeInView>
          <h2 className={`max-w-[720px] text-[clamp(2rem,4.4vw,3.5rem)] ${BOLD_HEADING}`}>Built for every role</h2>
        </FadeInView>

        <FadeInView delay={0.08}>
          <div className="mt-10 flex flex-col gap-3 lg:flex-row" role="tablist" aria-label="Roles">
            {CHAPTERS.map((c, i) => {
              const isActive = i === chapterIndex;
              return (
                <motion.button
                  key={c.id}
                  layout
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => chooseChapter(i)}
                  onMouseEnter={() => prefetchDemoStage(c.tabs[0].key)}
                  transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
                  className={`group relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-[28px] p-6 text-left lg:min-h-[190px] ${
                    isActive ? "lg:flex-[1.9]" : "lg:flex-1"
                  }`}
                  style={{ backgroundColor: isActive ? c.color : c.tint }}
                >
                  <span className="flex items-center justify-between">
                    <span
                      className={`font-secondary text-[12px] font-semibold uppercase tracking-widest ${
                        isActive ? "text-white/80" : ""
                      }`}
                      style={isActive ? undefined : { color: c.color }}
                    >
                      {c.copy.eyebrow}
                    </span>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200 group-hover:rotate-45 ${
                        isActive ? "bg-white/20 text-white" : "bg-white text-[#1d1a16]"
                      }`}
                    >
                      <ArrowUpRight size={16} aria-hidden />
                    </span>
                  </span>
                  <motion.span
                    layout="position"
                    className={`font-secondary block max-w-[460px] text-[clamp(1.2rem,1.9vw,1.6rem)] font-bold leading-[1.15] tracking-[-0.03em] ${
                      isActive ? "text-white" : "text-[#1d1a16]"
                    }`}
                  >
                    {c.copy.headlineLead} {c.copy.headlineAccent}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </FadeInView>

        <div className="mt-4 overflow-hidden rounded-[32px] p-3 sm:p-4" style={{ backgroundColor: chapter.tint }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-8"
            >
              <div className="flex flex-col p-3 lg:p-5">
                <p className="text-[16px] leading-relaxed text-[#1d1a16]/75">{chapter.copy.body}</p>
                {chapter.copy.bullets ? (
                  <ul className="mt-5 space-y-2.5">
                    {chapter.copy.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5">
                        <span
                          className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: chapter.color }}
                          aria-hidden
                        >
                          <Check size={11} />
                        </span>
                        <span className="text-[15px] leading-snug text-[#1d1a16]/75">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-2">
                  {chapter.tabs.map((t, i) => {
                    const isActive = i === tabIndex;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTabIndex(i)}
                        onMouseEnter={() => prefetchDemoStage(t.key)}
                        aria-pressed={isActive}
                        className={`font-secondary flex h-10 items-center gap-1.5 rounded-pill px-4 text-[13px] font-semibold transition-colors ${
                          isActive ? "bg-[#1d1a16] text-white" : "bg-white text-[#1d1a16]/70 hover:text-[#1d1a16]"
                        }`}
                      >
                        <t.icon size={14} aria-hidden />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-8 lg:mt-auto lg:pt-8">
                  <a href={BOOK_DEMO_HASH_HREF} className={DARK_PILL}>
                    {chapter.copy.cta}
                    <ArrowRight size={16} aria-hidden />
                  </a>
                </div>
              </div>

              <DemoStage
                active={tab.key}
                interactive
                designHeight={720}
                minScale={0.5}
                maxScale={0.8}
                className="min-w-0 rounded-[22px] border border-black/5 bg-white shadow-sm"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
