"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Reveal, WordsReveal } from "@/components/garden/motion";
import { Draw, Squiggle, Star, Sun, btnOutline, btnPop } from "@/components/garden/ui";
import GardenBookDemo from "@/components/home-garden/GardenBookDemo";
import GardenFaq from "@/components/home-garden/GardenFaq";
import PhoneCard from "@/components/home-garden/PhoneCard";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { TAPES } from "@/components/home-garden/assets";
import MobileAppDownloadBadges from "@/components/download/MobileAppDownloadBadges";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { DOWNLOAD_APP_SLIDES } from "@/lib/marketing/download-app-slides";
import { featuresByRole } from "@/lib/marketing/features";
import { FEATURES_FAQ } from "@/lib/marketing/features/features-faq";
import { FEATURES_INDEX_COPY as COPY } from "@/lib/marketing/features/features-copy";
import type { FeatureRole } from "@/lib/marketing/features/types";
import FeatureCard from "./FeatureCard";
import { ROLE_META, ROLE_ORDER } from "./feature-ui";
import { useHashRole } from "./useHashRole";

const PANEL_WASH: Record<FeatureRole, string> = {
  admin: "bg-[var(--sf-peach)]/40",
  family: "bg-[var(--sf-sky)]/35",
  staff: "bg-[var(--sf-mint)]/45",
};

const ACCENT: Record<FeatureRole, string> = {
  admin: "text-[var(--sf-clay)]",
  family: "text-[#24507a]",
  staff: "text-[var(--sf-forest)]",
};

/**
 * /features: every feature, organised by who uses it. One role tab is open at a
 * time (School admins first, since founders are the audience); each card shows
 * that role's own line and screens and opens the feature page on that role.
 */
export default function FeaturesGardenPage() {
  // Deep links: /features#family opens the Families tab; a click overrides it.
  const hashRole = useHashRole();
  const [picked, setRole] = useState<FeatureRole | null>(null);
  const role: FeatureRole = picked ?? hashRole ?? "admin";
  const reduce = useReducedMotion();
  const uid = useId();

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = ROLE_ORDER.indexOf(role);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % ROLE_ORDER.length;
    if (e.key === "ArrowLeft") next = (i - 1 + ROLE_ORDER.length) % ROLE_ORDER.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = ROLE_ORDER.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setRole(ROLE_ORDER[next]);
    document.getElementById(`${uid}-tab-${ROLE_ORDER[next]}`)?.focus();
  };

  return (
    <HomeGardenShell bookDemoHref={BOOK_DEMO_HASH_HREF}>
      {/* Hero */}
      <section aria-labelledby={`${uid}-h1`} className="sf-grid relative overflow-hidden pb-14 pt-32 lg:pb-16 lg:pt-40">
        <Draw className="absolute right-[12%] top-28 hidden w-16 lg:block" delay={0.8}>
          <Sun />
        </Draw>
        <Draw className="absolute left-[6%] top-[58%] hidden w-10 lg:block" delay={1}>
          <Star color="var(--sf-forest)" />
        </Draw>
        <div className="mx-auto max-w-5xl px-6 text-center sm:px-10">
          <span className="sf-hand text-2xl text-[var(--sf-forest)]" aria-hidden="true">
            have a look around ↓
          </span>
          <h1 id={`${uid}-h1`} className="sf-display mt-3 text-[11vw] leading-[0.9] text-[var(--sf-ink)] sm:text-7xl lg:text-[5.4rem] xl:text-[6rem]">
            <WordsReveal as="span" text={COPY.headlineLead} immediate className="block" />
            <span className="relative isolate inline-block text-[var(--sf-clay)]">
              <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.6}>
                <Squiggle className="h-5 w-full" color="var(--sf-butter)" />
              </Draw>
              <WordsReveal as="span" text={COPY.headlineAccent} immediate delay={0.25} />
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg font-semibold leading-relaxed text-[var(--sf-soft)]">{COPY.body}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
              Book a Demo
            </a>
            <a href="#app" className={btnOutline}>
              See the app
            </a>
          </div>
        </div>
      </section>

      {/* Role tabs */}
      <section aria-label={COPY.filterLabel} className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div
            role="tablist"
            aria-label={COPY.filterLabel}
            className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border-2 border-[var(--sf-ink)] bg-white p-1.5 shadow-[0_5px_0_0_var(--sf-ink)] sf-no-scrollbar"
          >
            {ROLE_ORDER.map((r) => {
              const selected = r === role;
              return (
                <button
                  key={r}
                  id={`${uid}-tab-${r}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${uid}-panel-${r}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setRole(r)}
                  onKeyDown={onKeyDown}
                  className={`relative shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2.5 text-[15px] font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 sm:px-6 ${
                    selected ? "text-[var(--sf-ink)]" : "text-[var(--sf-soft)] hover:text-[var(--sf-ink)]"
                  }`}
                >
                  {selected ? (
                    <motion.span
                      layoutId={`${uid}-pill`}
                      className={`absolute inset-0 rounded-full ${ROLE_META[r].bg} ring-2 ring-[var(--sf-ink)]`}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="relative">
                    <span aria-hidden="true">{ROLE_META[r].emoji} </span>
                    {ROLE_META[r].label}
                  </span>
                </button>
              );
            })}
          </div>

          {ROLE_ORDER.map((r) => {
            const group = COPY.groups[r];
            const features = featuresByRole(r);
            return (
              <div
                key={r}
                id={`${uid}-panel-${r}`}
                role="tabpanel"
                aria-labelledby={`${uid}-tab-${r}`}
                hidden={r !== role}
                className={`mt-12 rounded-[44px] ${PANEL_WASH[r]} px-5 py-12 sm:px-10 lg:px-14 lg:py-16`}
              >
                <SectionIntro
                  lead={group.lead}
                  accent={group.accent}
                  accentColor={ACCENT[r]}
                  squiggle="var(--sf-butter)"
                  align="left"
                  headingClassName="text-4xl md:text-6xl"
                  body={<p>{group.body}</p>}
                />
                {r === role ? (
                  <Reveal className="mt-12 grid gap-x-7 gap-y-10 sm:grid-cols-2 xl:grid-cols-3" stagger={0.06} y={36}>
                    {features.map((f, i) => (
                      <div key={f.slug}>
                        <FeatureCard feature={f} index={i} role={r} />
                      </div>
                    ))}
                  </Reveal>
                ) : (
                  <ul className="sr-only">
                    {features.map((f) => (
                      <li key={f.slug}>{f.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* The app */}
      <section id="app" className="scroll-mt-24 overflow-hidden bg-[var(--sf-paper)] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <SectionIntro
              lead={COPY.appLead}
              accent={COPY.appAccent}
              accentColor="text-[var(--sf-forest)]"
              squiggle="var(--sf-mint)"
              align="left"
              body={<p>{COPY.appBody}</p>}
            />
            <MobileAppDownloadBadges />
          </div>
          <Reveal className="sf-no-scrollbar -mx-6 mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 pt-4 [scroll-padding-inline:1.5rem] sm:-mx-10 sm:px-10 sm:[scroll-padding-inline:2.5rem] lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0" stagger={0.08} y={40}>
            {DOWNLOAD_APP_SLIDES.slice(0, 5).map((slide, i) => (
              <div key={slide.src} className="w-[58vw] max-w-[230px] shrink-0 snap-start lg:w-auto lg:max-w-none">
                <PhoneCard slide={slide} tilt={i % 2 ? 2 : -2} tape={TAPES[i % TAPES.length]} sizes="(min-width: 1024px) 220px, 58vw" />
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <GardenFaq items={FEATURES_FAQ} copy={COPY.faq} idPrefix="features-faq" />
      <GardenBookDemo />
    </HomeGardenShell>
  );
}
