"use client";

import Image from "next/image";
import Link from "next/link";
import { STORY_COPY } from "@/components/home/home-copy";
import { CountUp, Reveal } from "@/components/garden/motion";
import { Pill, Tape } from "@/components/garden/ui";
import { SAGEFIELD_LOGO } from "../../assets";
import SectionIntro from "../../SectionIntro";

const STAT_COLORS = ["text-[var(--sf-clay)]", "text-[var(--sf-forest)]", "text-[#b07d00]"];

function StatNumber({ value }: { value: string }) {
  const n = Number(value);
  return Number.isFinite(n) && String(n) === value ? <CountUp value={n} /> : <>{value}</>;
}

/** Customer story told in oversized numerals, then the founder's words. */
export default function BigNumbers() {
  return (
    <section id="founder-story" className="relative py-24 lg:py-36">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-12">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionIntro
            pill={`🌳 ${STORY_COPY.badge}`}
            tint="forest"
            lead={STORY_COPY.headlineLead}
            accent={STORY_COPY.headlineAccent}
            accentColor="text-[var(--sf-forest)]"
            squiggle="var(--sf-mint)"
            align="left"
            note={STORY_COPY.location}
            headingClassName="text-5xl md:text-6xl xl:text-7xl"
          />
          <Link
            href={STORY_COPY.href}
            className="group inline-flex shrink-0 items-center gap-2 text-lg font-extrabold text-[var(--sf-forest)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-[6px] hover:decoration-[var(--sf-forest)]"
          >
            {STORY_COPY.cta} <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <Reveal as="dl" className="mt-16 grid border-y-2 border-[var(--sf-ink)] md:grid-cols-3" stagger={0.12} y={50}>
          {STORY_COPY.stats.map((s, i) => (
            <div key={s.label} className={`py-10 md:px-8 md:py-14 ${i > 0 ? "border-t-2 border-dashed border-[var(--sf-ink)]/20 md:border-l-2 md:border-t-0" : ""}`}>
              <dt className="text-sm font-extrabold uppercase tracking-[0.2em] text-[var(--sf-soft)]">{s.label}</dt>
              <dd className={`sf-display mt-3 whitespace-nowrap text-[clamp(4.5rem,8vw,8.5rem)] leading-[0.85] ${STAT_COLORS[i]}`}>
                <StatNumber value={s.number} />
              </dd>
            </div>
          ))}
        </Reveal>

        <div className="mt-20 grid items-center gap-12 lg:grid-cols-[0.55fr_1.45fr] lg:gap-16">
          <Reveal y={50}>
            <div className="sf-polaroid relative mx-auto w-full max-w-[320px] -rotate-3">
              <Tape color="var(--sf-peach)" className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
              <div className="relative aspect-square overflow-hidden rounded-[3px]">
                <Image src={STORY_COPY.author.image} alt={STORY_COPY.author.name} fill className="object-cover" sizes="320px" />
              </div>
              <div className="mt-3 flex items-center justify-between px-1">
                <span className="sf-hand text-lg">{STORY_COPY.author.name.toLowerCase()}</span>
                <Image src={SAGEFIELD_LOGO} alt={STORY_COPY.school.name} width={36} height={36} className="h-9 w-9 object-contain" />
              </div>
            </div>
          </Reveal>
          <Reveal y={40} stagger={0.1}>
            <blockquote className="sf-display text-[2.1rem] leading-[1.12] text-[var(--sf-ink)] md:text-5xl">
              <span className="text-[var(--sf-clay)]">&ldquo;</span>
              {STORY_COPY.quote}
              <span className="text-[var(--sf-clay)]">&rdquo;</span>
            </blockquote>
            <p className="mt-7 font-extrabold text-[var(--sf-ink)]">
              {STORY_COPY.author.name} <span className="font-semibold text-[var(--sf-soft)]">· {STORY_COPY.author.title}</span>
            </p>
            <p className="mt-8 max-w-2xl leading-relaxed text-[var(--sf-soft)]">{STORY_COPY.body}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="mr-2 self-center text-sm font-extrabold text-[var(--sf-ink)]">{STORY_COPY.insideLabel}:</span>
              {STORY_COPY.sections.map((s) => (
                <Pill key={s} tint="forest" className="!font-bold">
                  {s}
                </Pill>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
