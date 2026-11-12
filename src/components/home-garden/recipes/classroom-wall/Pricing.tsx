"use client";

import { useRef } from "react";
import { PRICING_COPY } from "@/components/home/home-copy";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { gsap, useGSAP, MQ_MOTION } from "@/components/garden/gsap";
import { Magnetic, Reveal } from "@/components/garden/motion";
import { Draw, Pill, Star, Tape, Tick, btnPop } from "@/components/garden/ui";

/** Pricing: a report card for the Core plan, pinned to a forest-green board. */
export default function Pricing() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        gsap.fromTo(
          "[data-feature] [data-tick]",
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.5, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: "[data-card]", start: "top 70%", once: true } },
        );
        gsap.from("[data-card]", { rotate: -8, y: 80, opacity: 0, duration: 1.1, ease: "back.out(1.3)", scrollTrigger: { trigger: "[data-card]", start: "top 85%", once: true } });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="pricing" className="px-3 py-10 lg:px-6">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[44px] bg-[var(--sf-forest)] px-6 py-20 text-[var(--sf-cream)] sm:px-10 lg:px-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] sf-grid" aria-hidden="true" style={{ backgroundImage: "radial-gradient(#fff 1.2px, transparent 1.2px)" }} />
        <Draw className="absolute right-[6%] top-14 hidden w-14 lg:block">
          <Star color="var(--sf-butter)" />
        </Draw>
        <div className="relative grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <Reveal stagger={0.1}>
            <div>
              <Pill tint="ink">🌼 {PRICING_COPY.eyebrow}</Pill>
            </div>
            <h2 className="sf-display mt-5 text-5xl leading-[0.95] md:text-6xl xl:text-7xl">
              {PRICING_COPY.headlineLead} <span className="text-[var(--sf-butter)]">{PRICING_COPY.headlineAccent}</span>
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--sf-cream)]/80">{PRICING_COPY.body}</p>
            <div className="relative mt-10 max-w-md rotate-1 rounded-[24px] bg-[var(--sf-peach)] p-6 text-[var(--sf-ink)] shadow-[0_6px_0_0_var(--sf-clay-deep)]">
              <Tape color="var(--sf-butter)" className="-top-3 left-8 -rotate-6" />
              <p className="font-extrabold">{PRICING_COPY.customQuestion}</p>
              <p className="mt-1 text-[var(--sf-ink)]/75">{PRICING_COPY.customBody}</p>
              <a href={BOOK_DEMO_HASH_HREF} className="mt-4 inline-flex items-center gap-2 font-extrabold text-[var(--sf-clay-deep)] underline decoration-2 underline-offset-4">
                {PRICING_COPY.customCta} →
              </a>
            </div>
          </Reveal>

          <div className="relative">
            <div data-card className="sf-paper relative rounded-[32px] p-7 text-[var(--sf-ink)] shadow-[0_14px_0_0_var(--sf-forest-deep)] sm:p-10" style={{ rotate: "-1.5deg" }}>
              <Tape color="var(--sf-mint)" className="-top-3 left-1/2 w-28 -translate-x-1/2 -rotate-2" />
              <div className="flex items-start justify-between gap-4 border-b-2 border-dashed border-[var(--sf-ink)]/20 pb-5">
                <div>
                  <span className="sf-hand text-xl text-[var(--sf-soft)]" aria-hidden="true">
                    report card
                  </span>
                  <h3 className="sf-display text-5xl leading-none">{PRICING_COPY.planLabel}</h3>
                  <p className="mt-3 max-w-xs text-[var(--sf-soft)]">{PRICING_COPY.planBody}</p>
                </div>
                <span className="flex h-20 w-20 shrink-0 rotate-12 items-center justify-center rounded-full border-[3px] border-[var(--sf-clay)] bg-[var(--sf-butter)] p-3" aria-hidden="true">
                  <Star color="var(--sf-clay)" className="h-full w-full" />
                </span>
              </div>
              <ul className="mt-6 space-y-3.5">
                {PRICING_COPY.features.map((f) => (
                  <li key={f} data-feature className="flex items-center gap-3 text-[17px] font-bold">
                    <Tick tick fill="var(--sf-mint)" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
                <Magnetic>
                  <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
                    {PRICING_COPY.cta}
                  </a>
                </Magnetic>
                <span className="text-sm font-bold text-[var(--sf-soft)]">{PRICING_COPY.ctaNote}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
