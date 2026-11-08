"use client";

import { motion } from "framer-motion";
import { Compass, GraduationCap, Leaf, Sparkles, type LucideIcon } from "lucide-react";
import type { DemoStat } from "@/data/school-demos/types";
import { DEMO_GUTTER, STORY_EASE } from "../bright-demo-theme";

const STAT_ICONS: LucideIcon[] = [Sparkles, GraduationCap, Leaf, Compass];

/** Ink stats band that overlaps the bottom of the hero. */
export default function SiteStats({ stats }: { stats: DemoStat[] }) {
  return (
    <section className={`relative z-10 -mt-20 ${DEMO_GUTTER}`}>
      <motion.div
        className="relative mx-auto grid max-w-[1180px] grid-cols-2 overflow-hidden rounded-[32px] bg-[var(--demo-ink-band)] px-3 py-6 shadow-[var(--demo-shadow-float)] @3xl/site:grid-cols-4 @3xl/site:px-4 @3xl/site:py-8"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: STORY_EASE }}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--demo-glow)] blur-3xl"
          aria-hidden
        />
        {stats.map((stat, i) => {
          const Icon = STAT_ICONS[i % STAT_ICONS.length];
          return (
            <div
              key={`${stat.value}-${stat.label}`}
              className={`relative flex flex-col gap-3 px-4 py-4 @3xl/site:px-7 ${
                i > 0 ? "@3xl/site:border-l @3xl/site:border-white/10" : ""
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white" aria-hidden>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="font-secondary block text-[clamp(1.5rem,2.6cqw,2.25rem)] font-bold leading-none tracking-[-0.04em] text-white">
                {stat.value}
              </span>
              <span className="font-secondary block text-[12px] font-semibold uppercase tracking-wider text-white/60">
                {stat.label}
              </span>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
