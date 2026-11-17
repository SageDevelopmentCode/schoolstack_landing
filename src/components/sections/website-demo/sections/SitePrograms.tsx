"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "../DemoWebsiteButton";
import {
  SITE_CONTAINER,
  SITE_EASE,
  SITE_EYEBROW,
  SITE_LEAD,
  SITE_SECTION,
  SITE_TINT_BG,
} from "../site-garden-theme";
import { SiteSectionIntro } from "../garden/SiteKit";

type Props = {
  programs: SchoolWebsiteDemoConfig["programs"];
  onCtaClick: () => void;
};

/** Expanding photo cards (ink-bordered, toy shadow) driving a paper detail card. */
export default function SitePrograms({ programs, onCtaClick }: Props) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const baseId = useId();
  const program = programs.items[active] ?? programs.items[0];
  if (!program) return null;

  const panelId = `${baseId}-panel`;
  const tabId = (i: number) => `${baseId}-tab-${i}`;

  return (
    <section id="programs" className={`scroll-mt-[88px] bg-[var(--sf-paper)] ${SITE_SECTION}`}>
      <div className={SITE_CONTAINER}>
        <SiteSectionIntro align="split" eyebrow={programs.eyebrow} heading={programs.heading} subtitle={programs.subtitle} />

        <div
          className="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 pt-1 [scroll-padding-inline:1.25rem] [scrollbar-width:none] @5xl/site:mx-0 @5xl/site:overflow-visible @5xl/site:px-0"
          role="tablist"
          aria-label={programs.heading}
        >
          {programs.items.map((p, i) => {
            const isActive = i === active;
            return (
              <motion.button
                key={p.title}
                id={tabId(i)}
                layout={!reduce}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  e.preventDefault();
                  const next = (i + (e.key === "ArrowRight" ? 1 : -1) + programs.items.length) % programs.items.length;
                  setActive(next);
                  document.getElementById(tabId(next))?.focus();
                }}
                transition={{ layout: { duration: 0.5, ease: SITE_EASE } }}
                className={`group relative flex h-[340px] w-[78%] shrink-0 cursor-pointer snap-start flex-col justify-between overflow-hidden rounded-[26px] border-2 border-[var(--sf-ink)] p-5 text-left transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/40 @3xl/site:h-[400px] @3xl/site:w-[46%] @5xl/site:w-auto @5xl/site:shrink ${
                  isActive
                    ? "shadow-[0_8px_0_0_var(--sf-ink)] @5xl/site:flex-[1.9]"
                    : "shadow-[0_4px_0_0_var(--sf-ink)] hover:shadow-[0_6px_0_0_var(--sf-ink)] @5xl/site:flex-1"
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
                  <span
                    className={`rounded-full border-2 border-[var(--sf-ink)] px-3 py-1 text-[12px] font-extrabold text-[var(--sf-ink)] ${SITE_TINT_BG[i % SITE_TINT_BG.length]}`}
                  >
                    {p.badge}
                  </span>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-white text-[var(--sf-ink)] transition-transform duration-300 group-hover:rotate-45"
                    aria-hidden
                  >
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.6} />
                  </span>
                </span>
                <span className="relative">
                  <motion.span
                    layout={reduce ? false : "position"}
                    className="sf-display block text-[clamp(1.5rem,2.2cqw,2rem)] leading-[1.02] text-white"
                  >
                    {p.title}
                  </motion.span>
                  <span
                    className={`mt-2 block max-w-[420px] text-[14px] font-semibold leading-snug text-white/85 transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {p.teaser}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>

        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={tabId(active)}
          className="sf-paper mt-6 overflow-hidden rounded-[26px] border-2 border-[var(--sf-ink)] p-6 shadow-[0_6px_0_0_var(--sf-ink)] @3xl/site:p-10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={program.title}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: SITE_EASE }}
              className="grid gap-8 @5xl/site:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] @5xl/site:gap-14"
            >
              <div>
                <p className={SITE_EYEBROW}>{program.badge}</p>
                <h3 className="sf-display mt-3 text-[clamp(1.8rem,2.8cqw,2.5rem)] leading-[1] text-[var(--sf-ink)]">
                  {program.title}
                </h3>
                <p className={`${SITE_LEAD} mt-4`}>{program.desc}</p>
                <DemoWebsiteButton variant="primary" className="mt-8" onClick={onCtaClick}>
                  {programs.ctaLabel}
                  <ArrowRight className="h-4 w-4" strokeWidth={2.6} aria-hidden />
                </DemoWebsiteButton>
              </div>
              <ul className="grid content-start gap-3">
                {program.details.map((d) => (
                  <li
                    key={d}
                    className="flex items-start gap-3 rounded-2xl border-2 border-[var(--sf-ink)] bg-white px-4 py-3 text-[15px] font-bold leading-snug text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)]"
                  >
                    <Tick className="h-5 w-5" color="var(--sf-clay)" fill="var(--sf-butter)" />
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
