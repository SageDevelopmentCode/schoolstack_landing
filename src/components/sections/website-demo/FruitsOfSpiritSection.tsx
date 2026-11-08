"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import type { DemoFruitsOfSpiritSection } from "@/data/school-demos/types";
import { DEMO_BLOCK, DEMO_BODY, DEMO_GUTTER, DEMO_INK, STORY_EASE } from "./bright-demo-theme";
import SiteSectionHeader from "./sections/SiteSectionHeader";

export default function FruitsOfSpiritSection({ section }: { section: DemoFruitsOfSpiritSection }) {
  return (
    <section id="signature" className={`scroll-mt-[88px] py-3 ${DEMO_GUTTER}`}>
      <div className={`${DEMO_BLOCK} bg-[var(--demo-tint-1)]`}>
        <div className="grid gap-10 @5xl/site:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] @5xl/site:gap-14">
          <div className="@5xl/site:sticky @5xl/site:top-28 @5xl/site:self-start">
            <SiteSectionHeader eyebrow={section.eyebrow} heading={section.heading} subtitle={section.intro} />
            {section.quote ? (
              <div className="relative mt-8 overflow-hidden rounded-[28px] bg-[var(--demo-ink)] p-7 text-white">
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--demo-glow)] blur-2xl" aria-hidden />
                <Quote className="relative h-7 w-7 text-[var(--demo-primary-light)]" aria-hidden />
                <p className="font-secondary relative mt-4 text-[17px] font-medium italic leading-relaxed text-white/90">
                  {section.quote}
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 @2xl/site:grid-cols-2 @5xl/site:grid-cols-3">
            {section.fruits.map((fruit, i) => (
              <motion.div
                key={fruit.name}
                className="group rounded-[24px] bg-white p-5 ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--demo-shadow-card)]"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.04, ease: STORY_EASE }}
              >
                <span className="font-secondary flex h-9 w-9 items-center justify-center rounded-full bg-[var(--demo-tint-1)] text-[13px] font-bold text-[var(--demo-accent)] transition-colors group-hover:bg-[var(--demo-ink)] group-hover:text-white">
                  {i + 1}
                </span>
                <p className={`font-secondary mt-4 text-[17px] font-bold ${DEMO_INK}`}>{fruit.name}</p>
                <p className={`${DEMO_BODY} mt-1 text-[14px]`}>{fruit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
