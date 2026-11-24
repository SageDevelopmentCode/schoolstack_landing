"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, MapPin } from "lucide-react";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Reveal, WordsReveal } from "@/components/garden/motion";
import { Draw, Squiggle, Star, Sun, Tape, btnButter } from "@/components/garden/ui";
import Polaroid from "@/components/home-garden/Polaroid";
import { SAGEFIELD_PHOTOS } from "@/components/home-garden/assets";
import { STORY_COPY } from "@/components/home/home-copy";
import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";
import { CUSTOMERS_COPY } from "./customers-copy";
import { CUSTOMER_STORIES } from "./customers-data";

function Hero() {
  return (
    <section aria-label={CUSTOMERS_COPY.eyebrow} className="sf-grid relative overflow-hidden pb-16 pt-32 lg:pb-20 lg:pt-40">
      <div className="pointer-events-none absolute left-[3%] top-36 hidden w-[200px] xl:block" aria-hidden="true">
        <Polaroid src={SAGEFIELD_PHOTOS.classroom.src} alt="" tilt={-7} tape="var(--sf-butter)" sizes="200px" hover={false} />
      </div>
      <div className="pointer-events-none absolute right-[4%] top-44 hidden w-[190px] xl:block" aria-hidden="true">
        <Polaroid src={SAGEFIELD_PHOTOS.garden.src} alt="" tilt={6} tape="var(--sf-mint)" sizes="190px" hover={false} />
      </div>
      <Draw className="absolute right-[24%] top-28 hidden w-14 lg:block" delay={0.8}>
        <Sun />
      </Draw>
      <div className="relative mx-auto max-w-3xl px-6 text-center sm:px-10">
        <h1 className="sf-display text-[13vw] leading-[0.9] text-[var(--sf-ink)] sm:text-7xl lg:text-[5.4rem]">
          <WordsReveal as="span" text={CUSTOMERS_COPY.headlineLead} immediate className="block" />{" "}
          <span className="relative isolate inline-block text-[var(--sf-clay)]">
            <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.6}>
              <Squiggle className="h-5 w-full" color="var(--sf-butter)" />
            </Draw>
            <WordsReveal as="span" text={CUSTOMERS_COPY.headlineAccent} immediate delay={0.25} />
          </span>
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-lg font-semibold leading-relaxed text-[var(--sf-soft)]">{CUSTOMERS_COPY.body}</p>
      </div>
    </section>
  );
}

function StoryTicket({ story }: { story: (typeof CUSTOMER_STORIES)[number] }) {
  return (
    <article className="group relative" style={{ rotate: "-0.8deg" }}>
      <Tape color="var(--sf-butter)" className="-top-3 left-16 w-24 -rotate-6" />
      <div className="relative overflow-hidden rounded-[32px] border-2 border-[var(--sf-ink)] bg-white shadow-[0_10px_0_0_var(--sf-ink)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-focus-within:-translate-y-1 group-hover:-translate-y-1 group-hover:shadow-[0_14px_0_0_var(--sf-ink)] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-[260px] lg:min-h-full">
          <Image src={story.image} alt={SAGEFIELD_PHOTOS.running.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 520px" />
          <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-[var(--sf-ink)] ring-2 ring-[var(--sf-ink)]">
            <MapPin size={14} strokeWidth={2.6} aria-hidden />
            {story.location}
          </span>
        </div>
        <div className="relative border-t-2 border-dashed border-[var(--sf-ink)]/25 p-7 sm:p-9 lg:border-l-2 lg:border-t-0">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white p-2 ring-2 ring-[var(--sf-ink)]">
              <Image src={story.logo} alt="" width={48} height={48} className="h-full w-full object-contain" />
            </span>
            <div className="min-w-0">
              <h2 className="sf-display text-3xl leading-none text-[var(--sf-ink)]">
                {/* The whole card is the link; the Website link sits above it. */}
                <Link
                  href={story.href}
                  className="rounded after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
                >
                  {story.name}
                </Link>
              </h2>
              <p className="mt-1.5 text-sm font-bold text-[var(--sf-soft)]">
                {story.tagline} · {story.ages}
              </p>
            </div>
          </div>

          <dl className="mt-7 grid grid-cols-3 gap-3 border-y-2 border-dashed border-[var(--sf-ink)]/15 py-5">
            {STORY_COPY.stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="sf-display whitespace-nowrap text-[1.7rem] leading-none text-[var(--sf-clay)] sm:text-[2.2rem]">{s.number}</dd>
                <dd className="mt-2 text-xs font-extrabold uppercase tracking-wider text-[var(--sf-soft)]" aria-hidden="true">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 leading-relaxed text-[var(--sf-ink)]/80">{story.description}</p>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--sf-forest)] px-6 py-3 font-extrabold text-white shadow-[0_5px_0_0_var(--sf-forest-deep)] transition-transform duration-200 group-hover:-translate-y-0.5">
              {CUSTOMERS_COPY.readStory}
              <ArrowRight size={17} strokeWidth={2.6} aria-hidden />
            </span>
            {story.website ? (
              <a
                href={story.website}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-[2] inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-extrabold text-[var(--sf-clay-deep)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-clay)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
              >
                <ExternalLink size={14} aria-hidden />
                {CUSTOMERS_COPY.website}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function ComingSoon() {
  return (
    <div
      className="relative flex min-h-[240px] w-full max-w-md flex-col items-center justify-center justify-self-center rounded-[32px] border-2 border-dashed border-[var(--sf-ink)]/30 bg-[var(--sf-paper)] p-10 text-center lg:justify-self-end pt-16"
      style={{ rotate: "1.2deg" }}
    >
      <span className="absolute right-5 top-5 flex h-16 w-14 items-center justify-center rounded-md border-2 border-dashed border-[var(--sf-ink)]/30 text-2xl" aria-hidden="true">
        🌱
      </span>
      <p className="sf-display text-3xl leading-tight text-[var(--sf-ink)]">{CUSTOMERS_COPY.comingSoon.title}</p>
      <p className="mt-3 max-w-[240px] leading-relaxed text-[var(--sf-soft)]">{CUSTOMERS_COPY.comingSoon.body}</p>
      <p className="sf-hand mt-6 text-xl text-[var(--sf-forest)]" aria-hidden="true">
        saving this spot ✿
      </p>
    </div>
  );
}

/** /customers in the Garden design system. */
export default function CustomersGardenPage() {
  return (
    <HomeGardenShell>
      <Hero />

      <section className="relative bg-[var(--sf-mint)]/45 py-20 lg:py-28">
        <Draw className="absolute left-[6%] top-14 hidden w-12 lg:block">
          <Star color="var(--sf-forest)" />
        </Draw>
        <Reveal className="mx-auto grid max-w-6xl gap-14 px-6 sm:px-10 lg:px-16" y={60} stagger={0.15}>
          {CUSTOMER_STORIES.map((story) => (
            <StoryTicket key={story.href} story={story} />
          ))}
          <ComingSoon />
        </Reveal>
      </section>

      <section className="px-3 py-10 lg:px-6 lg:py-16">
        <div className="relative overflow-hidden rounded-[44px] bg-[var(--sf-forest)] px-6 py-20 text-center sm:px-10 lg:py-24">
          <Draw className="absolute right-[10%] top-12 hidden w-14 lg:block">
            <Star color="var(--sf-butter)" />
          </Draw>
          <h2 className="sf-display mx-auto max-w-3xl text-5xl leading-[0.95] text-[var(--sf-cream)] md:text-6xl">{CUSTOMERS_COPY.cta.heading}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[var(--sf-cream)]/85">{CUSTOMERS_COPY.cta.body}</p>
          <Link href={GET_STARTED_PAGE_PATH} className={`${btnButter} mt-9`}>
            {CUSTOMERS_COPY.cta.button}
            <ArrowRight size={18} strokeWidth={2.6} aria-hidden />
          </Link>
        </div>
      </section>
    </HomeGardenShell>
  );
}
