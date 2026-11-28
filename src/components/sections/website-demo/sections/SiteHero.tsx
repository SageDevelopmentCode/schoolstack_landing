"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Star, Tape, Tick } from "@/components/garden/ui";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "../DemoWebsiteButton";
import {
  SITE_CONTAINER,
  SITE_EASE,
  SITE_LEAD,
  SITE_SQUIGGLE_MAX_CHARS,
  siteHeroH1Class,
} from "../site-garden-theme";
import { keepHyphenated, SitePill, SitePolaroid, SiteSquiggleAccent, SiteStickyNote } from "../garden/SiteKit";
import SiteNavBar from "./SiteNavBar";

type Props = {
  config: SchoolWebsiteDemoConfig;
  heroRef: RefObject<HTMLElement | null>;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  isWide: boolean;
  activeNav: number;
  onNavLinkClick: (index: number) => void;
  onCtaClick: () => void;
  onSecondaryCtaClick: () => void;
  onScrollToTop: () => void;
};

/**
 * Hero: copy on dot-grid paper beside a taped photo collage with sticky-note stats.
 * Colours come from the site mood (`--sf-hero-*`, see `siteGardenScopeStyle`):
 * tinted cream, the school's dark colour, or a wash of its primary colour.
 */
export default function SiteHero({
  config,
  heroRef,
  activeNav,
  onNavLinkClick,
  onCtaClick,
  onSecondaryCtaClick,
  onScrollToTop,
}: Props) {
  const { hero, stats } = config;
  const reduce = useReducedMotion();
  const showAnnouncementBar = hero.eyebrowPlacement === "announcementBar" && Boolean(hero.eyebrow);
  const accentLine = hero.headlineAccentLine ?? hero.headline.length - 1;
  const h1Class = hero.headlineClassName || siteHeroH1Class(hero.headline);
  const [stickerA, stickerB] = stats;

  // The frame lands first, then the copy follows (Garden hero timing).
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.7, ease: SITE_EASE },
  });
  const drop = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: -24, scale: 0.94 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { delay, type: "spring" as const, stiffness: 260, damping: 20 },
  });

  return (
    <>
      {showAnnouncementBar ? (
        <div className="relative z-30 w-full border-b-2 border-dashed border-[var(--sf-ink)]/25 bg-[var(--sf-butter)] px-4 py-2.5 text-center text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-ink)] @2xl/site:text-[13px]">
          {hero.eyebrow}
        </div>
      ) : null}

      <section
        ref={heroRef}
        className="sf-grid relative overflow-hidden bg-[var(--sf-hero-bg)] pb-28 pt-4 [--sf-dot:var(--sf-hero-dot)] @3xl/site:pb-36 @3xl/site:pt-5"
      >
        <div
          className="pointer-events-none absolute -right-[12%] top-[14%] hidden aspect-square w-[58%] max-w-[760px] rounded-full bg-[var(--sf-hero-blob)] @5xl/site:block"
          aria-hidden
        />
        <div className={`relative ${SITE_CONTAINER}`}>
          <SiteNavBar
            config={config}
            activeNav={activeNav}
            onNavLinkClick={onNavLinkClick}
            onCtaClick={onCtaClick}
            onScrollToTop={onScrollToTop}
          />

          <div className="mt-12 grid grid-cols-1 items-center gap-16 @3xl/site:mt-16 @5xl/site:grid-cols-[1.05fr_1fr] @5xl/site:gap-10">
            <div className="relative min-w-0">
              <Star
                className="pointer-events-none absolute -left-2 -top-10 hidden h-9 w-9 @5xl/site:block"
                color="var(--sf-school-primary)"
              />
              {!showAnnouncementBar && hero.eyebrow ? (
                <motion.div {...rise(0.25)}>
                  <SitePill>{hero.eyebrow}</SitePill>
                </motion.div>
              ) : hero.tagline ? (
                <motion.div {...rise(0.25)}>
                  <SitePill>{hero.tagline}</SitePill>
                </motion.div>
              ) : null}

              <motion.h1 className={`${h1Class} mt-6 text-balance text-[var(--sf-hero-ink)]`} {...rise(0.35)}>
                {hero.headline.map((line, i) => (
                  <span key={line}>
                    {i !== accentLine ? (
                      keepHyphenated(line)
                    ) : line.length <= SITE_SQUIGGLE_MAX_CHARS ? (
                      <SiteSquiggleAccent
                        className="text-[var(--sf-hero-accent)]"
                        squiggleColor="var(--sf-hero-squiggle)"
                      >
                        {line}
                      </SiteSquiggleAccent>
                    ) : (
                      // Long accent lines wrap, so a marker swipe instead of a one-piece squiggle.
                      <span className="text-[var(--sf-hero-accent)] [box-decoration-break:clone] bg-[linear-gradient(transparent_66%,var(--sf-hero-marker)_66%)]">
                        {keepHyphenated(line)}
                      </span>
                    )}
                    {i < hero.headline.length - 1 ? " " : null}
                  </span>
                ))}
              </motion.h1>

              {hero.tagline && !showAnnouncementBar && hero.eyebrow ? (
                <motion.p className="mt-6 text-[16px] font-extrabold text-[var(--sf-hero-accent)]" {...rise(0.45)}>
                  {hero.tagline}
                </motion.p>
              ) : null}

              <motion.p className={`${SITE_LEAD} mt-5 max-w-[560px] !text-[var(--sf-hero-soft)] @3xl/site:!text-[19px]`} {...rise(0.5)}>
                {hero.subheadline}
              </motion.p>

              <motion.div className="mt-9 flex flex-wrap items-center gap-4" {...rise(0.6)}>
                <DemoWebsiteButton
                  variant="primary"
                  className="!h-14 !bg-[var(--sf-hero-btn)] !px-7 !text-[16px] !text-[var(--sf-hero-on-btn)]"
                  onClick={onCtaClick}
                >
                  {hero.primaryCta}
                  <ArrowRight className="h-4 w-4" strokeWidth={2.6} aria-hidden />
                </DemoWebsiteButton>
                <DemoWebsiteButton variant="outline" className="!h-14 !px-7 !text-[16px]" onClick={onSecondaryCtaClick}>
                  {hero.secondaryCta}
                </DemoWebsiteButton>
              </motion.div>

              {hero.trustBadges && hero.trustBadges.length > 0 ? (
                <motion.ul className="mt-9 flex flex-wrap gap-x-5 gap-y-2.5" {...rise(0.7)}>
                  {hero.trustBadges.map((badge) => (
                    <li key={badge} className="flex items-center gap-2 text-[14px] font-extrabold text-[var(--sf-hero-ink)]">
                      <Tick className="h-5 w-5" color="var(--sf-hero-accent)" fill="var(--sf-butter)" />
                      {badge}
                    </li>
                  ))}
                </motion.ul>
              ) : null}
            </div>

            <div className="relative mx-auto h-[440px] w-full max-w-[600px] @3xl/site:h-[560px]">
              <motion.div className="absolute right-2 top-2 h-[82%] w-[80%]" {...drop(0.05)}>
                <div
                  className="relative h-full w-full rounded-[30px] border-2 border-[var(--sf-ink)] bg-white p-2.5 shadow-[0_10px_0_0_var(--sf-ink)] transition-[rotate] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0"
                  style={{ rotate: "1.6deg" }}
                >
                  <Tape color="var(--sf-butter)" className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3" />
                  <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-[var(--sf-cream)]">
                    <Image
                      src={hero.backgroundImage}
                      fill
                      preload
                      sizes="(min-width: 1024px) 520px, 90vw"
                      className="object-cover"
                      alt={hero.imageAlt}
                    />
                  </div>
                </div>
              </motion.div>

              {hero.floatingImages[0] ? (
                <motion.div className="absolute bottom-0 left-0 w-[40%]" {...drop(0.2)}>
                  <SitePolaroid
                    src={hero.floatingImages[0]}
                    sizes="240px"
                    tilt={-6}
                    tape={1}
                    imageClassName="aspect-square"
                  />
                </motion.div>
              ) : null}

              {hero.floatingImages[1] ? (
                <motion.div className="absolute -right-2 bottom-[2%] hidden w-[27%] @2xl/site:block" {...drop(0.3)}>
                  <SitePolaroid
                    src={hero.floatingImages[1]}
                    sizes="180px"
                    tilt={7}
                    tape={2}
                    imageClassName="aspect-[4/5]"
                  />
                </motion.div>
              ) : null}

              {stickerA ? (
                <motion.div className="absolute left-[2%] top-[8%] max-w-[190px]" {...drop(0.45)}>
                  <SiteStickyNote tilt={-4} tape={false} className="!p-4">
                    <span className="sf-display block text-[1.6rem] leading-none text-[var(--sf-ink)]">
                      {stickerA.value}
                    </span>
                    <span className="mt-1.5 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-ink)]/70">
                      {stickerA.label}
                    </span>
                  </SiteStickyNote>
                </motion.div>
              ) : null}

              {stickerB ? (
                <motion.div className="absolute bottom-[20%] right-[30%] hidden max-w-[190px] @2xl/site:block" {...drop(0.55)}>
                  <SiteStickyNote tilt={3} tint="bg-[var(--sf-mint)]" tape={false} className="!p-4">
                    <span className="sf-display block text-[1.6rem] leading-none text-[var(--sf-ink)]">
                      {stickerB.value}
                    </span>
                    <span className="mt-1.5 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-ink)]/70">
                      {stickerB.label}
                    </span>
                  </SiteStickyNote>
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
