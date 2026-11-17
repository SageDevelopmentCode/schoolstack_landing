"use client";

import { Home, School } from "lucide-react";
import type { DemoHybridDay, DemoHybridRhythmSection } from "@/data/school-demos/types";
import { SITE_CONTAINER, SITE_EYEBROW, SITE_ICON_RING, SITE_SECTION } from "./site-garden-theme";
import { SitePill, SiteReveal, SiteSectionIntro } from "./garden/SiteKit";

/** One page of the weekly planner: a coloured tab over ruled notebook paper. */
function PlannerPage({
  title,
  days,
  icon: Icon,
  tabClass,
  delay,
}: {
  title: string;
  days: DemoHybridDay[];
  icon: typeof School;
  tabClass: string;
  delay: number;
}) {
  return (
    <SiteReveal delay={delay}>
      <div className="h-full overflow-hidden rounded-[26px] border-2 border-[var(--sf-ink)] bg-white shadow-[0_6px_0_0_var(--sf-ink)]">
        <div className={`flex items-center gap-3 border-b-2 border-[var(--sf-ink)] px-6 py-4 ${tabClass}`}>
          <span className={`${SITE_ICON_RING} !h-10 !w-10`} aria-hidden>
            <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </span>
          <h3 className="sf-display text-[1.6rem] leading-none text-[var(--sf-ink)]">{title}</h3>
        </div>
        <ul className="sf-paper divide-y-2 divide-dashed divide-[var(--sf-ink)]/15 px-6">
          {days.map((day) => (
            <li key={day.label} className="py-5">
              <p className={SITE_EYEBROW}>{day.label}</p>
              <p className="mt-1 text-[16px] font-extrabold text-[var(--sf-ink)]">{day.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-[var(--sf-soft)]">{day.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </SiteReveal>
  );
}

export default function HybridRhythmSection({ section }: { section: DemoHybridRhythmSection }) {
  return (
    <section id="signature" className={`scroll-mt-[88px] bg-[var(--sf-sky)]/50 ${SITE_SECTION}`}>
      <div className={SITE_CONTAINER}>
        <SiteSectionIntro eyebrow={section.eyebrow} heading={section.heading} subtitle={section.subtitle} align="center" />
        {section.tagline ? (
          <p className="mt-6 text-center">
            <SitePill className="!bg-white">{section.tagline}</SitePill>
          </p>
        ) : null}

        <div className="mt-14 grid gap-6 @3xl/site:grid-cols-2">
          <PlannerPage title="On campus" days={section.campusDays} icon={School} tabClass="bg-[var(--sf-butter)]" delay={0} />
          <PlannerPage title="At home" days={section.homeDays} icon={Home} tabClass="bg-[var(--sf-mint)]" delay={0.08} />
        </div>

        {section.serviceNote ? (
          <p className="mx-auto mt-10 max-w-[640px] text-center text-[14px] leading-relaxed text-[var(--sf-soft)]">
            {section.serviceNote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
