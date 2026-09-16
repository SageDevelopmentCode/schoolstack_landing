"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "./DemoWebsiteButton";
import DemoWebsiteSectionKicker from "./DemoWebsiteSectionKicker";

const STORY_EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  config: SchoolWebsiteDemoConfig;
  heroSectionRef: RefObject<HTMLElement | null>;
  showAnnouncementBar: boolean;
  onNavLinkClick: (index: number) => void;
  onDiscoveryCallClick: () => void;
  onSecondaryCtaClick: () => void;
  onScrollToTop: () => void;
};

export default function DemoWebsiteStoryHero({
  config,
  heroSectionRef,
  showAnnouncementBar,
  onNavLinkClick,
  onDiscoveryCallClick,
  onSecondaryCtaClick,
  onScrollToTop,
}: Props) {
  const { hero } = config;

  return (
    <>
      {showAnnouncementBar && (
        <div
          className="relative z-30 w-full py-2.5 px-4 text-center text-[11px] sm:text-xs font-secondary font-semibold uppercase tracking-[0.12em]"
          style={{
            backgroundColor: "var(--demo-cream)",
            color: "var(--demo-ink)",
            borderBottom: "1px solid var(--demo-line)",
          }}
        >
          {hero.eyebrow}
        </div>
      )}

      <section
        ref={heroSectionRef}
        className="relative overflow-hidden px-6 sm:px-10 lg:px-14 pt-6 pb-12 sm:pb-16"
        style={{ backgroundColor: "var(--demo-paper)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div
            className="flex items-center justify-between gap-4 rounded-[var(--demo-radius-card)] border px-4 py-3 sm:px-5"
            style={{
              backgroundColor: "var(--demo-cream)",
              borderColor: "var(--demo-line)",
              boxShadow: "var(--demo-shadow-card)",
            }}
          >
            <button type="button" onClick={onScrollToTop} className="cursor-pointer">
              <SchoolDemoWordmark logo={config.logo} className="h-9 w-auto object-contain" />
            </button>
            <nav className="hidden md:flex items-center gap-6">
              {hero.navLinks.map((item, i) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onNavLinkClick(i)}
                  className="font-secondary text-sm font-semibold transition-colors duration-200 cursor-pointer"
                  style={{ color: "var(--demo-muted)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--demo-ink)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--demo-muted)";
                  }}
                >
                  {item}
                </button>
              ))}
            </nav>
            <DemoWebsiteButton
              variant="primary"
              className="px-4 py-2 text-sm"
              onClick={onDiscoveryCallClick}
            >
              {hero.navCta}
            </DemoWebsiteButton>
          </div>

          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="min-w-0">
              {!showAnnouncementBar && hero.eyebrow ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: STORY_EASE }}
                  className="mb-5"
                >
                  <DemoWebsiteSectionKicker>{hero.eyebrow}</DemoWebsiteSectionKicker>
                </motion.div>
              ) : null}

              <motion.h1
                className={
                  hero.headlineClassName ??
                  "text-4xl md:text-[3.1rem] font-bold font-heading leading-[1.08] mb-5"
                }
                style={{ color: "var(--demo-ink)" }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.65, ease: STORY_EASE }}
              >
                {hero.headline.map((line, i) => (
                  <span
                    key={line}
                    className={
                      hero.headlineAccentLine === i
                        ? (hero.headlineAccentClassName ?? "text-[var(--demo-primary)]")
                        : undefined
                    }
                  >
                    {line}
                    {i < hero.headline.length - 1 && <br />}
                  </span>
                ))}
              </motion.h1>

              {hero.tagline ? (
                <motion.p
                  className="text-sm font-semibold font-heading tracking-wide mb-4"
                  style={{ color: "var(--demo-primary)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                >
                  {hero.tagline}
                </motion.p>
              ) : null}

              <motion.p
                className="text-base md:text-lg font-secondary leading-relaxed mb-8 max-w-lg"
                style={{ color: "var(--demo-muted)" }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.55, ease: STORY_EASE }}
              >
                {hero.subheadline}
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.55, ease: STORY_EASE }}
              >
                <DemoWebsiteButton variant="primary" onClick={onDiscoveryCallClick}>
                  {hero.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </DemoWebsiteButton>
                <DemoWebsiteButton variant="soft" onClick={onSecondaryCtaClick}>
                  {hero.secondaryCta}
                </DemoWebsiteButton>
              </motion.div>

              {hero.trustBadges && hero.trustBadges.length > 0 ? (
                <motion.div
                  className="mt-8 flex flex-wrap items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.62, duration: 0.5, ease: STORY_EASE }}
                >
                  {hero.trustBadges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold font-secondary"
                      style={{
                        backgroundColor: "var(--demo-cream)",
                        borderColor: "var(--demo-line)",
                        color: "var(--demo-ink)",
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </motion.div>
              ) : null}
            </div>

            <motion.div
              className="relative mx-auto w-full max-w-xl lg:max-w-none"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.7, ease: STORY_EASE }}
            >
              <div
                className="relative aspect-[4/5] max-h-[520px] overflow-hidden border"
                style={{
                  borderRadius: "var(--demo-radius-card)",
                  borderColor: "color-mix(in srgb, var(--demo-primary) 18%, var(--demo-line))",
                  boxShadow: "var(--demo-shadow-card)",
                }}
              >
                <Image
                  src={hero.backgroundImage}
                  fill
                  className="object-cover"
                  alt={hero.imageAlt}
                  priority
                />
              </div>

              {hero.floatingImages[0] ? (
                <motion.div
                  className="absolute -bottom-6 -left-4 hidden h-36 w-28 overflow-hidden border-4 border-white shadow-lg sm:block md:h-44 md:w-32"
                  style={{
                    borderRadius: "calc(var(--demo-radius-card) - 6px)",
                    rotate: -3,
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.6, ease: STORY_EASE }}
                >
                  <Image src={hero.floatingImages[0]} fill className="object-cover" alt="" />
                </motion.div>
              ) : null}

              {hero.floatingImages[1] ? (
                <motion.div
                  className="absolute -top-4 right-0 hidden h-28 w-24 overflow-hidden border-4 border-white shadow-lg md:block lg:right-6 lg:h-32 lg:w-28"
                  style={{
                    borderRadius: "calc(var(--demo-radius-card) - 8px)",
                    rotate: 4,
                  }}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6, ease: STORY_EASE }}
                >
                  <Image src={hero.floatingImages[1]} fill className="object-cover" alt="" />
                </motion.div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
