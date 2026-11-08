"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { DemoNatureArtJoySection } from "@/data/school-demos/types";
import DemoIcon from "./DemoIcon";
import { DEMO_BODY, DEMO_CHIP, DEMO_CONTAINER, DEMO_H3, DEMO_INK, DEMO_TILE, DEMO_TINTS, STORY_EASE } from "./bright-demo-theme";
import SiteSectionHeader from "./sections/SiteSectionHeader";

export default function NatureArtJoySection({ section }: { section: DemoNatureArtJoySection }) {
  return (
    <section id="signature" className="scroll-mt-[88px] bg-white py-20 @3xl/site:py-28">
      <div className={DEMO_CONTAINER}>
        <SiteSectionHeader eyebrow={section.eyebrow} heading={section.heading} align="center" />

        <div className="mt-14 grid gap-3 @3xl/site:grid-cols-3">
          {section.pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              className={`${DEMO_TILE} relative flex min-h-[300px] flex-col overflow-hidden @3xl/site:p-9`}
              style={{ backgroundColor: DEMO_TINTS[i % DEMO_TINTS.length] }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: STORY_EASE }}
            >
              <DemoIcon
                name={pillar.icon}
                className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-[var(--demo-ink)]/[0.05]"
              />
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[var(--demo-shadow-card)]">
                <DemoIcon name={pillar.icon} className="h-6 w-6 text-[var(--demo-accent)]" />
              </span>
              <span className={`${DEMO_CHIP} mt-auto w-fit`}>{pillar.label}</span>
              <h3 className={`${DEMO_H3} ${DEMO_INK} mt-4 text-[1.45rem]`}>{pillar.title}</h3>
              <p className={`${DEMO_BODY} mt-2 text-[15px]`}>{pillar.desc}</p>
            </motion.div>
          ))}
        </div>

        {section.trustLine ? (
          <p className="font-secondary mx-auto mt-10 flex w-fit items-center gap-2 rounded-pill bg-[var(--demo-tint-3)] px-5 py-2.5 text-center text-[14px] font-medium text-[var(--demo-ink)]">
            <Check className="h-4 w-4 shrink-0 text-[var(--demo-accent)]" strokeWidth={3} aria-hidden />
            {section.trustLine}
          </p>
        ) : null}
      </div>
    </section>
  );
}
