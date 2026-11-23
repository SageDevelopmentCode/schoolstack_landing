"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, HeartHandshake, Sparkles } from "lucide-react";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Reveal, WordsReveal } from "@/components/garden/motion";
import { Draw, Squiggle, Star, Sun, Tick, btnButter, btnOutline } from "@/components/garden/ui";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import GardenBookDemo from "@/components/home-garden/GardenBookDemo";
import GardenViewTabs from "@/components/home-garden/GardenViewTabs";
import Polaroid from "@/components/home-garden/Polaroid";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { SAGEFIELD_PHOTOS } from "@/components/home-garden/assets";
import { ABOUT_HERO_COPY, ABOUT_SECTION_LINKS, AUDIENCE_CARDS, PLATFORM_COPY } from "./about-copy";
import { CORE_FEATURE_CHIPS } from "./about-feature-chips";
import GardenOurStory from "./GardenOurStory";

const AUDIENCE_STYLE = {
  Parents: { icon: HeartHandshake, tint: "bg-[var(--sf-sky)]", tilt: -1.5 },
  Teachers: { icon: GraduationCap, tint: "bg-[var(--sf-mint)]", tilt: 1 },
  "Admins & founders": { icon: Sparkles, tint: "bg-[var(--sf-peach)]", tilt: -0.8 },
} as const;

const HERO_PHOTOS = [
  { photo: SAGEFIELD_PHOTOS.entrance, tilt: -6, tape: "var(--sf-butter)", className: "left-0 top-6 w-[46%]" },
  { photo: SAGEFIELD_PHOTOS.mudKitchen, tilt: 5, tape: "var(--sf-mint)", className: "right-0 top-0 w-[42%]" },
  { photo: SAGEFIELD_PHOTOS.garden, tilt: -2, tape: "var(--sf-lav)", className: "bottom-0 left-[27%] w-[44%]" },
] as const;

function Hero() {
  return (
    <section aria-label="About MudKitchen" className="sf-grid relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40">
      <Draw className="absolute left-[46%] top-28 hidden w-14 lg:block" delay={0.8}>
        <Sun />
      </Draw>
      <div className="mx-auto grid max-w-[1320px] items-center gap-14 px-6 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
        <div className="relative z-10">
          <div className="flex items-center gap-4 border-b-2 border-[var(--sf-ink)] pb-4">
            <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-[var(--sf-clay-deep)]">{ABOUT_HERO_COPY.eyebrow}</span>
            <span className="sf-hand ml-auto hidden text-xl text-[var(--sf-forest)] sm:inline" aria-hidden="true">
              hi there! 👋
            </span>
          </div>
          <h1 className="sf-display mt-8 text-[11vw] leading-[0.9] text-[var(--sf-ink)] sm:text-6xl lg:text-[4rem] xl:text-[4.6rem]">
            <WordsReveal as="span" text={ABOUT_HERO_COPY.headlineLead} immediate />{" "}
            <span className="relative isolate inline-block text-[var(--sf-clay)]">
              <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.6}>
                <Squiggle className="h-5 w-full" color="var(--sf-butter)" />
              </Draw>
              <WordsReveal as="span" text={ABOUT_HERO_COPY.headlineAccent} immediate delay={0.25} />
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg font-semibold leading-relaxed text-[var(--sf-soft)]">{ABOUT_HERO_COPY.body}</p>
          <nav aria-label="On this page" className="mt-9 flex flex-wrap gap-3">
            {ABOUT_SECTION_LINKS.map((link, i) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`inline-flex items-center gap-2 rounded-full border-2 border-[var(--sf-ink)] px-5 py-2.5 text-[15px] font-extrabold text-[var(--sf-ink)] shadow-[0_4px_0_0_var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-ink)]/20 ${
                  i === 0 ? "bg-[var(--sf-mint)]" : "bg-[var(--sf-butter)]"
                }`}
              >
                {link.label} <span aria-hidden="true">↓</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="relative mx-auto hidden aspect-[1/1] w-full max-w-[520px] lg:block" aria-hidden="true">
          {HERO_PHOTOS.map(({ photo, tilt, tape, className }, i) => (
            <div key={photo.src} className={`absolute ${className}`}>
              <Polaroid src={photo.src} alt="" tilt={tilt} tape={tape} sizes="240px" preload={i === 0} />
            </div>
          ))}
          <Draw className="absolute -right-4 bottom-10 w-12" delay={1}>
            <Star color="var(--sf-forest)" />
          </Draw>
        </div>
        <div className="-mx-2 grid grid-cols-2 gap-5 px-2 lg:hidden" aria-hidden="true">
          <Polaroid src={SAGEFIELD_PHOTOS.entrance.src} alt="" tilt={-3} sizes="45vw" />
          <Polaroid src={SAGEFIELD_PHOTOS.mudKitchen.src} alt="" tilt={3} tape="var(--sf-mint)" sizes="45vw" className="mt-6" />
        </div>
      </div>
    </section>
  );
}

function Platform() {
  return (
    <section id="platform" className="scroll-mt-24 px-3 py-10 lg:px-6 lg:py-16">
      <div className="relative overflow-hidden rounded-[44px] bg-[var(--sf-forest)] py-20 text-[var(--sf-cream)] lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <SectionIntro
            lead={PLATFORM_COPY.headlineLead}
            accent={PLATFORM_COPY.headlineAccent}
            accentColor="text-[var(--sf-butter)]"
            squiggle={null}
            dark
            align="left"
            headingClassName="text-5xl md:text-6xl"
            bodyClassName="max-w-2xl text-[var(--sf-cream)]/85"
            body={<p>{PLATFORM_COPY.body}</p>}
          />

          <div className="mt-14">
            <GardenViewTabs idPrefix="about-platform" dark tape="var(--sf-butter)" />
          </div>

          <div className="mt-24 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <h3 className="sf-display text-4xl leading-[1.02] text-[var(--sf-cream)]">{PLATFORM_COPY.audienceHeading}</h3>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-[var(--sf-cream)]/85">{PLATFORM_COPY.audienceBody}</p>
            </div>
            <Reveal className="grid gap-6 md:grid-cols-3" y={50} stagger={0.1}>
              {AUDIENCE_CARDS.map((card) => {
                const style = AUDIENCE_STYLE[card.title];
                const Icon = style.icon;
                return (
                  <div
                    key={card.title}
                    className={`rounded-[26px] border-2 border-[var(--sf-ink)] p-6 text-[var(--sf-ink)] shadow-[0_6px_0_0_var(--sf-ink)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 hover:-translate-y-1 ${style.tint}`}
                    style={{ rotate: `${style.tilt}deg` }}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white ring-2 ring-[var(--sf-ink)]">
                      <Icon size={19} strokeWidth={2.4} aria-hidden />
                    </span>
                    <h4 className="sf-display mt-5 text-2xl leading-tight">{card.title}</h4>
                    <p className="mt-2 text-[15px] leading-relaxed text-[var(--sf-ink)]/80">{card.description}</p>
                  </div>
                );
              })}
            </Reveal>
          </div>

          <div className="mt-20 border-t-2 border-dashed border-white/20 pt-14">
            <h3 className="sf-display text-4xl leading-[1.02] text-[var(--sf-cream)]">{PLATFORM_COPY.includedHeading}</h3>
            <Reveal as="ul" className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3" y={20} stagger={0.05}>
              {CORE_FEATURE_CHIPS.map((chip) => (
                <li key={chip.id} className="flex items-center gap-3 text-[16.5px] font-extrabold text-[var(--sf-cream)]">
                  <Tick className="h-7 w-7" color="var(--sf-forest)" fill="var(--sf-butter)" />
                  {chip.label}
                </li>
              ))}
            </Reveal>
          </div>

          <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <a href={BOOK_DEMO_HASH_HREF} className={btnButter}>
              {PLATFORM_COPY.bookCta}
            </a>
            <Link href={PLATFORM_COPY.productHref} className={btnOutline}>
              {PLATFORM_COPY.productCta}
              <ArrowRight size={18} strokeWidth={2.6} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** /about in the Garden design system. */
export default function AboutGardenPage() {
  return (
    <HomeGardenShell>
      <Hero />
      <GardenOurStory ctaVariant="about" />
      <Platform />
      <GardenBookDemo className="bg-[var(--sf-butter)]/35" />
    </HomeGardenShell>
  );
}
