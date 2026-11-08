"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, Sparkles, Users } from "lucide-react";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "../DemoWebsiteButton";
import DemoWebsiteSectionKicker from "../DemoWebsiteSectionKicker";
import {
  DEMO_ACCENT_HIGHLIGHT,
  DEMO_BODY,
  DEMO_CHIP,
  DEMO_CONTAINER,
  DEMO_H1,
  DEMO_INK,
  DEMO_STICKER,
  STORY_EASE,
} from "../bright-demo-theme";
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

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: STORY_EASE },
});

export default function SiteHero({
  config,
  heroRef,
  scrollContainerRef,
  isWide,
  activeNav,
  onNavLinkClick,
  onCtaClick,
  onSecondaryCtaClick,
  onScrollToTop,
}: Props) {
  const { hero, stats } = config;
  const reduceMotion = useReducedMotion();
  const parallax = isWide && !reduceMotion;
  const showAnnouncementBar = hero.eyebrowPlacement === "announcementBar" && Boolean(hero.eyebrow);

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const mainY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const leftY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const rightY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const accentLine = hero.headlineAccentLine ?? hero.headline.length - 1;
  const [stickerA, stickerB] = stats;

  return (
    <>
      {showAnnouncementBar ? (
        <div className="font-secondary relative z-30 w-full bg-[var(--demo-ink)] px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white/85 @2xl/site:text-xs">
          {hero.eyebrow}
        </div>
      ) : null}

      <section ref={heroRef} className="relative overflow-hidden bg-white pb-28 pt-4 @3xl/site:pb-36 @3xl/site:pt-5">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-40 top-40 h-[420px] w-[420px] rounded-full bg-[var(--demo-blob-c)] opacity-70 blur-[110px]" />
          <div className="absolute -right-24 top-10 h-[520px] w-[520px] rounded-full bg-[var(--demo-blob-a)] opacity-60 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 h-[360px] w-[620px] rounded-full bg-[var(--demo-blob-b)] opacity-70 blur-[120px]" />
        </div>

        <div className={`relative ${DEMO_CONTAINER}`}>
          <SiteNavBar
            config={config}
            activeNav={activeNav}
            onNavLinkClick={onNavLinkClick}
            onCtaClick={onCtaClick}
            onScrollToTop={onScrollToTop}
          />

          <div className="mt-12 grid grid-cols-1 items-center gap-14 @3xl/site:mt-16 @5xl/site:grid-cols-[1.02fr_1fr] @5xl/site:gap-12">
            <div className="min-w-0">
              {!showAnnouncementBar && hero.eyebrow ? (
                <motion.div {...rise(0.05)}>
                  <span className={`${DEMO_CHIP} py-2 shadow-sm`}>
                    <span className="relative flex h-2 w-2" aria-hidden>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--demo-primary)] opacity-50 motion-reduce:animate-none" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--demo-primary)]" />
                    </span>
                    {hero.eyebrow}
                  </span>
                </motion.div>
              ) : hero.tagline ? (
                <motion.div {...rise(0.05)}>
                  <DemoWebsiteSectionKicker>{hero.tagline}</DemoWebsiteSectionKicker>
                </motion.div>
              ) : null}

              <motion.h1 className={hero.headlineClassName ?? `${DEMO_H1} ${DEMO_INK} mt-6 text-balance`} {...rise(0.15)}>
                {hero.headline.map((line, i) => (
                  <span key={line}>
                    {i === accentLine ? (
                      <span className={hero.headlineAccentClassName ?? DEMO_ACCENT_HIGHLIGHT}>{line}</span>
                    ) : (
                      line
                    )}
                    {i < hero.headline.length - 1 ? " " : null}
                  </span>
                ))}
              </motion.h1>

              {hero.tagline && !showAnnouncementBar && hero.eyebrow ? (
                <motion.p
                  className="font-secondary mt-5 text-[15px] font-semibold text-[var(--demo-accent)]"
                  {...rise(0.22)}
                >
                  {hero.tagline}
                </motion.p>
              ) : null}

              <motion.p className={`${DEMO_BODY} mt-5 max-w-[560px] text-[17px] @3xl/site:text-[19px]`} {...rise(0.28)}>
                {hero.subheadline}
              </motion.p>

              <motion.div className="mt-9 flex flex-wrap items-center gap-3" {...rise(0.36)}>
                <DemoWebsiteButton variant="primary" onClick={onCtaClick}>
                  {hero.primaryCta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </DemoWebsiteButton>
                <DemoWebsiteButton variant="outline" onClick={onSecondaryCtaClick}>
                  {hero.secondaryCta}
                </DemoWebsiteButton>
              </motion.div>

              {hero.trustBadges && hero.trustBadges.length > 0 ? (
                <motion.ul className="mt-9 flex flex-wrap gap-x-5 gap-y-2.5" {...rise(0.44)}>
                  {hero.trustBadges.map((badge) => (
                    <li key={badge} className="font-secondary flex items-center gap-2 text-[14px] font-medium text-[var(--demo-ink)]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--demo-tint-1)] text-[var(--demo-accent)]" aria-hidden>
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {badge}
                    </li>
                  ))}
                </motion.ul>
              ) : null}
            </div>

            <motion.div
              className="relative mx-auto h-[420px] w-full max-w-[600px] @3xl/site:h-[560px]"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: STORY_EASE }}
            >
              <div
                className="absolute right-0 top-4 h-[88%] w-[84%] rotate-3 rounded-[40px] bg-[var(--demo-tint-1)] ring-1 ring-black/[0.04]"
                aria-hidden
              />
              <motion.div
                className="absolute right-3 top-0 h-[86%] w-[80%] overflow-hidden rounded-[36px] shadow-[var(--demo-shadow-float)] ring-1 ring-black/[0.06]"
                style={parallax ? { y: mainY } : undefined}
              >
                <Image src={hero.backgroundImage} fill priority sizes="(min-width: 1024px) 560px, 90vw" className="object-cover" alt={hero.imageAlt} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              </motion.div>

              {hero.floatingImages[0] ? (
                <motion.div
                  className="absolute bottom-2 left-0 h-[40%] w-[38%] -rotate-[5deg] overflow-hidden rounded-[26px] border-[6px] border-white shadow-[var(--demo-shadow-float)]"
                  style={parallax ? { y: leftY } : undefined}
                >
                  <Image src={hero.floatingImages[0]} fill sizes="240px" className="object-cover" alt="" />
                </motion.div>
              ) : null}

              {hero.floatingImages[1] ? (
                <motion.div
                  className="absolute -right-1 bottom-[4%] hidden h-[26%] w-[26%] rotate-[6deg] overflow-hidden rounded-[22px] border-[5px] border-white shadow-[var(--demo-shadow-float)] @2xl/site:block"
                  style={parallax ? { y: rightY } : undefined}
                >
                  <Image src={hero.floatingImages[1]} fill sizes="180px" className="object-cover" alt="" />
                </motion.div>
              ) : null}

              {stickerA ? (
                <motion.div
                  className={`${DEMO_STICKER} absolute left-[6%] top-[10%] flex items-center gap-3`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6, ease: STORY_EASE }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--demo-tint-1)] text-[var(--demo-accent)]" aria-hidden>
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="font-secondary block text-[17px] font-bold leading-none tracking-[-0.02em] text-[var(--demo-ink)]">
                      {stickerA.value}
                    </span>
                    <span className="font-secondary mt-1 block text-[11px] font-semibold uppercase tracking-wider text-[var(--demo-muted)]">
                      {stickerA.label}
                    </span>
                  </span>
                </motion.div>
              ) : null}

              {stickerB ? (
                <motion.div
                  className={`${DEMO_STICKER} absolute bottom-[16%] right-[30%] hidden items-center gap-3 @2xl/site:flex`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.6, ease: STORY_EASE }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--demo-ink)] text-white" aria-hidden>
                    <Users className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="font-secondary block text-[17px] font-bold leading-none tracking-[-0.02em] text-[var(--demo-ink)]">
                      {stickerB.value}
                    </span>
                    <span className="font-secondary mt-1 block text-[11px] font-semibold uppercase tracking-wider text-[var(--demo-muted)]">
                      {stickerB.label}
                    </span>
                  </span>
                </motion.div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
