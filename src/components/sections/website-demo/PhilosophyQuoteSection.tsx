"use client";

import { ArrowRight } from "lucide-react";
import type { DemoPhilosophyQuoteSection } from "@/data/school-demos/types";
import DemoWebsiteButton from "./DemoWebsiteButton";
import { SITE_CONTAINER, SITE_SECTION } from "./site-garden-theme";
import { SiteReveal, SiteSectionIntro, SiteStickyNote } from "./garden/SiteKit";

/** Philosophy copy beside the quote, written up on a big taped note. */
export default function PhilosophyQuoteSection({
  section,
  onCtaClick,
}: {
  section: DemoPhilosophyQuoteSection;
  onCtaClick: () => void;
}) {
  return (
    <section id="signature" className={`scroll-mt-[88px] bg-[var(--sf-lav)]/50 ${SITE_SECTION}`}>
      <div className={`${SITE_CONTAINER} grid items-center gap-14 @5xl/site:grid-cols-2 @5xl/site:gap-16`}>
        <div>
          <SiteSectionIntro eyebrow={section.eyebrow} heading={section.heading} subtitle={section.body} />
          <SiteReveal className="mt-9" delay={0.1}>
            <DemoWebsiteButton variant="primary" onClick={onCtaClick}>
              {section.ctaLabel}
              <ArrowRight className="h-4 w-4" strokeWidth={2.6} aria-hidden />
            </DemoWebsiteButton>
          </SiteReveal>
        </div>

        <SiteReveal delay={0.1}>
          <SiteStickyNote tilt={-1.6} tape={0} className="!p-8 @3xl/site:!p-12">
            <figure>
              <span className="sf-display block text-[5rem] leading-[0.6] text-[var(--sf-clay)]" aria-hidden>
                &ldquo;
              </span>
              <blockquote className="sf-display mt-2 text-[clamp(1.5rem,2.5cqw,2.1rem)] leading-[1.12] text-[var(--sf-ink)]">
                {section.quote}
              </blockquote>
              {section.attribution ? (
                <figcaption className="mt-6 flex items-center gap-3 text-[14px] font-extrabold text-[var(--sf-ink)]/75">
                  <span className="h-0.5 w-8 rounded-full bg-[var(--sf-ink)]/40" aria-hidden />
                  {section.attribution}
                </figcaption>
              ) : null}
            </figure>
          </SiteStickyNote>
        </SiteReveal>
      </div>
    </section>
  );
}
