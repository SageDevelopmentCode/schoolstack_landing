"use client";

import type { DemoFruitsOfSpiritSection } from "@/data/school-demos/types";
import { SITE_BODY, SITE_CARD_SM, SITE_CONTAINER, SITE_SECTION, SITE_TINT_BG } from "./site-garden-theme";
import { SiteReveal, SiteSectionIntro, SiteStickyNote } from "./garden/SiteKit";

/** Sticky intro with the verse on a note, beside a grid of small index cards. */
export default function FruitsOfSpiritSection({ section }: { section: DemoFruitsOfSpiritSection }) {
  return (
    <section id="signature" className={`scroll-mt-[88px] bg-[var(--sf-peach)]/60 ${SITE_SECTION}`}>
      <div className={`${SITE_CONTAINER} grid gap-12 @5xl/site:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] @5xl/site:gap-14`}>
        <div className="@5xl/site:sticky @5xl/site:top-28 @5xl/site:self-start">
          <SiteSectionIntro eyebrow={section.eyebrow} heading={section.heading} subtitle={section.intro} />
          {section.quote ? (
            <SiteReveal className="mt-10 max-w-[460px]" delay={0.1}>
              <SiteStickyNote tilt={-2} tape={1}>
                <p className="text-[17px] font-bold italic leading-relaxed text-[var(--sf-ink)]">{section.quote}</p>
              </SiteStickyNote>
            </SiteReveal>
          ) : null}
        </div>

        <ul className="grid gap-4 @2xl/site:grid-cols-2 @5xl/site:grid-cols-3">
          {section.fruits.map((fruit, i) => (
            <SiteReveal key={fruit.name} as="li" delay={i * 0.04}>
              <div className={`h-full p-5 ${SITE_CARD_SM}`}>
                <span
                  className={`sf-display flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] text-[1.05rem] text-[var(--sf-ink)] ${SITE_TINT_BG[i % SITE_TINT_BG.length]}`}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <h3 className="mt-4 text-[17px] font-extrabold text-[var(--sf-ink)]">{fruit.name}</h3>
                <p className={`${SITE_BODY} mt-1 text-[14px]`}>{fruit.desc}</p>
              </div>
            </SiteReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
