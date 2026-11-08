"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "../DemoWebsiteButton";
import { DEMO_BODY, DEMO_CONTAINER, DEMO_HEADING, DEMO_INK, STORY_EASE } from "../bright-demo-theme";
import SiteSectionHeader from "./SiteSectionHeader";

type Props = {
  programs: SchoolWebsiteDemoConfig["programs"];
  onCtaClick: () => void;
};

/** Expanding photo cards (like the home BrightPersonas) with a detail panel. */
export default function SitePrograms({ programs, onCtaClick }: Props) {
  const [active, setActive] = useState(0);
  const program = programs.items[active] ?? programs.items[0];
  if (!program) return null;

  return (
    <section id="programs" className="scroll-mt-[88px] bg-white py-20 @3xl/site:py-28">
      <div className={DEMO_CONTAINER}>
        <SiteSectionHeader
          align="split"
          eyebrow={programs.eyebrow}
          heading={programs.heading}
          subtitle={programs.subtitle}
        />

        <div
          className="-mx-5 mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] @5xl/site:mx-0 @5xl/site:overflow-visible @5xl/site:px-0 @5xl/site:pb-0"
          role="tablist"
          aria-label={programs.heading}
        >
          {programs.items.map((p, i) => {
            const isActive = i === active;
            return (
              <motion.button
                key={p.title}
                layout
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(i)}
                transition={{ layout: { duration: 0.5, ease: STORY_EASE } }}
                className={`group relative flex h-[340px] w-[78%] shrink-0 cursor-pointer snap-start flex-col justify-between overflow-hidden rounded-[30px] p-6 text-left ring-1 ring-black/[0.06] @3xl/site:h-[400px] @3xl/site:w-[46%] @5xl/site:w-auto @5xl/site:shrink ${
                  isActive ? "@5xl/site:flex-[1.9]" : "@5xl/site:flex-1"
                }`}
              >
                <Image
                  src={p.image}
                  fill
                  sizes="(min-width: 1024px) 640px, 80vw"
                  className={`object-cover transition-transform duration-700 ${isActive ? "scale-100" : "scale-105 group-hover:scale-100"}`}
                  alt=""
                />
                <span
                  className={`absolute inset-0 transition-colors duration-500 ${
                    isActive
                      ? "bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                      : "bg-gradient-to-t from-black/75 via-black/35 to-black/10"
                  }`}
                  aria-hidden
                />
                <span className="relative flex items-center justify-between">
                  <span className={`font-secondary rounded-pill px-3 py-1.5 text-[12px] font-bold ${p.accentBg} ${p.accent}`}>
                    {p.badge}
                  </span>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45 ${
                      isActive ? "bg-white text-[var(--demo-ink)]" : "bg-white/20 text-white backdrop-blur-sm"
                    }`}
                    aria-hidden
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </span>
                <span className="relative">
                  <motion.span
                    layout="position"
                    className="font-secondary block text-[clamp(1.3rem,2cqw,1.75rem)] font-bold leading-[1.1] tracking-[-0.03em] text-white"
                  >
                    {p.title}
                  </motion.span>
                  <span
                    className={`font-secondary mt-2 block max-w-[420px] text-[14px] leading-snug text-white/80 transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0 @5xl/site:opacity-0"
                    }`}
                  >
                    {p.teaser}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 overflow-hidden rounded-[32px] bg-[var(--demo-tint-1)] p-6 @3xl/site:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: STORY_EASE }}
              className="grid gap-8 @5xl/site:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] @5xl/site:gap-14"
            >
              <div>
                <p className="font-secondary text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--demo-accent)]">
                  {program.badge}
                </p>
                <h3 className={`${DEMO_HEADING} ${DEMO_INK} mt-3 text-[clamp(1.6rem,2.6cqw,2.25rem)]`}>{program.title}</h3>
                <p className={`${DEMO_BODY} mt-4 text-[17px]`}>{program.desc}</p>
                <DemoWebsiteButton variant="primary" className="mt-8" onClick={onCtaClick}>
                  {programs.ctaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </DemoWebsiteButton>
              </div>
              <ul className="grid content-start gap-2.5">
                {program.details.map((d) => (
                  <li
                    key={d}
                    className="font-secondary flex items-start gap-3 rounded-[20px] bg-white px-4 py-3.5 text-[15px] font-medium leading-snug text-[var(--demo-ink)] ring-1 ring-black/[0.04]"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--demo-ink)] text-white" aria-hidden>
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
