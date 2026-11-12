"use client";

import Image from "next/image";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { Reveal } from "@/components/garden/motion";
import { Tick } from "@/components/garden/ui";
import SectionIntro from "../../SectionIntro";
import { ROLES, ROLES_HEADING } from "../../roles";

/** Built for every role, as a field-guide spread: one illustrated entry per audience. */
export default function FieldGuideRoles() {
  return (
    <section className="relative py-24 lg:py-36">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-12">
        <SectionIntro pill="👩‍👧 For families, founders & teachers" tint="sky" lead={ROLES_HEADING} squiggle={null} align="left" headingClassName="text-5xl md:text-7xl" />
        <div className="mt-16 border-t-2 border-[var(--sf-ink)]">
          {ROLES.map((r, i) => (
            <Reveal
              key={r.id}
              className={`grid gap-10 border-b-2 border-dashed border-[var(--sf-ink)]/20 py-14 lg:grid-cols-[0.42fr_1fr] lg:gap-16 lg:py-20 ${i % 2 ? "lg:[direction:rtl]" : ""}`}
              y={50}
              stagger={0.12}
            >
              <div className="relative mx-auto aspect-square w-full max-w-[340px] [direction:ltr]">
                <div className={`sf-blob absolute inset-0 ${r.tint}`} style={{ animationDelay: `${-i * 5}s` }} />
                <Image src={r.illustration} alt="" fill className="object-contain p-10 drop-shadow-[0_24px_24px_rgba(43,36,29,0.25)]" sizes="340px" />
                <span className="sf-hand absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xl text-[var(--sf-ink)]/60" aria-hidden="true">
                  field note no. {i + 1}
                </span>
              </div>
              <div className="[direction:ltr]">
                <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-extrabold ${r.tint} ${r.ink}`}>
                  <span aria-hidden="true">{r.emoji}</span> {r.copy.eyebrow}
                </span>
                <h3 className="sf-display mt-5 text-4xl leading-[1] text-[var(--sf-ink)] md:text-5xl">
                  {r.copy.headlineLead} <span className={r.ink}>{r.copy.headlineAccent}</span>
                </h3>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--sf-soft)]">{r.copy.body}</p>
                {r.copy.bullets ? (
                  <ul className="mt-6 grid gap-3 md:grid-cols-3">
                    {r.copy.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 rounded-2xl bg-white p-4 text-[15px] font-bold text-[var(--sf-ink)] ring-2 ring-[var(--sf-ink)]/10">
                        <Tick className="mt-0.5 h-5 w-5" fill="var(--sf-mint)" />
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <a href={BOOK_DEMO_HASH_HREF} className="mt-8 inline-flex items-center gap-2 font-extrabold text-[var(--sf-clay)] underline decoration-[var(--sf-peach)] decoration-[3px] underline-offset-[6px] hover:decoration-[var(--sf-clay)]">
                  {r.copy.cta} →
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
