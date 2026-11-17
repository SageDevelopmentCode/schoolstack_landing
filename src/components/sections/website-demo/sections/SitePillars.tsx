"use client";

import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoIcon from "../DemoIcon";
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
} from "../site-garden-theme";
import { SiteIndex, SiteReveal, SiteSectionIntro } from "../garden/SiteKit";

const GRID_COLS: Record<number, string> = {
  1: "",
  2: "@3xl/site:grid-cols-2",
  3: "@3xl/site:grid-cols-3",
};

/** Pastel index cards for the core pillars; columns follow the item count so rows fill. */
export default function SitePillars({ pillars }: { pillars: SchoolWebsiteDemoConfig["pillars"] }) {
  const count = pillars.items.length;
  if (count === 0) return null;

  return (
    <section className={`bg-[var(--sf-butter)]/35 ${SITE_SECTION}`}>
      <div className={SITE_CONTAINER}>
        <SiteSectionIntro align="split" eyebrow={pillars.eyebrow} heading={pillars.heading} subtitle={pillars.subtitle} />
        <ul className={`mt-14 grid grid-cols-1 gap-5 ${GRID_COLS[count] ?? "@3xl/site:grid-cols-2 @6xl/site:grid-cols-4"}`}>
          {pillars.items.map((pillar, i) => (
            <SiteReveal key={pillar.title} as="li" delay={i * 0.08}>
              <div
                className={`flex h-full min-h-[260px] flex-col justify-between p-6 ${SITE_CARD} ${i % 2 === 0 ? "bg-white" : SITE_TINT_BG[(i + 1) % SITE_TINT_BG.length]} ${SITE_STRAIGHTEN}`}
                style={{ rotate: tiltAt(i + 2) }}
              >
                <div className="flex items-center justify-between">
                  <span className={SITE_ICON_RING} aria-hidden>
                    <DemoIcon name={pillar.icon} className="h-5 w-5" />
                  </span>
                  <SiteIndex i={i} />
                </div>
                <div className="mt-10">
                  <h3 className={SITE_H3}>{pillar.title}</h3>
                  <p className={`${SITE_BODY} mt-2 text-[15px] !text-[var(--sf-ink)]/75`}>{pillar.desc}</p>
                </div>
              </div>
            </SiteReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
