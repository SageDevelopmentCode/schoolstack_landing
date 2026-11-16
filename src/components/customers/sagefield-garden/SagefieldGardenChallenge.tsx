"use client";

import { Reveal } from "@/components/garden/motion";
import { Tape } from "@/components/garden/ui";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { CHALLENGE_COPY } from "./sagefield-copy";

/** The challenge: a school "file card" of facts beside the story, then stat stickers. */
export default function SagefieldGardenChallenge() {
  return (
    <section className="relative bg-[var(--sf-peach)]/40 py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-start gap-14 px-6 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-16">
        <div>
          <SectionIntro
            pill={`🧩 ${CHALLENGE_COPY.eyebrow}`}
            tint="clay"
            lead={CHALLENGE_COPY.headlineLead}
            accent={CHALLENGE_COPY.headlineAccent}
            squiggle="var(--sf-butter)"
            align="left"
            headingClassName="text-4xl md:text-[3.4rem]"
          />
          <Reveal y={40} className="mt-10">
            <dl className="relative rounded-md bg-white p-6 pt-8 shadow-[0_14px_30px_-16px_rgba(43,36,29,0.5)]" style={{ rotate: "-1.2deg" }}>
              <Tape color="var(--sf-butter)" className="-top-3 left-1/2 h-5 w-20 -translate-x-1/2 rotate-2" />
              {CHALLENGE_COPY.facts.map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-4 border-b-2 border-dashed border-[var(--sf-ink)]/10 py-3 last:border-b-0">
                  <dt className="w-28 shrink-0 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">{label}</dt>
                  <dd className="font-extrabold text-[var(--sf-ink)]">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="lg:pt-24">
          <Reveal className="space-y-5 text-lg leading-relaxed text-[var(--sf-ink)]/80" y={30}>
            {CHALLENGE_COPY.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </Reveal>
          <Reveal as="dl" className="mt-10 grid grid-cols-3 gap-4" y={40} stagger={0.1}>
            {CHALLENGE_COPY.stats.map(({ number, label }, i) => (
              <div
                key={label}
                className="rounded-2xl border-2 border-[var(--sf-ink)] bg-white px-3 py-5 text-center shadow-[0_5px_0_0_var(--sf-ink)]"
                style={{ rotate: `${[-2, 1.5, -1][i]}deg` }}
              >
                <dt className="sr-only">{label}</dt>
                <dd className="sf-display whitespace-nowrap text-[2.4rem] leading-none text-[var(--sf-clay)] sm:text-5xl">{number}</dd>
                <dd className="mt-2 text-xs font-extrabold uppercase tracking-wider text-[var(--sf-soft)]" aria-hidden="true">
                  {label}
                </dd>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
