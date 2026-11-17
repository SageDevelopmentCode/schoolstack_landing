"use client";

import { Reveal } from "@/components/garden/motion";
import Polaroid from "@/components/home-garden/Polaroid";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { SAGEFIELD_PHOTOS } from "@/components/home-garden/assets";
import { REASONS, WHY_COPY } from "./sagefield-copy";

const APPROACH_TINTS = [
  "bg-[var(--sf-mint)]",
  "bg-[var(--sf-butter)]",
  "bg-[var(--sf-sky)]",
  "bg-[var(--sf-peach)]",
  "bg-[var(--sf-lav)]",
] as const;

/** Why it worked: quote card + polaroid on the left, field-guide rows on the right. */
export default function SagefieldGardenWhy() {
  return (
    <section className="relative bg-[var(--sf-mint)]/45 py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-start gap-16 px-6 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-16">
        <div>
          <SectionIntro
            pill={`🌳 ${WHY_COPY.eyebrow}`}
            tint="forest"
            lead={WHY_COPY.headlineLead}
            accent={WHY_COPY.headlineAccent}
            accentColor="text-[var(--sf-forest)]"
            squiggle="var(--sf-butter)"
            align="left"
            headingClassName="text-5xl md:text-6xl"
            body={<p>{WHY_COPY.body}</p>}
          />
          <Reveal className="mt-10 grid items-start gap-8 sm:grid-cols-[1.25fr_0.75fr] lg:grid-cols-1 xl:grid-cols-[1.25fr_0.75fr]" y={40} stagger={0.15}>
            <figure className="relative rounded-[28px] border-2 border-[var(--sf-ink)] bg-white p-7 shadow-[0_8px_0_0_var(--sf-ink)]" style={{ rotate: "-1deg" }}>
              <span className="sf-display absolute -top-9 left-6 text-[6rem] leading-none text-[var(--sf-clay)]" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote className="mt-4 text-lg font-bold leading-relaxed text-[var(--sf-ink)]">{WHY_COPY.quote}</blockquote>
              <figcaption className="mt-5 text-sm font-extrabold text-[var(--sf-soft)]">{WHY_COPY.quoteBy}</figcaption>
            </figure>
            <Polaroid
              src={SAGEFIELD_PHOTOS.mudKitchen.src}
              alt={SAGEFIELD_PHOTOS.mudKitchen.alt}
              tilt={4}
              tape="var(--sf-peach)"
              aspect="aspect-[3/4]"
              sizes="(max-width: 640px) 70vw, 220px"
              className="mx-auto w-[70%] sm:w-full lg:w-[60%] xl:w-full"
            />
          </Reveal>
        </div>

        <div className="lg:pt-6">
          <Reveal as="ol" className="space-y-6" y={40} stagger={0.12}>
            {REASONS.map(({ number, title, body }, i) => (
              <li
                key={number}
                className="relative overflow-hidden rounded-[28px] border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] p-7 shadow-[0_6px_0_0_var(--sf-ink)]"
                style={{ rotate: `${[0.8, -0.8, 0.6][i]}deg` }}
              >
                <span className="sf-display pointer-events-none absolute -right-2 -top-6 text-[7rem] leading-none text-[var(--sf-forest)]/10" aria-hidden="true">
                  {number}
                </span>
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sf-butter)] text-sm font-extrabold text-[var(--sf-ink)] ring-2 ring-[var(--sf-ink)]">
                  {number}
                </span>
                <h3 className="sf-display relative mt-4 text-[1.7rem] leading-[1.08] text-[var(--sf-ink)]">{title}</h3>
                <p className="relative mt-3 leading-relaxed text-[var(--sf-ink)]/80">{body}</p>
              </li>
            ))}
          </Reveal>

          <div className="mt-10 border-t-2 border-dashed border-[var(--sf-ink)]/15 pt-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">{WHY_COPY.approachLabel}</p>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {WHY_COPY.approach.map((tag, i) => (
                <li
                  key={tag}
                  className={`rounded-full border-2 border-[var(--sf-ink)] px-4 py-1.5 text-sm font-extrabold text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)] ${APPROACH_TINTS[i % APPROACH_TINTS.length]}`}
                  style={{ rotate: `${(((i * 37) % 9) - 4) * 0.6}deg` }}
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
