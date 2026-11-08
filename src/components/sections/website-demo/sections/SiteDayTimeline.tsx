"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Clock } from "lucide-react";
import RotateProgressBar from "@/components/home/RotateProgressBar";
import { useAutoRotate } from "@/components/home/useAutoRotate";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import { DEMO_BLOCK, DEMO_GUTTER, DEMO_STICKER, STORY_EASE } from "../bright-demo-theme";
import SiteSectionHeader from "./SiteSectionHeader";

type Props = { timeline: SchoolWebsiteDemoConfig["timeline"] };

/** Sticky crossfading photo plus an auto-advancing step rail. */
export default function SiteDayTimeline({ timeline }: Props) {
  const { index, select, running, intervalMs } = useAutoRotate(timeline.steps.length, 5500);
  const step = timeline.steps[index];
  if (!step) return null;

  return (
    <section id="timeline" className={`scroll-mt-[88px] py-3 ${DEMO_GUTTER}`}>
      <div className={`${DEMO_BLOCK} bg-[var(--demo-tint-3)]`}>
        <div className="grid items-start gap-10 @5xl/site:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] @5xl/site:gap-16">
          <div className="relative @5xl/site:sticky @5xl/site:top-28">
            <div className="relative h-[320px] overflow-hidden rounded-[32px] shadow-[var(--demo-shadow-float)] @3xl/site:h-[520px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={step.image + index}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: STORY_EASE }}
                >
                  <Image src={step.image} fill sizes="(min-width: 1024px) 560px, 90vw" className="object-cover" alt={step.activity} />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className={`${DEMO_STICKER} absolute left-5 top-5 flex items-center gap-2`}>
                <Clock className="h-4 w-4 text-[var(--demo-accent)]" aria-hidden />
                <span className="font-secondary text-[14px] font-bold text-[var(--demo-ink)]">{step.time}</span>
              </div>
              <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4">
                <p className="font-secondary text-[clamp(1.2rem,2cqw,1.6rem)] font-bold leading-tight tracking-[-0.02em] text-white">
                  {step.activity}
                </p>
                <span className="font-secondary shrink-0 text-[13px] font-semibold text-white/75">
                  {String(index + 1).padStart(2, "0")} / {String(timeline.steps.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          <div>
            <SiteSectionHeader eyebrow={timeline.eyebrow} heading={timeline.heading} subtitle={timeline.headingSub} />
            <ol className="mt-10 space-y-2.5">
              {timeline.steps.map((s, i) => {
                const isActive = i === index;
                return (
                  <li key={`${s.time}-${s.activity}`}>
                    <button
                      type="button"
                      onClick={() => select(i)}
                      aria-current={isActive ? "step" : undefined}
                      className={`w-full cursor-pointer rounded-[24px] p-5 text-left transition-all duration-300 ${
                        isActive ? "bg-white shadow-[var(--demo-shadow-card)] ring-1 ring-black/[0.05]" : "hover:bg-white/60"
                      }`}
                    >
                      <span className="flex items-start gap-4">
                        <span
                          className={`font-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold transition-colors duration-300 ${
                            isActive ? "bg-[var(--demo-ink)] text-white" : "bg-white text-[var(--demo-muted)] ring-1 ring-black/[0.06]"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="font-secondary block text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--demo-accent)]">
                            {s.time}
                          </span>
                          <span
                            className={`font-secondary mt-1 block text-[17px] font-bold tracking-[-0.01em] transition-colors duration-300 ${
                              isActive ? "text-[var(--demo-ink)]" : "text-[var(--demo-ink)]/60"
                            }`}
                          >
                            {s.activity}
                          </span>
                          <AnimatePresence initial={false}>
                            {isActive ? (
                              <motion.span
                                className="block overflow-hidden"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.35, ease: STORY_EASE }}
                              >
                                <span className="font-secondary block pt-2 text-[15px] leading-relaxed text-[var(--demo-muted)]">
                                  {s.desc}
                                </span>
                                <span className="mt-4 block text-[var(--demo-primary)]">
                                  <RotateProgressBar
                                    cycleKey={index}
                                    running={running}
                                    durationMs={intervalMs}
                                    color="var(--demo-primary)"
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
      </div>
    </section>
  );
}
