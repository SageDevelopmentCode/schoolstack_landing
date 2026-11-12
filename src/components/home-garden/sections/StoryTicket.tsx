"use client";

import Image from "next/image";
import Link from "next/link";
import { STORY_COPY } from "@/components/home/home-copy";
import { Reveal } from "@/components/garden/motion";
import { Draw, Pill, Star, Tape, Tick, btnButter } from "@/components/garden/ui";
import { SAGEFIELD_LOGO, SAGEFIELD_PHOTOS } from "../assets";
import SectionIntro from "../SectionIntro";

/** Customer story as an admission ticket: photo, perforation, stats, quote. */
export default function StoryTicket() {
  return (
    <section id="founder-story" className="relative overflow-hidden bg-[var(--sf-mint)]/45 py-24 lg:py-32">
      <Draw className="absolute right-[8%] top-16 hidden w-14 lg:block">
        <Star color="var(--sf-forest)" />
      </Draw>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          pill={`🌳 ${STORY_COPY.badge}`}
          tint="forest"
          lead={STORY_COPY.headlineLead}
          accent={STORY_COPY.headlineAccent}
          accentColor="text-[var(--sf-forest)]"
          squiggle="var(--sf-butter)"
          note={STORY_COPY.location}
        />

        <Reveal className="mt-16 grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14" y={60} stagger={0.15}>
          {/* Ticket */}
          <div className="relative -rotate-1 transition-transform duration-700 hover:rotate-0">
            <Tape color="var(--sf-butter)" className="-top-3 left-16 w-24 -rotate-6" />
            <div className="sf-ticket overflow-hidden rounded-[32px] bg-[var(--sf-forest)] text-[var(--sf-cream)] shadow-[0_30px_60px_-35px_rgba(43,36,29,0.7)] lg:grid lg:grid-cols-[1fr_1.1fr]">
              <div className="relative min-h-[280px] lg:min-h-full">
                <Image src={SAGEFIELD_PHOTOS.mudKitchen.src} alt={SAGEFIELD_PHOTOS.mudKitchen.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 380px" />
                <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-[var(--sf-ink)]">
                  🎟️ {STORY_COPY.school.name}
                </span>
              </div>
              <div className="relative border-t-2 border-dashed border-white/40 p-8 lg:border-l-2 lg:border-t-0 lg:p-10">
                <div className="flex items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white p-2">
                    <Image src={SAGEFIELD_LOGO} alt="" width={48} height={48} className="h-full w-full object-contain" />
                  </span>
                  <div>
                    <p className="sf-display text-2xl leading-none">{STORY_COPY.school.name}</p>
                    <p className="mt-1 text-sm font-bold text-[var(--sf-cream)]/70">{STORY_COPY.school.location}</p>
                  </div>
                </div>
                <dl className="mt-8 grid grid-cols-3 gap-3 border-y-2 border-dashed border-white/25 py-6">
                  {STORY_COPY.stats.map((s) => (
                    <div key={s.label}>
                      <dt className="sr-only">{s.label}</dt>
                      <dd className="sf-display whitespace-nowrap text-[2.1rem] leading-none text-[var(--sf-butter)] xl:text-[2.6rem]">{s.number}</dd>
                      <dd className="mt-2 text-xs font-extrabold uppercase tracking-wider text-[var(--sf-cream)]/70" aria-hidden="true">
                        {s.label}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-6 leading-relaxed text-[var(--sf-cream)]/85">{STORY_COPY.body}</p>
                <Link href={STORY_COPY.href} className={`${btnButter} mt-8`}>
                  {STORY_COPY.cta} →
                </Link>
              </div>
            </div>
          </div>

          {/* Quote + contents */}
          <div className="space-y-8">
            <figure className="relative rotate-1 rounded-[28px] border-2 border-[var(--sf-ink)] bg-white p-7 shadow-[0_8px_0_0_var(--sf-ink)]">
              <span className="sf-display absolute -top-9 left-6 text-[6rem] leading-none text-[var(--sf-clay)]" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote className="mt-4 text-xl font-bold leading-relaxed text-[var(--sf-ink)]">{STORY_COPY.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Image src={STORY_COPY.author.image} alt="" width={52} height={52} className="h-[52px] w-[52px] rounded-full object-cover ring-2 ring-[var(--sf-ink)]" />
                <span>
                  <span className="block font-extrabold text-[var(--sf-ink)]">{STORY_COPY.author.name}</span>
                  <span className="block text-sm font-semibold text-[var(--sf-soft)]">{STORY_COPY.author.title}</span>
                </span>
              </figcaption>
            </figure>
            <div className="relative -rotate-1 rounded-md bg-[var(--sf-butter)] p-6 pt-7 shadow-[0_14px_30px_-16px_rgba(43,36,29,0.5)]">
              <Tape color="rgba(255,255,255,0.7)" className="-top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2" />
              <p className="sf-hand text-2xl leading-none">{STORY_COPY.insideLabel}</p>
              <ul className="mt-4 space-y-2">
                {STORY_COPY.sections.map((s) => (
                  <li key={s} className="flex items-center gap-3 font-extrabold">
                    <Tick className="h-6 w-6" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Pill tint="forest">{STORY_COPY.school.url}</Pill>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
