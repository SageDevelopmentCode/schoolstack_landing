"use client";

import { useRef } from "react";
import Image from "next/image";
import { PAIN_COPY } from "@/components/home/home-copy";
import { PAIRS } from "@/components/sections/PainSection";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { gsap, useGSAP, MQ_MOTION } from "@/components/garden/gsap";
import { ScrubWords } from "@/components/garden/motion";
import { Pill, btnButter } from "@/components/garden/ui";
import type { Run } from "@/components/garden/types";
import { MUDKITCHEN_LOGO } from "../../assets";

const HL = "one shared system";
const [BEFORE, AFTER] = PAIN_COPY.body.split(HL);
const BODY_RUNS: Run[] = [{ text: BEFORE }, { text: HL, highlight: true }, { text: AFTER }];

/** Pain on a dark forest board: the tool logos fade out as the paragraph lights up word by word. */
export default function PainBoard() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        const st = { trigger: "[data-body]", start: "top 80%", end: "bottom 40%", scrub: true };
        gsap.fromTo("[data-logo]", { opacity: 1, filter: "grayscale(0)" }, { opacity: 0.18, filter: "grayscale(1)", stagger: 0.1, ease: "none", scrollTrigger: st });
        gsap.fromTo("[data-logo-strike]", { scaleX: 0 }, { scaleX: 1, stagger: 0.1, ease: "none", scrollTrigger: st });
        gsap.fromTo("[data-one]", { scale: 0.4, opacity: 0, rotate: -20 }, { scale: 1, opacity: 1, rotate: 0, ease: "back.out(2)", scrollTrigger: { ...st, start: "center 60%", end: "bottom 40%" } });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="px-3 py-10 lg:px-6">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[44px] bg-[var(--sf-forest)] px-6 py-20 text-[var(--sf-cream)] sm:px-10 lg:px-20 lg:py-28">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tint="ink">🧶 {PAIN_COPY.eyebrow}</Pill>
          <span className="sf-hand text-xl text-[var(--sf-butter)]">{PAIN_COPY.scatteredLabel.toLowerCase()} →</span>
        </div>
        <h2 className="sf-display mt-6 max-w-5xl text-5xl leading-[0.95] md:text-6xl xl:text-7xl">
          {PAIN_COPY.headlineLead} <span className="text-[var(--sf-butter)]">{PAIN_COPY.headlineAccent}</span>
        </h2>

        <ul className="mt-12 flex flex-wrap gap-3" aria-label="Tools schools often juggle">
          {PAIRS.map((p) => (
            <li key={p.tool} data-logo className="relative inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[var(--sf-ink)]">
              <Image src={p.logo} alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain" />
              {p.tool}
              <span data-logo-strike className="absolute inset-x-3 top-1/2 h-[2px] origin-left scale-x-0 bg-[var(--sf-clay)]" aria-hidden="true" />
            </li>
          ))}
          <li data-one className="inline-flex items-center gap-2 rounded-full bg-[var(--sf-butter)] px-4 py-2 text-sm font-extrabold text-[var(--sf-ink)] shadow-[0_4px_0_0_#d9b94a]">
            <Image src={MUDKITCHEN_LOGO} alt="" width={20} height={20} className="h-5 w-5" />
            {PAIN_COPY.unifiedLabel}
          </li>
        </ul>

        <div data-body className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <ScrubWords
            runs={BODY_RUNS}
            className="text-2xl font-semibold leading-[1.45] text-[var(--sf-cream)] md:text-[2rem]"
            highlightClassName="text-[var(--sf-butter)] underline decoration-[var(--sf-butter)]/50 decoration-4 underline-offset-8"
            dimOpacity={0.2}
          />
          <div className="lg:text-right">
            <a href={BOOK_DEMO_HASH_HREF} className={btnButter}>
              {PAIN_COPY.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
