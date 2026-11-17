"use client";

import { Sparkles } from "lucide-react";
import type { DemoLearningModesSection } from "@/data/school-demos/types";
import DemoIcon from "./DemoIcon";
import {
  SITE_BODY,
  SITE_CARD,
  SITE_CONTAINER,
  SITE_EYEBROW,
  SITE_H3,
  SITE_ICON_RING,
  SITE_SECTION,
  SITE_STRAIGHTEN,
  tiltAt,
} from "./site-garden-theme";
import { SiteIndex, SiteReveal, SiteSectionIntro, SiteStickyNote } from "./garden/SiteKit";

/** Index cards for each learning mode, plus a sticky note for the weekly extra. */
export default function LearningModesSection({ section }: { section: DemoLearningModesSection }) {
  return (
    <section id="signature" className={`scroll-mt-[88px] bg-[var(--sf-mint)]/45 ${SITE_SECTION}`}>
      <div className={SITE_CONTAINER}>
        <SiteSectionIntro eyebrow={section.eyebrow} heading={section.heading} subtitle={section.subtitle} align="split" />

        <ul className="mt-14 grid gap-5 @2xl/site:grid-cols-2 @6xl/site:grid-cols-4">
          {section.modes.map((mode, i) => (
            <SiteReveal key={mode.title} as="li" delay={i * 0.07}>
              <div className={`flex h-full flex-col p-6 ${SITE_CARD} ${SITE_STRAIGHTEN}`} style={{ rotate: tiltAt(i) }}>
                <div className="flex items-center justify-between">
                  <span className={SITE_ICON_RING} aria-hidden>
                    <DemoIcon name={mode.icon} className="h-5 w-5" />
                  </span>
                  <SiteIndex i={i} />
                </div>
                <p className={`${SITE_EYEBROW} mt-7`}>{mode.label}</p>
                <h3 className={`${SITE_H3} mt-2`}>{mode.title}</h3>
                <p className={`${SITE_BODY} mt-2 text-[15px]`}>{mode.desc}</p>
              </div>
            </SiteReveal>
          ))}
        </ul>

        {section.flexFriday ? (
          <SiteReveal className="mx-auto mt-14 max-w-[860px]">
            <SiteStickyNote tilt={-1} tape={2} className="!p-7 @3xl/site:!p-9">
              <div className="flex flex-col gap-4 @3xl/site:flex-row @3xl/site:items-center @3xl/site:gap-8">
                <span className={SITE_ICON_RING} aria-hidden>
                  <Sparkles className="h-5 w-5" strokeWidth={2.4} />
                </span>
                <p className="sf-display text-[1.7rem] leading-[1.02] text-[var(--sf-ink)] @3xl/site:w-1/3">
                  {section.flexFriday.title}
                </p>
                <p className="text-[15px] leading-relaxed text-[var(--sf-ink)]/80 @3xl/site:flex-1">
                  {section.flexFriday.desc}
                </p>
              </div>
            </SiteStickyNote>
          </SiteReveal>
        ) : null}
      </div>
    </section>
  );
}
