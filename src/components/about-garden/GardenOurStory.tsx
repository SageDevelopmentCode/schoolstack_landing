"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { BOOK_DEMO_HASH_HREF, GET_STARTED_DEMO_SECTION_ID } from "@/lib/marketing/book-demo";
import { scrollToBookDemoSection } from "@/lib/marketing/book-demo-hash-context";
import { Reveal } from "@/components/garden/motion";
import { Draw, Leaf, Squiggle, Tape, btnForest, btnOutline, btnPop } from "@/components/garden/ui";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { TAPES } from "@/components/home-garden/assets";
import { FOUNDER_PORTRAITS, GET_STARTED_STORY_HEADER, OUR_STORY_COPY, SAGE_FIELD_URL } from "./about-copy";
import { BUILT_CAPABILITY_CHIPS } from "./about-feature-chips";

export type OurStoryCtaVariant = "about" | "get-started" | "same-page";

const CHIP_TINTS = [
  "bg-[var(--sf-butter)]",
  "bg-[var(--sf-sky)]",
  "bg-[var(--sf-peach)]",
  "bg-[var(--sf-mint)]",
  "bg-[var(--sf-lav)]",
] as const;

/** Deterministic tilt so server and client match (recipe 8). */
const chipTilt = (i: number) => (((i * 37) % 9) - 4) * 1.1;

function scrollToGetStartedDemo() {
  const el = document.getElementById(GET_STARTED_DEMO_SECTION_ID);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 100;
  window.scrollTo({ top, behavior: "smooth" });
}

function DemoCta({ variant }: { variant: OurStoryCtaVariant }) {
  const { ctas } = OUR_STORY_COPY;
  if (variant === "about") {
    return (
      <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
        {ctas.bookDemo}
        <ArrowRight size={18} strokeWidth={2.6} aria-hidden />
      </a>
    );
  }
  return (
    <button type="button" onClick={variant === "get-started" ? scrollToGetStartedDemo : scrollToBookDemoSection} className={btnPop}>
      {ctas.scheduleDemo}
      <ArrowRight size={18} strokeWidth={2.6} aria-hidden />
    </button>
  );
}

/**
 * "We started with a school": the founders as polaroids, the story on
 * notebook paper, what we built as a sticker wall and the first-term numbers
 * as an oversized numeral. Shared by /about and /get-started.
 */
export default function GardenOurStory({
  ctaVariant,
  heading = "about",
  id = "our-story",
  className = "bg-[var(--sf-mint)]/45",
}: {
  ctaVariant: OurStoryCtaVariant;
  /** "about": a short "Our story" heading. "get-started": the full founders headline. */
  heading?: "about" | "get-started";
  id?: string;
  className?: string;
}) {
  const founders = [FOUNDER_PORTRAITS.julius, FOUNDER_PORTRAITS.sabrina];
  const { opening, beforeBuild, turn, afterBuild, stat, closing, ctas } = OUR_STORY_COPY;

  return (
    <section id={id} className={`relative scroll-mt-24 overflow-hidden py-24 lg:py-32 ${className}`}>
      <Draw className="absolute right-[7%] top-20 hidden w-14 lg:block">
        <Leaf />
      </Draw>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        {heading === "get-started" ? (
          <SectionIntro
            pill={`🌱 ${GET_STARTED_STORY_HEADER.kicker}`}
            tint="forest"
            lead={GET_STARTED_STORY_HEADER.headlineLead}
            accent={GET_STARTED_STORY_HEADER.headlineAccent}
            accentColor="text-[var(--sf-forest)]"
            squiggle="var(--sf-butter)"
            align="left"
            headingClassName="text-5xl md:text-6xl"
            body={<p>{GET_STARTED_STORY_HEADER.body}</p>}
          />
        ) : (
          <SectionIntro lead={OUR_STORY_COPY.heading} squiggle={null} align="left" />
        )}

        {/* Founders + how it started */}
        <div className="mt-14 grid items-start gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal className="grid grid-cols-2 gap-5 sm:gap-8 lg:pt-6" y={50} stagger={0.12}>
            {founders.map((f, i) => (
              <figure
                key={f.name}
                className={`sf-polaroid relative transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 hover:-translate-y-1 ${i === 1 ? "mt-10" : ""}`}
                style={{ rotate: `${i === 0 ? -3 : 3.5}deg` }}
              >
                <Tape color={TAPES[i]} className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-[var(--sf-mint)]">
                  <Image src={f.src} alt={f.name} fill className="object-cover" sizes="(max-width: 1024px) 45vw, 240px" />
                </div>
                <figcaption className="mt-3 px-1">
                  <span className="block font-extrabold leading-tight text-[var(--sf-ink)]">{f.name}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-[var(--sf-soft)]">
                    {f.role} · {f.focus}
                  </span>
                </figcaption>
              </figure>
            ))}
          </Reveal>

          <Reveal y={50}>
            <div className="sf-paper relative rounded-[30px] border-2 border-[var(--sf-ink)] p-7 shadow-[0_8px_0_0_var(--sf-ink)] sm:p-10" style={{ rotate: "0.6deg" }}>
              <Tape color="var(--sf-peach)" className="-top-3 left-12 w-24 -rotate-6" />
              <p className="text-xl font-bold leading-snug text-[var(--sf-ink)] sm:text-[1.35rem]">
                {opening.before}
                <a
                  href={SAGE_FIELD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded text-[var(--sf-clay)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--sf-clay)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
                >
                  {opening.linkText}
                  <ExternalLink size={15} className="shrink-0" aria-hidden />
                </a>
                {opening.after}
              </p>
              <div className="mt-6 space-y-5 text-[16.5px] leading-relaxed text-[var(--sf-ink)]/80">
                {beforeBuild.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
              <p className="sf-display relative isolate mt-8 inline-block text-4xl leading-none text-[var(--sf-clay)] sm:text-5xl">
                <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.3}>
                  <Squiggle className="h-4 w-full" color="var(--sf-butter)" />
                </Draw>
                {turn}
              </p>
            </div>
          </Reveal>
        </div>

        {/* What we built */}
        <Reveal as="ul" className="mx-auto mt-20 flex max-w-5xl flex-wrap justify-center gap-x-4 gap-y-5" y={30} stagger={0.05}>
          {BUILT_CAPABILITY_CHIPS.map((chip, i) => {
            const Icon = chip.icon;
            return (
              <li
                key={chip.id}
                className={`sf-wiggle inline-flex items-center gap-2.5 rounded-full border-2 border-[var(--sf-ink)] py-2 pl-2 pr-5 text-[15px] font-extrabold text-[var(--sf-ink)] shadow-[0_4px_0_0_var(--sf-ink)] ${CHIP_TINTS[i % CHIP_TINTS.length]}`}
                style={{ rotate: `${chipTilt(i)}deg` }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-[var(--sf-ink)]">
                  <Icon size={16} strokeWidth={2.4} aria-hidden />
                </span>
                {chip.label}
              </li>
            );
          })}
        </Reveal>

        {/* What it became */}
        <div className="mt-20 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal className="max-w-2xl space-y-5 text-lg leading-relaxed text-[var(--sf-ink)]/80" y={40}>
            {afterBuild.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </Reveal>
          <Reveal y={60}>
            <div className="relative rounded-[32px] border-2 border-[var(--sf-ink)] bg-white p-8 text-center shadow-[0_10px_0_0_var(--sf-ink)] sm:p-10" style={{ rotate: "-1.5deg" }}>
              <Tape color="var(--sf-butter)" className="-top-3 left-1/2 w-24 -translate-x-1/2 rotate-2" />
              <p className="sf-display whitespace-nowrap text-[clamp(4rem,8vw,6.5rem)] leading-none text-[var(--sf-clay)]">{stat.number}</p>
              <p className="mt-3 text-lg font-extrabold text-[var(--sf-ink)]">{stat.label}</p>
              <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-[var(--sf-soft)]">{stat.body}</p>
            </div>
          </Reveal>
        </div>

        <Reveal className="mx-auto mt-20 max-w-3xl space-y-6 text-lg leading-relaxed text-[var(--sf-ink)]/80" y={40}>
          <p>{closing[0]}</p>
          <p className="text-xl font-bold leading-relaxed text-[var(--sf-ink)]">{closing[1]}</p>
        </Reveal>

        <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-4 sm:flex-row sm:flex-wrap">
          <DemoCta variant={ctaVariant} />
          <Link href={ctas.storyHref} className={btnForest}>
            {ctas.story}
          </Link>
          <a href={SAGE_FIELD_URL} target="_blank" rel="noopener noreferrer" className={btnOutline}>
            {ctas.site}
            <ExternalLink size={16} aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
