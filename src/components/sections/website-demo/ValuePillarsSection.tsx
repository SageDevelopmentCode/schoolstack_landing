"use client";

import { motion } from "framer-motion";
import type { DemoValuePillarsSection } from "@/data/school-demos/types";
import DemoIcon from "./DemoIcon";
import { DEMO_BODY, DEMO_CONTAINER, DEMO_H3, DEMO_TILE, DEMO_TINTS, STORY_EASE } from "./bright-demo-theme";
import SiteSectionHeader from "./sections/SiteSectionHeader";

const GRID_COLS: Record<number, string> = {
  2: "@3xl/site:grid-cols-2",
  3: "@3xl/site:grid-cols-3",
  4: "@3xl/site:grid-cols-2 @5xl/site:grid-cols-4",
  5: "@3xl/site:grid-cols-6",
  6: "@3xl/site:grid-cols-3",
};

/** Five pillars: a 3 + 2 layout on a six-column grid so both rows fill. */
function tileSpan(i: number, count: number) {
  if (count !== 5) return "";
  return i < 3 ? "@3xl/site:col-span-2" : "@3xl/site:col-span-3";
}

export default function ValuePillarsSection({ section }: { section: DemoValuePillarsSection }) {
  const count = section.pillars.length;

  return (
    <section id="signature" className="scroll-mt-[88px] bg-white py-20 @3xl/site:py-28">
      <div className={DEMO_CONTAINER}>
        <SiteSectionHeader eyebrow={section.eyebrow} heading={section.heading} subtitle={section.tagline} align="split" />

        <div className={`mt-12 grid gap-3 ${GRID_COLS[count] ?? "@3xl/site:grid-cols-3"}`}>
          {section.pillars.map((pillar, i) => {
            const featured = i === 0;
            return (
              <motion.div
                key={pillar.title}
                className={`${DEMO_TILE} relative flex min-h-[240px] flex-col overflow-hidden ${tileSpan(i, count)} ${featured ? "bg-[var(--demo-ink)] text-white" : ""}`}
                style={featured ? undefined : { backgroundColor: DEMO_TINTS[i % DEMO_TINTS.length] }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: STORY_EASE }}
              >
                {featured ? (
                  <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[var(--demo-glow)] blur-3xl" aria-hidden />
                ) : null}
                <span
                  className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ${featured ? "bg-white/10 ring-1 ring-white/15" : "bg-white"}`}
                >
                  <DemoIcon
                    name={pillar.icon}
                    className={`h-5 w-5 ${featured ? "text-[var(--demo-primary-light)]" : "text-[var(--demo-accent)]"}`}
                  />
                </span>
                <h3 className={`${DEMO_H3} relative mt-auto pt-8 ${featured ? "text-white" : "text-[var(--demo-ink)]"}`}>
                  {pillar.title}
                </h3>
                <p className={`${DEMO_BODY} relative mt-2 text-[15px] ${featured ? "text-white/70!" : ""}`}>{pillar.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
