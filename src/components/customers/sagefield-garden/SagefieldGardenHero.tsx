"use client";

import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { Magnetic, Reveal, WordsReveal } from "@/components/garden/motion";
import { Draw, Pill, Squiggle, Sun, btnOutline, btnPop } from "@/components/garden/ui";
import Polaroid from "@/components/home-garden/Polaroid";
import { SAGEFIELD_PHOTOS } from "@/components/home-garden/assets";
import { HERO_COPY, PROOF_ITEMS, SAGEFIELD_LOGO_SRC, SAGEFIELD_SITE_URL } from "./sagefield-copy";

const PROOF_TINTS = ["bg-[var(--sf-butter)]", "bg-[var(--sf-sky)]", "bg-[var(--sf-mint)]"] as const;
const PROOF_TILTS = [-1.5, 1.2, -0.8];

/** Split hero: the result headline on the left, a taped polaroid collage on the right. */
export default function SagefieldGardenHero() {
  return (
    <section aria-label={HERO_COPY.pill} className="sf-grid relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40">
      <Draw className="absolute left-[47%] top-28 hidden w-14 lg:block" delay={0.8}>
        <Sun />
      </Draw>
      <div className="mx-auto grid max-w-[1320px] items-center gap-14 px-6 sm:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 lg:px-12">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white p-1.5 ring-2 ring-[var(--sf-ink)]">
              <Image src={SAGEFIELD_LOGO_SRC} alt="Sage Field logo" width={36} height={36} className="h-full w-full object-contain" />
            </span>
            <Pill tint="clay">🎟️ {HERO_COPY.pill}</Pill>
            <span className="text-sm font-extrabold text-[var(--sf-soft)]">{HERO_COPY.meta}</span>
            <a
              href={SAGEFIELD_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded text-sm font-extrabold text-[var(--sf-clay-deep)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-clay)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
            >
              <ExternalLink size={13} aria-hidden />
              {HERO_COPY.site}
            </a>
          </div>

          <h1 className="sf-display mt-7 text-[10.5vw] leading-[0.92] text-[var(--sf-ink)] sm:text-6xl lg:text-[3.6rem] xl:text-[4.2rem]">
            <WordsReveal as="span" text={HERO_COPY.headlineLead} immediate />{" "}
            <span className="relative isolate inline-block text-[var(--sf-clay)]">
              <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.6}>
                <Squiggle className="h-5 w-full" color="var(--sf-butter)" />
              </Draw>
              <WordsReveal as="span" text={HERO_COPY.headlineAccent} immediate delay={0.2} />
            </span>{" "}
            <WordsReveal as="span" text={HERO_COPY.headlineTail} immediate delay={0.35} />
          </h1>
          <p className="mt-7 max-w-xl text-lg font-semibold leading-relaxed text-[var(--sf-soft)]">{HERO_COPY.body}</p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Magnetic>
              <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
                {HERO_COPY.primaryCta}
                <ArrowRight size={18} strokeWidth={2.6} aria-hidden />
              </a>
            </Magnetic>
            <a href="#live-site" className={btnOutline}>
              {HERO_COPY.liveCta}
            </a>
          </div>
          <a
            href="#outcomes"
            className="mt-6 inline-flex rounded font-extrabold text-[var(--sf-clay-deep)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-clay)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
          >
            {HERO_COPY.insideCta} ↓
          </a>
        </div>

        {/* Polaroid collage */}
        <div className="relative mx-auto aspect-[1/1.02] w-full max-w-[540px]">
          <div className="absolute left-0 top-4 w-[56%]">
            <Polaroid
              src={SAGEFIELD_PHOTOS.entrance.src}
              alt={SAGEFIELD_PHOTOS.entrance.alt}
              tilt={-4}
              tape="var(--sf-butter)"
              sizes="(max-width: 1024px) 55vw, 300px"
              preload
            />
          </div>
          <div className="absolute right-0 top-0 w-[46%]">
            <Polaroid src={SAGEFIELD_PHOTOS.garden.src} alt={SAGEFIELD_PHOTOS.garden.alt} tilt={5} tape="var(--sf-mint)" sizes="(max-width: 1024px) 45vw, 250px" />
          </div>
          <div className="absolute bottom-0 right-[6%] w-[54%]">
            <Polaroid
              src={SAGEFIELD_PHOTOS.running.src}
              alt={SAGEFIELD_PHOTOS.running.alt}
              tilt={-2}
              tape="var(--sf-lav)"
              aspect="aspect-[3/2]"
              sizes="(max-width: 1024px) 55vw, 300px"
            />
          </div>
        </div>
      </div>

      <Reveal as="ul" className="mx-auto mt-16 grid max-w-[1320px] gap-5 px-6 sm:grid-cols-3 sm:px-10 lg:mt-20 lg:px-12" y={30} stagger={0.1}>
        {PROOF_ITEMS.map(({ icon: Icon, text }, i) => (
          <li
            key={text}
            className={`flex items-start gap-3 rounded-2xl border-2 border-[var(--sf-ink)] px-5 py-4 shadow-[0_5px_0_0_var(--sf-ink)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 ${PROOF_TINTS[i]}`}
            style={{ rotate: `${PROOF_TILTS[i]}deg` }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-[var(--sf-ink)]">
              <Icon size={16} strokeWidth={2.5} aria-hidden />
            </span>
            <span className="text-[15px] font-bold leading-snug text-[var(--sf-ink)]">{text}</span>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
