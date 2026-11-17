"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock } from "lucide-react";
import { Tape } from "@/components/garden/ui";
import RotateProgressBar from "@/components/home/RotateProgressBar";
import { useAutoRotate } from "@/components/home/useAutoRotate";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import { SITE_CONTAINER, SITE_EASE, SITE_EYEBROW, SITE_SECTION } from "../site-garden-theme";
import { SiteSectionIntro } from "../garden/SiteKit";

type Props = { timeline: SchoolWebsiteDemoConfig["timeline"] };

/** "A day at school": a taped photo that changes with each step on a dashed timeline of tickets. */
export default function SiteDayTimeline({ timeline }: Props) {
  const { index, select, running, intervalMs } = useAutoRotate(timeline.steps.length, 5500);
  const reduce = useReducedMotion();
  const step = timeline.steps[index];
  if (!step) return null;

  return (
    <section id="timeline" className={`scroll-mt-[88px] bg-[var(--sf-sky)]/50 ${SITE_SECTION}`}>
      <div
        className={`${SITE_CONTAINER} grid items-start gap-12 @5xl/site:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] @5xl/site:gap-16`}
      >
        <div className="relative @5xl/site:sticky @5xl/site:top-28">
          <div
            className="relative rounded-[30px] border-2 border-[var(--sf-ink)] bg-white p-2.5 shadow-[0_8px_0_0_var(--sf-ink)]"
            style={{ rotate: "-1.2deg" }}
          >
            <Tape color="var(--sf-butter)" className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2" />
            <div className="relative h-[320px] overflow-hidden rounded-[22px] bg-[var(--sf-cream)] @3xl/site:h-[500px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={step.image + index}
                  className="absolute inset-0"
                  initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: SITE_EASE }}
                >
                  <Image
                    src={step.image}
                    fill
                    sizes="(min-width: 1024px) 560px, 90vw"
                    className="object-cover"
                    alt={step.activity}
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                <p className="sf-display text-[clamp(1.4rem,2.2cqw,1.9rem)] leading-[1.02] text-white">{step.activity}</p>
                <span className="shrink-0 text-[13px] font-extrabold text-white/85">
                  {String(index + 1).padStart(2, "0")} / {String(timeline.steps.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
          <div
            className="absolute -left-2 -top-4 flex items-center gap-2 rounded-md bg-[var(--sf-butter)] px-3.5 py-2 shadow-[0_10px_20px_-12px_rgba(43,36,29,0.6)]"
            style={{ rotate: "-5deg" }}
          >
            <Clock className="h-4 w-4 text-[var(--sf-ink)]" strokeWidth={2.6} aria-hidden />
            <span className="text-[15px] font-extrabold text-[var(--sf-ink)]">{step.time}</span>
          </div>
        </div>

        <div>
          {/* A heading ending in a comma continues into headingSub, so show it as the accent line. */}
          {timeline.heading.trim().endsWith(",") ? (
            <SiteSectionIntro eyebrow={timeline.eyebrow} heading={timeline.heading} accent={timeline.headingSub} />
          ) : (
            <SiteSectionIntro eyebrow={timeline.eyebrow} heading={timeline.heading} subtitle={timeline.headingSub} />
          )}
          <ol className="relative mt-10 space-y-3 before:absolute before:bottom-6 before:left-[35px] before:top-6 before:border-l-2 before:border-dashed before:border-[var(--sf-ink)]/25">
            {timeline.steps.map((s, i) => {
              const isActive = i === index;
              return (
                <li key={`${s.time}-${s.activity}`} className="relative">
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-current={isActive ? "step" : undefined}
                    aria-expanded={isActive}
                    className={`w-full cursor-pointer rounded-[22px] border-2 p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 ${
                      isActive
                        ? "border-[var(--sf-ink)] bg-white shadow-[0_5px_0_0_var(--sf-ink)]"
                        : "border-transparent hover:border-[var(--sf-ink)]/20 hover:bg-white/60"
                    }`}
                  >
                    <span className="flex items-start gap-4">
                      <span
                        className={`sf-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] text-[0.95rem] transition-colors duration-300 ${
                          isActive ? "bg-[var(--sf-clay)] text-[var(--sf-on-clay)]" : "bg-white text-[var(--sf-ink)]"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`${SITE_EYEBROW} block`}>{s.time}</span>
                        <span
                          className={`mt-1 block text-[17px] font-extrabold transition-colors duration-300 ${
                            isActive ? "text-[var(--sf-ink)]" : "text-[var(--sf-ink)]/65"
                          }`}
                        >
                          {s.activity}
                        </span>
                        <AnimatePresence initial={false}>
                          {isActive ? (
                            <motion.span
                              className="block overflow-hidden"
                              initial={reduce ? false : { height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: SITE_EASE }}
                            >
                              <span className="block pt-2 text-[15px] leading-relaxed text-[var(--sf-soft)]">{s.desc}</span>
                              <span className="mt-4 block text-[var(--sf-ink)]">
                                <RotateProgressBar
                                  cycleKey={index}
                                  running={running}
                                  durationMs={intervalMs}
                                  color="var(--sf-clay)"
                                />
                              </span>
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
