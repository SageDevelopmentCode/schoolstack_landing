"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { DemoFarmExperienceSection } from "@/data/school-demos/types";
import DemoIcon from "./DemoIcon";
import { DEMO_BLOCK, DEMO_BODY, DEMO_GUTTER, DEMO_H3, DEMO_TINTS, STORY_EASE } from "./bright-demo-theme";
import SiteSectionHeader from "./sections/SiteSectionHeader";

const GRID_COLS: Record<number, string> = {
  2: "@3xl/site:grid-cols-2",
  3: "@3xl/site:grid-cols-3",
  4: "@3xl/site:grid-cols-2 @5xl/site:grid-cols-4",
};

export default function FarmExperienceSection({ section }: { section: DemoFarmExperienceSection }) {
  const count = section.paths.length;

  return (
    <section id="signature" className={`scroll-mt-[88px] py-3 ${DEMO_GUTTER}`}>
      <div className={`${DEMO_BLOCK} bg-[var(--demo-tint-3)]`}>
        <SiteSectionHeader eyebrow={section.eyebrow} heading={section.heading} subtitle={section.subtitle} align="split" />

        <div className={`mt-12 grid gap-3 ${GRID_COLS[count] ?? "@3xl/site:grid-cols-3"}`}>
          {section.paths.map((path, i) => (
            <motion.article
              key={path.title}
              className="group overflow-hidden rounded-[28px] bg-white ring-1 ring-black/[0.04] transition-transform duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: STORY_EASE }}
            >
              <div
                className="relative m-2 h-52 overflow-hidden rounded-[22px]"
                style={{ backgroundColor: DEMO_TINTS[i % DEMO_TINTS.length] }}
              >
                {path.image ? (
                  <Image
                    src={path.image}
                    fill
                    sizes="420px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    alt=""
                  />
                ) : (
                  <DemoIcon
                    name={path.icon}
                    className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-[var(--demo-accent)]/40"
                  />
                )}
                <span className="absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[var(--demo-shadow-card)]">
                  <DemoIcon name={path.icon} className="h-5 w-5 text-[var(--demo-accent)]" />
                </span>
              </div>
              <div className="px-6 pb-7 pt-4">
                <h3 className={`${DEMO_H3} text-[var(--demo-ink)]`}>{path.title}</h3>
                <p className={`${DEMO_BODY} mt-2 text-[15px]`}>{path.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
