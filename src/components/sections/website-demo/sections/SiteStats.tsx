"use client";

import type { DemoStat } from "@/data/school-demos/types";
import { SITE_GUTTER, SITE_STRAIGHTEN, SITE_TINT_BG, tiltAt } from "../site-garden-theme";
import { SiteReveal } from "../garden/SiteKit";

/** Index cards pinned over the bottom of the hero, alternating tilt and tint. */
export default function SiteStats({ stats }: { stats: DemoStat[] }) {
  if (stats.length === 0) return null;
  return (
    <section className={`relative z-10 -mt-16 ${SITE_GUTTER}`}>
      <ul className="mx-auto grid max-w-[1180px] grid-cols-2 gap-4 px-2 @3xl/site:grid-cols-4 @3xl/site:gap-5">
        {stats.map((stat, i) => (
          <SiteReveal key={`${stat.value}-${stat.label}`} as="li" delay={i * 0.08}>
            <div
              className={`flex h-full flex-col gap-2 rounded-[22px] border-2 border-[var(--sf-ink)] px-5 py-5 shadow-[0_5px_0_0_var(--sf-ink)] @3xl/site:px-6 @3xl/site:py-6 ${SITE_TINT_BG[i % SITE_TINT_BG.length]} ${SITE_STRAIGHTEN}`}
              style={{ rotate: tiltAt(i) }}
            >
              <span className="sf-display block text-balance text-[clamp(1.5rem,2.8cqw,2.4rem)] leading-[0.95] [overflow-wrap:anywhere] text-[var(--sf-ink)]">
                {stat.value}
              </span>
              <span className="block text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-ink)]/70">
                {stat.label}
              </span>
            </div>
          </SiteReveal>
        ))}
      </ul>
    </section>
  );
}
