"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HOME_FAQ } from "@/lib/faq";
import { Pill, Draw, Squiggle } from "@/components/garden/ui";
import { Reveal, WordsReveal } from "@/components/garden/motion";

const FAQ_COPY = {
  eyebrow: "FAQ",
  heading: "Questions from microschool founders",
  sub: "Answers for school owners and administrators evaluating software for enrollment, billing, and daily operations.",
} as const;

const TINTS = ["bg-[var(--sf-butter)]", "bg-[var(--sf-mint)]", "bg-[var(--sf-sky)]", "bg-[var(--sf-lav)]", "bg-[var(--sf-peach)]"];

/** Home FAQ as a stack of index cards. Same questions as the live page (and FaqJsonLd). */
export default function GardenFaq({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className={`py-24 lg:py-32 ${className}`}>
      <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Pill tint="lav">💬 {FAQ_COPY.eyebrow}</Pill>
          <WordsReveal text={FAQ_COPY.heading} className="sf-display mt-5 text-5xl leading-[0.95] md:text-6xl" />
          <Draw className="mt-3 block w-48">
            <Squiggle color="var(--sf-lav)" className="w-full" />
          </Draw>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--sf-soft)]">{FAQ_COPY.sub}</p>
        </div>
        <Reveal className="space-y-4" stagger={0.08} y={30}>
          {HOME_FAQ.map((f, i) => {
            const isOpen = open === i;
            const panelId = `garden-faq-${i}`;
            return (
              <div
                key={f.question}
                className={`rounded-[26px] border-2 border-[var(--sf-ink)] transition-[background-color,box-shadow,translate] duration-300 ${
                  isOpen ? `${TINTS[i % TINTS.length]} shadow-[0_6px_0_0_var(--sf-ink)]` : "bg-white shadow-[0_3px_0_0_var(--sf-ink)] hover:-translate-y-0.5"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full cursor-pointer items-center justify-between gap-6 rounded-[24px] px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
                  >
                    <span className="text-lg font-extrabold leading-snug text-[var(--sf-ink)]">{f.question}</span>
                    <span
                      aria-hidden="true"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-white transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? "rotate-45" : ""}`}
                    >
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M8 2v12M2 8h12" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 pr-14 leading-relaxed text-[var(--sf-ink)]/80">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
