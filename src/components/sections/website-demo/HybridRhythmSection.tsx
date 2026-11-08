"use client";

import { motion } from "framer-motion";
import { Home, School, Sparkles } from "lucide-react";
import type { DemoHybridDay, DemoHybridRhythmSection } from "@/data/school-demos/types";
import { DEMO_BLOCK, DEMO_CHIP, DEMO_GUTTER, STORY_EASE } from "./bright-demo-theme";
import SiteSectionHeader from "./sections/SiteSectionHeader";

function DayColumn({
  title,
  days,
  icon: Icon,
  dark,
  delay,
}: {
  title: string;
  days: DemoHybridDay[];
  icon: typeof School;
  dark: boolean;
  delay: number;
}) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-[28px] p-7 @3xl/site:p-9 ${dark ? "bg-[var(--demo-ink)] text-white" : "bg-white text-[var(--demo-ink)]"}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: STORY_EASE }}
    >
      {dark ? (
        <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-[var(--demo-glow)] blur-3xl" aria-hidden />
      ) : null}
      <div className="relative flex items-center gap-3">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${dark ? "bg-white/10 ring-1 ring-white/15" : "bg-[var(--demo-tint-1)]"}`}
        >
          <Icon className={`h-5 w-5 ${dark ? "text-[var(--demo-primary-light)]" : "text-[var(--demo-accent)]"}`} aria-hidden />
        </span>
        <p className="font-secondary text-[1.35rem] font-bold tracking-[-0.02em]">{title}</p>
      </div>
      <ul className="relative mt-7 space-y-3">
        {days.map((day) => (
          <li
            key={day.label}
            className={`rounded-[20px] p-4 ${dark ? "bg-white/[0.06] ring-1 ring-white/10" : "bg-[var(--demo-tint-3)]"}`}
          >
            <p
              className={`font-secondary text-[12px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-[var(--demo-primary-light)]" : "text-[var(--demo-accent)]"}`}
            >
              {day.label}
            </p>
            <p className="font-secondary mt-1 text-[16px] font-bold">{day.title}</p>
            <p className={`font-secondary mt-1 text-[14px] leading-relaxed ${dark ? "text-white/65" : "text-[var(--demo-muted)]"}`}>
              {day.desc}
            </p>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function HybridRhythmSection({ section }: { section: DemoHybridRhythmSection }) {
  return (
    <section id="signature" className={`scroll-mt-[88px] py-3 ${DEMO_GUTTER}`}>
      <div className={`${DEMO_BLOCK} bg-[var(--demo-tint-4)]`}>
        <SiteSectionHeader eyebrow={section.eyebrow} heading={section.heading} subtitle={section.subtitle} align="center" />
        {section.tagline ? (
          <p className="mt-6 text-center">
            <span className={DEMO_CHIP}>
              <Sparkles className="h-3.5 w-3.5 text-[var(--demo-accent)]" aria-hidden />
              {section.tagline}
            </span>
          </p>
        ) : null}

        <div className="mt-12 grid gap-3 @3xl/site:grid-cols-2">
          <DayColumn title="On campus" days={section.campusDays} icon={School} dark delay={0} />
          <DayColumn title="At home" days={section.homeDays} icon={Home} dark={false} delay={0.08} />
        </div>

        {section.serviceNote ? (
          <p className="font-secondary mx-auto mt-8 max-w-[640px] text-center text-[14px] leading-relaxed text-[var(--demo-muted)]">
            {section.serviceNote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
