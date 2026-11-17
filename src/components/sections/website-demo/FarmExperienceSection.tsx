"use client";

import Image from "next/image";
import type { DemoFarmExperienceSection } from "@/data/school-demos/types";
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

const GRID_COLS: Record<number, string> = {
  2: "@3xl/site:grid-cols-2",
  3: "@3xl/site:grid-cols-3",
  4: "@3xl/site:grid-cols-2 @6xl/site:grid-cols-4",
};

/** Postcard-style cards: a photo (or big icon) above the copy. */
export default function FarmExperienceSection({ section }: { section: DemoFarmExperienceSection }) {
  const count = section.paths.length;

  return (
    <section id="signature" className={`scroll-mt-[88px] bg-[var(--sf-mint)]/45 ${SITE_SECTION}`}>
      <div className={SITE_CONTAINER}>
        <SiteSectionIntro eyebrow={section.eyebrow} heading={section.heading} subtitle={section.subtitle} align="split" />

        <ul className={`mt-14 grid gap-6 ${GRID_COLS[count] ?? "@3xl/site:grid-cols-3"}`}>
          {section.paths.map((path, i) => (
            <SiteReveal key={path.title} as="li" delay={i * 0.08}>
              <article
                className={`flex h-full flex-col overflow-hidden p-2.5 ${SITE_CARD} ${SITE_STRAIGHTEN}`}
                style={{ rotate: tiltAt(i) }}
              >
                <div className={`relative h-52 overflow-hidden rounded-[18px] ${SITE_TINT_BG[i % SITE_TINT_BG.length]}`}>
                  {path.image ? (
                    <Image src={path.image} fill sizes="420px" className="object-cover" alt="" />
                  ) : (
                    <DemoIcon
                      name={path.icon}
                      className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-[var(--sf-ink)]/30"
                    />
                  )}
                  <span className={`${SITE_ICON_RING} absolute left-3 top-3`} aria-hidden>
                    <DemoIcon name={path.icon} className="h-5 w-5" />
                  </span>
                </div>
                <div className="px-4 pb-5 pt-5">
                  <h3 className={SITE_H3}>{path.title}</h3>
                  <p className={`${SITE_BODY} mt-2 text-[15px]`}>{path.desc}</p>
                </div>
              </article>
            </SiteReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
