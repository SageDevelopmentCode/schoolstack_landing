"use client";

import { PRICING_COPY } from "@/components/home/home-copy";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { Magnetic, Reveal } from "@/components/garden/motion";
import { Draw, Leaf, Sun, Tape, Tick, btnPop } from "@/components/garden/ui";
import SectionIntro from "../../SectionIntro";

/** One centred plan card: big "Core plan", ticked features, a magnetic CTA. */
export default function PricingCentered() {
  return (
    <section id="pricing" className="relative overflow-hidden py-24 lg:py-36">
      <Draw className="absolute left-[7%] top-[22%] hidden w-20 lg:block">
        <Sun />
      </Draw>
      <Draw className="absolute bottom-[18%] right-[8%] hidden w-16 lg:block">
        <Leaf />
      </Draw>
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-12">
        <SectionIntro
          pill={`🌼 ${PRICING_COPY.eyebrow}`}
          tint="butter"
          lead={PRICING_COPY.headlineLead}
          accent={PRICING_COPY.headlineAccent}
          accentColor="text-[var(--sf-forest)]"
          squiggle="var(--sf-butter)"
          body={<p>{PRICING_COPY.body}</p>}
        />
        <Reveal className="mx-auto mt-16 max-w-3xl" y={70}>
          <div className="relative rounded-[40px] border-2 border-[var(--sf-ink)] bg-white p-8 text-center shadow-[0_12px_0_0_var(--sf-ink)] sm:p-14">
            <Tape color="var(--sf-mint)" className="-top-3 left-1/2 w-28 -translate-x-1/2 -rotate-2" />
            <h3 className="sf-display text-6xl leading-none text-[var(--sf-ink)] md:text-7xl">{PRICING_COPY.planLabel}</h3>
            <p className="mx-auto mt-4 max-w-md text-lg text-[var(--sf-soft)]">{PRICING_COPY.planBody}</p>
            <ul className="mx-auto mt-10 grid max-w-2xl gap-x-8 gap-y-3.5 text-left sm:grid-cols-2">
              {PRICING_COPY.features.map((f) => (
                <li key={f} className="flex items-center gap-3 font-bold text-[var(--sf-ink)]">
                  <Tick fill="var(--sf-mint)" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-12 flex flex-col items-center gap-3">
              <Magnetic>
                <a href={BOOK_DEMO_HASH_HREF} className={`${btnPop} px-10 text-lg`}>
                  {PRICING_COPY.cta}
                </a>
              </Magnetic>
              <span className="text-sm font-bold text-[var(--sf-soft)]">{PRICING_COPY.ctaNote}</span>
            </div>
          </div>
          <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-between gap-4 rounded-[28px] bg-[var(--sf-peach)]/70 px-7 py-6 text-center sm:flex-row sm:text-left">
            <div>
              <p className="font-extrabold text-[var(--sf-ink)]">{PRICING_COPY.customQuestion}</p>
              <p className="mt-1 text-[var(--sf-ink)]/75">{PRICING_COPY.customBody}</p>
            </div>
            <a href={BOOK_DEMO_HASH_HREF} className="shrink-0 font-extrabold text-[var(--sf-clay-deep)] underline decoration-2 underline-offset-4">
              {PRICING_COPY.customCta} →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
