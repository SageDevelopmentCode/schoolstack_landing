"use client";

import { motion } from "framer-motion";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoIcon from "../DemoIcon";
import { DEMO_BODY, DEMO_CONTAINER, DEMO_H3, DEMO_INK, DEMO_TILE, DEMO_TINTS, STORY_EASE } from "../bright-demo-theme";
import SiteSectionHeader from "./SiteSectionHeader";

/** Tinted bento tiles for the four core pillars. */
export default function SitePillars({ pillars }: { pillars: SchoolWebsiteDemoConfig["pillars"] }) {
  if (pillars.items.length === 0) return null;

  return (
    <section className="bg-white py-20 @3xl/site:py-28">
      <div className={DEMO_CONTAINER}>
        <SiteSectionHeader align="split" eyebrow={pillars.eyebrow} heading={pillars.heading} subtitle={pillars.subtitle} />
        <div className="mt-12 grid grid-cols-1 gap-4 @3xl/site:grid-cols-2 @5xl/site:grid-cols-4">
          {pillars.items.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              className={`${DEMO_TILE} flex min-h-[260px] flex-col justify-between`}
              style={{ backgroundColor: DEMO_TINTS[i % DEMO_TINTS.length] }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: STORY_EASE }}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--demo-accent)] shadow-sm" aria-hidden>
                  <DemoIcon name={pillar.icon} className="h-6 w-6" />
                </span>
                <span className="font-secondary text-[13px] font-semibold text-[var(--demo-muted)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-10">
                <h3 className={`${DEMO_H3} ${DEMO_INK}`}>{pillar.title}</h3>
                <p className={`${DEMO_BODY} mt-2 text-[15px]`}>{pillar.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
