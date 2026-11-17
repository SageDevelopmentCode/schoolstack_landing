"use client";

import type { DemoValuePillarsSection } from "@/data/school-demos/types";
import DemoIcon from "./DemoIcon";
import {
  SITE_BODY,
  SITE_CARD,
  SITE_CONTAINER,
  SITE_H3,
  SITE_ICON_RING,
  SITE_SECTION,
  SITE_STRAIGHTEN,
  SITE_TINT_BG,
  tiltAt,
} from "./site-garden-theme";
import { SiteIndex, SiteReveal, SiteSectionIntro } from "./garden/SiteKit";

const GRID_COLS: Record<number, string> = {
  2: "@3xl/site:grid-cols-2",
  3: "@3xl/site:grid-cols-3",
  4: "@3xl/site:grid-cols-2 @6xl/site:grid-cols-4",
  5: "@3xl/site:grid-cols-6",
  6: "@3xl/site:grid-cols-3",
};

/** Five pillars: a 3 + 2 layout on a six-column grid so both rows fill. */
function tileSpan(i: number, count: number) {
  if (count !== 5) return "";
  return i < 3 ? "@3xl/site:col-span-2" : "@3xl/site:col-span-3";
}

/** Pastel index cards; the first one is the school-tinted "headline" value. */
export default function ValuePillarsSection({ section }: { section: DemoValuePillarsSection }) {
  const count = section.pillars.length;

  return (
    <section id="signature" className={`scroll-mt-[88px] ${SITE_SECTION}`}>
      <div className={SITE_CONTAINER}>
        <SiteSectionIntro eyebrow={section.eyebrow} heading={section.heading} subtitle={section.tagline} align="split" />

        <ul className={`mt-14 grid gap-5 ${GRID_COLS[count] ?? "@3xl/site:grid-cols-3"}`}>
          {section.pillars.map((pillar, i) => (
            <SiteReveal key={pillar.title} as="li" delay={i * 0.07} className={tileSpan(i, count)}>
              <div
                className={`flex h-full min-h-[240px] flex-col p-6 ${SITE_CARD} ${i === 0 ? "bg-[var(--sf-butter)]" : SITE_TINT_BG[i % SITE_TINT_BG.length]} ${SITE_STRAIGHTEN}`}
                style={{ rotate: tiltAt(i) }}
              >
                <div className="flex items-center justify-between">
                  <span className={SITE_ICON_RING} aria-hidden>
                    <DemoIcon name={pillar.icon} className="h-5 w-5" />
                  </span>
                  <SiteIndex i={i} />
                </div>
                <h3 className={`${SITE_H3} mt-auto pt-8`}>{pillar.title}</h3>
                <p className={`${SITE_BODY} mt-2 text-[15px] !text-[var(--sf-ink)]/75`}>{pillar.desc}</p>
              </div>
            </SiteReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
