"use client";

import { Tick } from "@/components/garden/ui";
import type { DemoNatureArtJoySection } from "@/data/school-demos/types";
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
import { SiteReveal, SiteSectionIntro } from "./garden/SiteKit";

/** Three tall pastel cards, one per pillar. */
export default function NatureArtJoySection({ section }: { section: DemoNatureArtJoySection }) {
  return (
    <section id="signature" className={`scroll-mt-[88px] ${SITE_SECTION}`}>
      <div className={SITE_CONTAINER}>
        <SiteSectionIntro eyebrow={section.eyebrow} heading={section.heading} align="center" />

        <ul className="mt-14 grid gap-6 @3xl/site:grid-cols-3">
          {section.pillars.map((pillar, i) => (
            <SiteReveal key={pillar.title} as="li" delay={i * 0.08}>
              <div
                className={`relative flex h-full min-h-[300px] flex-col overflow-hidden p-7 ${SITE_CARD} ${SITE_TINT_BG[(i + 1) % SITE_TINT_BG.length]} ${SITE_STRAIGHTEN}`}
                style={{ rotate: tiltAt(i + 1) }}
              >
                <DemoIcon
                  name={pillar.icon}
                  className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-36 text-[var(--sf-ink)]/[0.06]"
                />
                <span className={SITE_ICON_RING} aria-hidden>
                  <DemoIcon name={pillar.icon} className="h-5 w-5" />
                </span>
                <span className="mt-auto w-fit rounded-full border-2 border-[var(--sf-ink)] bg-white px-3 py-1 text-[12px] font-extrabold text-[var(--sf-ink)]">
                  {pillar.label}
                </span>
                <h3 className={`${SITE_H3} mt-4 !text-[1.7rem]`}>{pillar.title}</h3>
                <p className={`${SITE_BODY} relative mt-2 text-[15px] !text-[var(--sf-ink)]/75`}>{pillar.desc}</p>
              </div>
            </SiteReveal>
          ))}
        </ul>

        {section.trustLine ? (
          <p className="mx-auto mt-12 flex w-fit items-center gap-2.5 rounded-full border-2 border-[var(--sf-ink)] bg-white px-5 py-2.5 text-center text-[14px] font-extrabold text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)]">
            <Tick className="h-5 w-5" color="var(--sf-clay)" fill="var(--sf-butter)" />
            {section.trustLine}
          </p>
        ) : null}
      </div>
    </section>
  );
}
