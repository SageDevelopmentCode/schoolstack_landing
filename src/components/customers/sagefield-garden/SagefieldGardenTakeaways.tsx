"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { Reveal } from "@/components/garden/motion";
import { Draw, Leaf, btnOutline, btnPop } from "@/components/garden/ui";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { TAKEAWAYS, TAKEAWAYS_COPY } from "./sagefield-copy";

const CARD_TINTS = ["bg-[var(--sf-butter)]", "bg-[var(--sf-sky)]", "bg-[var(--sf-mint)]", "bg-[var(--sf-lav)]"] as const;
const CARD_TILTS = [-1.5, 1.2, 1, -1.2];

/** "What this means for your school": takeaways as postcards, then a peach CTA strip. */
export default function SagefieldGardenTakeaways() {
  return (
    <section className="relative bg-[var(--sf-paper)] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          pill={`🌼 ${TAKEAWAYS_COPY.eyebrow}`}
          tint="butter"
          lead={TAKEAWAYS_COPY.headlineLead}
          accent={TAKEAWAYS_COPY.headlineAccent}
          squiggle="var(--sf-butter)"
          body={<p>{TAKEAWAYS_COPY.body}</p>}
        />

        <Reveal as="ol" className="mt-16 grid gap-8 sm:grid-cols-2" y={50} stagger={0.1}>
          {TAKEAWAYS.map(({ number, headline, body }, i) => (
            <li
              key={number}
              className={`relative flex h-full flex-col rounded-[28px] border-2 border-[var(--sf-ink)] p-7 shadow-[0_6px_0_0_var(--sf-ink)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 hover:-translate-y-1 hover:shadow-[0_10px_0_0_var(--sf-ink)] sm:p-8 ${CARD_TINTS[i]}`}
              style={{ rotate: `${CARD_TILTS[i]}deg` }}
            >
              <span className="absolute right-5 top-5 flex h-14 w-12 items-center justify-center rounded-md border-2 border-dashed border-[var(--sf-ink)]/40 bg-white/60 text-sm font-extrabold text-[var(--sf-ink)]">
                {number}
              </span>
              <h3 className="sf-display max-w-[85%] text-[1.7rem] leading-[1.08] text-[var(--sf-ink)]">{headline}</h3>
              <p className="mt-4 border-t-2 border-dashed border-[var(--sf-ink)]/20 pt-4 leading-relaxed text-[var(--sf-ink)]/80">{body}</p>
            </li>
          ))}
        </Reveal>

        <div className="relative mt-20 overflow-hidden rounded-[36px] border-2 border-[var(--sf-ink)] bg-[var(--sf-peach)] px-6 py-12 text-center shadow-[0_10px_0_0_var(--sf-ink)] sm:px-12">
          <Draw className="absolute left-[7%] top-8 hidden w-12 lg:block">
            <Leaf />
          </Draw>
          <h2 className="sf-display text-4xl leading-[0.98] text-[var(--sf-ink)] md:text-5xl">
            {TAKEAWAYS_COPY.ctaLead} <span className="text-[var(--sf-clay-deep)]">{TAKEAWAYS_COPY.ctaAccent}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-[var(--sf-ink)]/80">{TAKEAWAYS_COPY.ctaBody}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
              {TAKEAWAYS_COPY.cta}
              <ArrowRight size={18} strokeWidth={2.6} aria-hidden />
            </a>
            <Link href={TAKEAWAYS_COPY.secondaryHref} className={btnOutline}>
              {TAKEAWAYS_COPY.secondaryCta}
            </Link>
          </div>
          <p className="mt-6 text-sm font-bold text-[var(--sf-ink)]/70">{TAKEAWAYS_COPY.reassurance}</p>
        </div>
      </div>
    </section>
  );
}
