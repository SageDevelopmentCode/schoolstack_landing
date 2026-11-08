"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Quote, Sparkles, Sprout, Users, type LucideIcon } from "lucide-react";
import type { DemoMissionSection, DemoParentFitSection } from "@/data/school-demos/types";
import DemoIcon from "../DemoIcon";
import {
  DEMO_BODY,
  DEMO_CONTAINER,
  DEMO_H3,
  DEMO_INK,
  DEMO_TILE,
  DEMO_TINTS,
  STORY_EASE,
} from "../bright-demo-theme";
import SiteSectionHeader from "./SiteSectionHeader";

const FIT_ICONS: LucideIcon[] = [Sprout, Heart, Users, Sparkles];

/** Checkerboard widths beside the 5-column photo tile. */
const FIT_TILE_SPANS = [
  "@5xl/site:col-span-4",
  "@5xl/site:col-span-3",
  "@5xl/site:col-span-3",
  "@5xl/site:col-span-4",
] as const;

const tileMotion = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay: i * 0.07, ease: STORY_EASE },
});

function PhotoTile({
  main,
  secondary,
  caption,
  className = "",
}: {
  main: string;
  secondary?: string;
  caption?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={`relative min-h-[360px] overflow-hidden rounded-[32px] ring-1 ring-black/[0.06] ${className}`}
      {...tileMotion(0)}
    >
      <Image src={main} fill sizes="(min-width: 1024px) 560px, 90vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" alt="" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
      {secondary ? (
        <div className="absolute right-5 top-5 h-28 w-24 rotate-[5deg] overflow-hidden rounded-[18px] border-4 border-white shadow-lg @3xl/site:h-36 @3xl/site:w-32">
          <Image src={secondary} fill sizes="160px" className="object-cover" alt="" />
        </div>
      ) : null}
      {caption ? (
        <p className="font-secondary absolute inset-x-6 bottom-6 text-[clamp(1.1rem,1.8cqw,1.5rem)] font-bold leading-snug tracking-[-0.02em] text-white">
          {caption}
        </p>
      ) : null}
    </motion.div>
  );
}

function ParentFitBento({ welcome }: { welcome: DemoParentFitSection }) {
  return (
    <>
      <SiteSectionHeader eyebrow={welcome.eyebrow} heading={welcome.heading} />
      <div className="mt-12 grid grid-cols-1 gap-4 @3xl/site:grid-cols-2 @5xl/site:grid-cols-12">
        <PhotoTile
          main={welcome.mainImage}
          secondary={welcome.secondaryImage}
          className="@3xl/site:col-span-2 @5xl/site:col-span-5 @5xl/site:row-span-2"
        />
        {welcome.cards.map((card, i) => {
          const Icon = FIT_ICONS[i % FIT_ICONS.length];
          return (
            <motion.div
              key={card.title}
              className={`${DEMO_TILE} flex min-h-[210px] flex-col justify-between ${FIT_TILE_SPANS[i % FIT_TILE_SPANS.length]}`}
              style={{ backgroundColor: DEMO_TINTS[i % DEMO_TINTS.length] }}
              {...tileMotion(i + 1)}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--demo-accent)] shadow-sm" aria-hidden>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-secondary text-[13px] font-semibold text-[var(--demo-muted)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-8">
                <h3 className={`${DEMO_H3} ${DEMO_INK}`}>{card.title}</h3>
                <p className={`${DEMO_BODY} mt-2 text-[15px]`}>{card.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

function MissionBento({ welcome }: { welcome: DemoMissionSection }) {
  return (
    <div className="grid grid-cols-1 gap-4 @3xl/site:grid-cols-2 @5xl/site:grid-cols-12">
      <div className="flex flex-col justify-center py-4 @3xl/site:col-span-2 @5xl/site:col-span-5 @5xl/site:pr-6">
        <SiteSectionHeader eyebrow={welcome.eyebrow} heading={welcome.heading} accent={welcome.headingAccent} />
        <div className="mt-6 space-y-4">
          {welcome.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className={DEMO_BODY}>
              {p}
            </p>
          ))}
        </div>
      </div>

      <PhotoTile
        main={welcome.mainImage}
        className="@3xl/site:col-span-2 @5xl/site:col-span-7 @5xl/site:min-h-[480px]"
      />

      <motion.figure
        className={`${DEMO_TILE} bg-[var(--demo-ink)] @3xl/site:col-span-2 @5xl/site:col-span-6`}
        {...tileMotion(1)}
      >
        <Quote className="h-8 w-8 text-white/30" aria-hidden />
        <blockquote className="font-secondary mt-4 text-[clamp(1.1rem,1.7cqw,1.4rem)] font-semibold leading-snug tracking-[-0.01em] text-white">
          &ldquo;{welcome.quote}&rdquo;
        </blockquote>
        <figcaption className="font-secondary mt-5 text-[12px] font-semibold uppercase tracking-wider text-white/55">
          {welcome.quoteAttribution}
        </figcaption>
      </motion.figure>

      {welcome.statBadge ? (
        <motion.div
          className={`${DEMO_TILE} flex flex-col justify-end bg-[var(--demo-tint-1)] @5xl/site:col-span-3`}
          {...tileMotion(2)}
        >
          <span className="font-secondary text-[clamp(2.2rem,4cqw,3.4rem)] font-bold leading-none tracking-[-0.05em] text-[var(--demo-ink)]">
            {welcome.statBadge.value}
          </span>
          <span className="font-secondary mt-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--demo-muted)]">
            {welcome.statBadge.label}
          </span>
        </motion.div>
      ) : null}

      {welcome.floatBadge ? (
        <motion.div
          className={`${DEMO_TILE} flex flex-col justify-between bg-[var(--demo-tint-3)] @5xl/site:col-span-3`}
          {...tileMotion(3)}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--demo-accent)] shadow-sm" aria-hidden>
            <DemoIcon name={welcome.floatBadge.icon} className="h-5 w-5" />
          </span>
          <div className="mt-8">
            <p className={`${DEMO_H3} ${DEMO_INK}`}>{welcome.floatBadge.title}</p>
            <p className={`${DEMO_BODY} mt-1 text-[14px]`}>{welcome.floatBadge.subtitle}</p>
          </div>
        </motion.div>
      ) : (
        <div className="relative hidden min-h-[200px] overflow-hidden rounded-[28px] @5xl/site:col-span-3 @5xl/site:block">
          <Image src={welcome.secondaryImage} fill sizes="320px" className="object-cover" alt="" />
        </div>
      )}
    </div>
  );
}

export default function SiteWelcomeBento({
  welcome,
}: {
  welcome: DemoMissionSection | DemoParentFitSection;
}) {
  return (
    <section id="welcome" className="scroll-mt-[88px] bg-white pb-20 pt-24 @3xl/site:pb-28 @3xl/site:pt-32">
      <div className={DEMO_CONTAINER}>
        {welcome.type === "mission" ? <MissionBento welcome={welcome} /> : <ParentFitBento welcome={welcome} />}
      </div>
    </section>
  );
}
