"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Tape, Tick } from "@/components/garden/ui";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { MUDKITCHEN_LOGO } from "@/components/home-garden/assets";
import { BEFORE_AFTER_COPY, WITH, WITHOUT } from "./sagefield-copy";

const NOTE_TINTS = ["bg-[var(--sf-butter)]", "bg-[var(--sf-peach)]", "bg-[var(--sf-lav)]", "bg-[var(--sf-sky)]", "bg-[var(--sf-butter)]"] as const;
const NOTE_TILTS = [-3, 2.5, -1.5, 3, -2];

/**
 * Before & after: "without" is a scatter of sticky notes with the tool labels
 * struck through; "with" is one tidy notebook page of ticks.
 */
export default function SagefieldGardenBeforeAfter() {
  const [showWith, setShowWith] = useState(false);
  const [toggled, setToggled] = useState(false);
  const reduce = useReducedMotion();
  const animate = toggled && !reduce;

  const pick = (next: boolean) => {
    setShowWith(next);
    setToggled(true);
  };

  const toggleBtn = (on: boolean) =>
    `relative flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 sm:flex-none sm:px-6 ${
      on ? "text-[var(--sf-ink)]" : "text-[var(--sf-soft)] hover:text-[var(--sf-ink)]"
    }`;

  return (
    <section className="relative overflow-hidden bg-[var(--sf-cream)] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          pill={`🔁 ${BEFORE_AFTER_COPY.eyebrow}`}
          tint="lav"
          lead={BEFORE_AFTER_COPY.headlineLead}
          accent={BEFORE_AFTER_COPY.headlineAccent}
          squiggle="var(--sf-lav)"
          align="left"
          headingClassName="text-5xl md:text-6xl"
          body={<p>{BEFORE_AFTER_COPY.body}</p>}
        />

        <div className="mt-12 flex w-full rounded-full border-2 border-[var(--sf-ink)] bg-white p-1.5 shadow-[0_4px_0_0_var(--sf-ink)] sm:inline-flex sm:w-auto">
          <button type="button" aria-pressed={!showWith} onClick={() => pick(false)} className={toggleBtn(!showWith)}>
            {!showWith ? (
              <motion.span layoutId="sf-ba-pill" className="absolute inset-0 rounded-full bg-[var(--sf-peach)]" transition={{ type: "spring", stiffness: 420, damping: 32 }} />
            ) : null}
            <span className="relative">
              <span className="sm:hidden">{BEFORE_AFTER_COPY.withoutLabelShort}</span>
              <span className="hidden sm:inline">{BEFORE_AFTER_COPY.withoutLabel}</span>
            </span>
          </button>
          <button type="button" aria-pressed={showWith} onClick={() => pick(true)} className={toggleBtn(showWith)}>
            {showWith ? (
              <motion.span layoutId="sf-ba-pill" className="absolute inset-0 rounded-full bg-[var(--sf-mint)]" transition={{ type: "spring", stiffness: 420, damping: 32 }} />
            ) : null}
            <span className="relative inline-flex items-center gap-2">
              <Image src={MUDKITCHEN_LOGO} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
              {BEFORE_AFTER_COPY.withLabel}
            </span>
          </button>
        </div>

        <div className="mt-12" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {showWith ? (
              <motion.div
                key="with"
                initial={reduce ? false : { opacity: 0, y: 30, rotate: 1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="sf-paper relative mx-auto max-w-4xl rounded-[30px] border-2 border-[var(--sf-ink)] p-7 shadow-[0_10px_0_0_var(--sf-ink)] sm:p-10"
              >
                <Tape color="var(--sf-mint)" className="-top-3 left-12 w-24 -rotate-6" />
                <p className="sr-only">{BEFORE_AFTER_COPY.withLabel}</p>
                <ul className="divide-y-2 divide-dashed divide-[var(--sf-ink)]/10">
                  {WITH.map((item, i) => (
                    <motion.li
                      key={item.label}
                      initial={animate ? { opacity: 0, x: -12 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <Tick className="mt-0.5 h-7 w-7" fill="var(--sf-mint)" />
                      <span>
                        <span className="block text-lg font-extrabold text-[var(--sf-ink)]">{item.label}</span>
                        <span className="mt-1 block leading-relaxed text-[var(--sf-ink)]/75">{item.detail}</span>
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <motion.ul
                key="without"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                aria-label={BEFORE_AFTER_COPY.withoutLabel}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {WITHOUT.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={animate ? { opacity: 0, y: -40, rotate: NOTE_TILTS[i] * 3 } : false}
                    animate={{ opacity: 1, y: 0, rotate: NOTE_TILTS[i] }}
                    transition={{ type: "spring", stiffness: 300, damping: 16, delay: i * 0.06 }}
                    className={`relative rounded-md p-5 pt-6 shadow-[0_14px_30px_-16px_rgba(43,36,29,0.5)] ${NOTE_TINTS[i]}`}
                  >
                    <Tape color="rgba(255,255,255,0.7)" className="-top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 rotate-2" />
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[var(--sf-clay-deep)] ring-2 ring-[var(--sf-ink)]">
                        <X size={13} strokeWidth={3} aria-hidden />
                      </span>
                      <span className="relative font-extrabold text-[var(--sf-ink)]">
                        {item.label}
                        <motion.span
                          aria-hidden="true"
                          className="absolute left-[-2%] top-1/2 h-[3px] w-[104%] origin-left rounded-full bg-[var(--sf-clay)]"
                          initial={animate ? { scaleX: 0 } : false}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.35 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </span>
                    </span>
                    <span className="mt-3 block text-[15px] leading-relaxed text-[var(--sf-ink)]/80">{item.detail}</span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
