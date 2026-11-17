"use client";

import { Heart, Sparkles, Sprout, Users, type LucideIcon } from "lucide-react";
import type { DemoMissionSection, DemoParentFitSection } from "@/data/school-demos/types";
import DemoIcon from "../DemoIcon";
import {
  SITE_BODY,
  SITE_CARD,
  SITE_CONTAINER,
  SITE_H3,
  SITE_ICON_RING,
  SITE_STRAIGHTEN,
  SITE_TINT_BG,
  tiltAt,
} from "../site-garden-theme";
import { SiteIndex, SitePolaroid, SiteReveal, SiteSectionIntro, SiteStickyNote } from "../garden/SiteKit";

const FIT_ICONS: LucideIcon[] = [Sprout, Heart, Users, Sparkles];

/** Two polaroids leaning on each other. */
function PhotoPair({ main, secondary }: { main: string; secondary?: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[520px] pb-10 pt-4">
      <SitePolaroid src={main} sizes="(min-width: 1024px) 480px, 85vw" tilt={-2} tape={0} className="w-[88%]" imageClassName="aspect-[4/3]" />
      {secondary ? (
        <div className="absolute -bottom-2 right-0 w-[42%]">
          <SitePolaroid src={secondary} sizes="200px" tilt={6} tape={2} imageClassName="aspect-[4/5]" />
        </div>
      ) : null}
    </div>
  );
}

function ParentFit({ welcome }: { welcome: DemoParentFitSection }) {
  return (
    <div className="grid items-start gap-14 @5xl/site:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] @5xl/site:gap-16">
      <div className="@5xl/site:sticky @5xl/site:top-28">
        <SiteSectionIntro eyebrow={welcome.eyebrow} heading={welcome.heading} />
        <SiteReveal className="mt-10" delay={0.1}>
          <PhotoPair main={welcome.mainImage} secondary={welcome.secondaryImage} />
        </SiteReveal>
      </div>
      <ul className="grid gap-5 @3xl/site:grid-cols-2">
        {welcome.cards.map((card, i) => {
          const Icon = FIT_ICONS[i % FIT_ICONS.length];
          return (
            <SiteReveal key={card.title} as="li" delay={i * 0.07}>
              <div
                className={`flex h-full flex-col p-6 ${SITE_CARD} ${SITE_TINT_BG[i % SITE_TINT_BG.length]} ${SITE_STRAIGHTEN}`}
                style={{ rotate: tiltAt(i) }}
              >
                <div className="flex items-center justify-between">
                  <span className={SITE_ICON_RING} aria-hidden>
                    <Icon className="h-5 w-5" strokeWidth={2.4} />
                  </span>
                  <SiteIndex i={i} />
                </div>
                <h3 className={`${SITE_H3} mt-6`}>{card.title}</h3>
                <p className={`${SITE_BODY} mt-2 text-[15px] !text-[var(--sf-ink)]/75`}>{card.desc}</p>
              </div>
            </SiteReveal>
          );
        })}
      </ul>
    </div>
  );
}

function Mission({ welcome }: { welcome: DemoMissionSection }) {
  return (
    <div className="grid items-center gap-14 @5xl/site:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @5xl/site:gap-16">
      <div>
        <SiteSectionIntro eyebrow={welcome.eyebrow} heading={welcome.heading} accent={welcome.headingAccent} />
        <SiteReveal className="mt-6 space-y-4" delay={0.1}>
          {welcome.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className={SITE_BODY}>
              {p}
            </p>
          ))}
        </SiteReveal>
        {welcome.statBadge || welcome.floatBadge ? (
          <SiteReveal className="mt-8 flex flex-wrap gap-4" delay={0.15}>
            {welcome.statBadge ? (
              <div className={`px-5 py-4 ${SITE_CARD} bg-[var(--sf-mint)]`}>
                <span className="sf-display block text-[clamp(2rem,3.4cqw,2.8rem)] leading-none text-[var(--sf-ink)]">
                  {welcome.statBadge.value}
                </span>
                <span className="mt-1.5 block text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-ink)]/70">
                  {welcome.statBadge.label}
                </span>
              </div>
            ) : null}
            {welcome.floatBadge ? (
              <div className={`flex items-center gap-3 px-5 py-4 ${SITE_CARD} bg-[var(--sf-sky)]`}>
                <span className={SITE_ICON_RING} aria-hidden>
                  <DemoIcon name={welcome.floatBadge.icon} className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[16px] font-extrabold text-[var(--sf-ink)]">{welcome.floatBadge.title}</span>
                  <span className="block text-[14px] text-[var(--sf-ink)]/70">{welcome.floatBadge.subtitle}</span>
                </span>
              </div>
            ) : null}
          </SiteReveal>
        ) : null}
      </div>

      <SiteReveal className="relative" delay={0.1}>
        <PhotoPair main={welcome.mainImage} secondary={welcome.secondaryImage} />
        <SiteStickyNote tilt={-2.5} tape={3} className="relative -mt-4 ml-auto max-w-[400px] @3xl/site:-mt-10 @3xl/site:mr-4">
          <figure>
            <blockquote className="text-[17px] font-bold leading-snug text-[var(--sf-ink)]">
              &ldquo;{welcome.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-3 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-ink)]/70">
              {welcome.quoteAttribution}
            </figcaption>
          </figure>
        </SiteStickyNote>
      </SiteReveal>
    </div>
  );
}

export default function SiteWelcomeBento({
  welcome,
}: {
  welcome: DemoMissionSection | DemoParentFitSection;
}) {
  return (
    <section id="welcome" className="scroll-mt-[88px] pb-20 pt-24 @3xl/site:pb-28 @3xl/site:pt-32">
      <div className={SITE_CONTAINER}>
        {welcome.type === "mission" ? <Mission welcome={welcome} /> : <ParentFit welcome={welcome} />}
      </div>
    </section>
  );
}
