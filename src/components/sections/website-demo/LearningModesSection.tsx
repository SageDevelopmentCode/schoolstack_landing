"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { DemoLearningModesSection } from "@/data/school-demos/types";
import DemoIcon from "./DemoIcon";
import { DEMO_BLOCK, DEMO_BODY, DEMO_EYEBROW, DEMO_GUTTER, DEMO_H3, DEMO_INK, DEMO_TILE, DEMO_TINTS, STORY_EASE } from "./bright-demo-theme";
import SiteSectionHeader from "./sections/SiteSectionHeader";

export default function LearningModesSection({ section }: { section: DemoLearningModesSection }) {
  return (
    <section id="signature" className={`scroll-mt-[88px] py-3 ${DEMO_GUTTER}`}>
      <div className={`${DEMO_BLOCK} bg-[var(--demo-tint-3)]`}>
        <SiteSectionHeader eyebrow={section.eyebrow} heading={section.heading} subtitle={section.subtitle} align="split" />

        <div className="mt-12 grid gap-3 @2xl/site:grid-cols-2 @6xl/site:grid-cols-4">
          {section.modes.map((mode, i) => (
            <motion.div
              key={mode.title}
              className={`${DEMO_TILE} relative flex flex-col bg-white`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: STORY_EASE }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: DEMO_TINTS[i % DEMO_TINTS.length] }}
                >
                  <DemoIcon name={mode.icon} className="h-5 w-5 text-[var(--demo-accent)]" />
                </span>
                <span className="font-secondary text-[13px] font-bold text-[var(--demo-ink)]/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className={`${DEMO_EYEBROW} mt-8`}>{mode.label}</p>
              <h3 className={`${DEMO_H3} ${DEMO_INK} mt-2`}>{mode.title}</h3>
              <p className={`${DEMO_BODY} mt-2 text-[15px]`}>{mode.desc}</p>
            </motion.div>
          ))}
        </div>

        {section.flexFriday ? (
          <motion.div
            className="relative mt-3 flex flex-col gap-4 overflow-hidden rounded-[28px] bg-[var(--demo-ink)] p-7 text-white @3xl/site:flex-row @3xl/site:items-center @3xl/site:gap-10 @3xl/site:p-9"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: STORY_EASE }}
          >
            <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-[var(--demo-glow)] blur-3xl" aria-hidden />
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Sparkles className="h-6 w-6 text-[var(--demo-primary-light)]" aria-hidden />
            </span>
            <p className="font-secondary relative text-[1.5rem] font-bold leading-tight tracking-[-0.02em] @3xl/site:w-1/3">
              {section.flexFriday.title}
            </p>
            <p className="font-secondary relative text-[15px] leading-relaxed text-white/70 @3xl/site:flex-1">
              {section.flexFriday.desc}
            </p>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
