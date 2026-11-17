"use client";

import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import { SITE_BODY, SITE_CONTAINER, SITE_SECTION } from "../site-garden-theme";
import { SitePolaroid, SiteReveal, SiteSectionIntro, SiteStickyNote } from "../garden/SiteKit";

/** The founder's polaroid and a letter on notebook paper. */
export default function SiteFounder({ founder }: { founder: SchoolWebsiteDemoConfig["founder"] }) {
  return (
    <section id="founder" className={`scroll-mt-[88px] ${SITE_SECTION}`}>
      <div
        className={`${SITE_CONTAINER} grid items-center gap-14 @5xl/site:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] @5xl/site:gap-16`}
      >
        <SiteReveal className="relative mx-auto w-full max-w-[440px] pb-6 pt-4">
          <SitePolaroid
            src={founder.image}
            alt={founder.name}
            sizes="440px"
            tilt={-2.5}
            tape={1}
            imageClassName="aspect-[4/5]"
          />
          <div className="absolute -right-3 top-10 max-w-[200px]">
            <SiteStickyNote tilt={5} tape={false} className="!p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-ink)]/70">
                {founder.imageBadge.label}
              </p>
              <p className="mt-1 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">{founder.imageBadge.value}</p>
            </SiteStickyNote>
          </div>
          <div className="absolute -left-3 bottom-0 rounded-2xl border-2 border-[var(--sf-ink)] bg-white px-4 py-3 shadow-[0_4px_0_0_var(--sf-ink)]" style={{ rotate: "-3deg" }}>
            <p className="text-[15px] font-extrabold text-[var(--sf-ink)]">{founder.name}</p>
            <p className="text-[12px] text-[var(--sf-soft)]">{founder.title}</p>
          </div>
        </SiteReveal>

        <div>
          <SiteSectionIntro eyebrow={founder.eyebrow} heading={founder.heading} accent={founder.headingAccent} />
          <SiteReveal className="mt-6 space-y-4" delay={0.08}>
            {founder.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className={SITE_BODY}>
                {p}
              </p>
            ))}
          </SiteReveal>
          {founder.credentials.length > 0 ? (
            <ul className="mt-7 flex flex-wrap gap-2">
              {founder.credentials.map((cred) => (
                <li
                  key={cred}
                  className="rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-mint)] px-3.5 py-1.5 text-[13px] font-extrabold text-[var(--sf-ink)]"
                >
                  {cred}
                </li>
              ))}
            </ul>
          ) : null}
          <SiteReveal delay={0.12}>
            <figure className="sf-paper mt-8 rounded-[22px] border-2 border-[var(--sf-ink)] p-7 shadow-[0_5px_0_0_var(--sf-ink)]">
              <blockquote className="text-[17px] font-bold leading-relaxed text-[var(--sf-ink)]">
                &ldquo;{founder.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-[13px] font-extrabold text-[var(--sf-clay-deep)]">
                &mdash; {founder.quoteAttribution.replace(/^[\s—–-]+/, "")}
              </figcaption>
            </figure>
          </SiteReveal>
        </div>
      </div>
    </section>
  );
}
