"use client";

import { CUSTOM_COPY, PRICING_COPY } from "@/components/home/home-copy";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { Magnetic, Reveal } from "@/components/garden/motion";
import { Tape, Tick, btnButter, btnOutline, btnPop } from "@/components/garden/ui";
import SectionIntro from "../SectionIntro";

const STICKER_TINTS = ["bg-[var(--sf-butter)]", "bg-[var(--sf-mint)]", "bg-[var(--sf-sky)]", "bg-[var(--sf-lav)]", "bg-[var(--sf-peach)]", "bg-white"];

/** Pricing on notebook paper, then the custom-build options as a wall of stickers. */
export default function PricingPaper() {
  return (
    <>
      <section id="pricing" className="relative bg-[var(--sf-peach)]/40 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <SectionIntro
            pill={`🌼 ${PRICING_COPY.eyebrow}`}
            tint="clay"
            lead={PRICING_COPY.headlineLead}
            accent={PRICING_COPY.headlineAccent}
            squiggle="var(--sf-butter)"
            body={<p>{PRICING_COPY.body}</p>}
          />
          <Reveal className="mx-auto mt-16 max-w-5xl" y={60}>
            <div className="sf-paper relative grid overflow-hidden rounded-[36px] border-2 border-[var(--sf-ink)] shadow-[0_12px_0_0_var(--sf-ink)] lg:grid-cols-[1.2fr_0.8fr]">
              <Tape color="var(--sf-mint)" className="-top-1 left-12 w-28 -rotate-3" />
              <div className="p-8 sm:p-12">
                <h3 className="sf-display text-5xl leading-none text-[var(--sf-ink)]">{PRICING_COPY.planLabel}</h3>
                <p className="mt-3 max-w-sm text-lg text-[var(--sf-soft)]">{PRICING_COPY.planBody}</p>
                <ul className="mt-8 grid gap-3.5 sm:grid-cols-1">
                  {PRICING_COPY.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-[17px] font-bold text-[var(--sf-ink)]">
                      <Tick fill="var(--sf-mint)" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
                  <Magnetic>
                    <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
                      {PRICING_COPY.cta}
                    </a>
                  </Magnetic>
                  <span className="text-sm font-bold text-[var(--sf-soft)]">{PRICING_COPY.ctaNote}</span>
                </div>
              </div>
              <div className="relative flex flex-col justify-center gap-4 border-t-2 border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-forest)] p-8 text-[var(--sf-cream)] sm:p-12 lg:border-l-2 lg:border-t-0">
                <span className="text-4xl" aria-hidden="true">
                  🏫
                </span>
                <p className="sf-display text-3xl leading-[1.05]">{PRICING_COPY.customQuestion}</p>
                <p className="text-[var(--sf-cream)]/80">{PRICING_COPY.customBody}</p>
                <a href={BOOK_DEMO_HASH_HREF} className={`${btnButter} mt-2 self-start`}>
                  {PRICING_COPY.customCta}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="custom" className="relative overflow-hidden py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-16">
          <div>
            <SectionIntro
              pill="🛠️ Custom builds"
              tint="lav"
              lead={CUSTOM_COPY.headlineLead}
              accent={CUSTOM_COPY.headlineAccent}
              squiggle="var(--sf-lav)"
              align="left"
              headingClassName="text-5xl md:text-6xl"
              body={<p>{CUSTOM_COPY.body}</p>}
            />
            <a href={BOOK_DEMO_HASH_HREF} className={`${btnOutline} mt-9`}>
              {CUSTOM_COPY.cta}
            </a>
          </div>
          <Reveal as="ul" className="flex flex-wrap justify-center gap-3 lg:gap-4" stagger={0.04} y={30}>
            {CUSTOM_COPY.tags.map((t, i) => (
              <li
                key={t}
                className={`sf-wiggle rounded-2xl border-2 border-[var(--sf-ink)] px-5 py-3 text-base font-extrabold text-[var(--sf-ink)] shadow-[0_4px_0_0_var(--sf-ink)] ${STICKER_TINTS[i % STICKER_TINTS.length]}`}
                style={{ rotate: `${(((i * 37) % 9) - 4) * 1.1}deg` }}
              >
                {t}
              </li>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
