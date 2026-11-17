"use client";

import { ArrowRight } from "lucide-react";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "../DemoWebsiteButton";
import { SITE_GUTTER } from "../site-garden-theme";
import { SitePolaroid, SiteReveal, SiteSectionIntro } from "../garden/SiteKit";

type Props = {
  parallax: SchoolWebsiteDemoConfig["parallax"];
  onCtaClick: () => void;
  onSecondaryCtaClick: () => void;
};

/** The page's one dark panel, in the school's colour, with a taped polaroid. */
export default function SitePhotoBand({ parallax, onCtaClick, onSecondaryCtaClick }: Props) {
  return (
    <section className={`py-6 ${SITE_GUTTER}`}>
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[32px] border-2 border-[var(--sf-ink)] bg-[var(--sf-forest)] px-6 py-14 shadow-[0_8px_0_0_var(--sf-ink)] @3xl/site:rounded-[44px] @3xl/site:px-14 @3xl/site:py-20">
        <div className="grid items-center gap-12 @5xl/site:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] @5xl/site:gap-16">
          <div>
            <SiteSectionIntro eyebrow={parallax.eyebrow} heading={parallax.heading.join(" ")} subtitle={parallax.subtitle} onDark />
            <SiteReveal className="mt-9 flex flex-wrap gap-4" delay={0.1}>
              <DemoWebsiteButton variant="onDark" onClick={onCtaClick}>
                {parallax.primaryCta}
                <ArrowRight className="h-4 w-4" strokeWidth={2.6} aria-hidden />
              </DemoWebsiteButton>
              <DemoWebsiteButton variant="ghostDark" onClick={onSecondaryCtaClick}>
                {parallax.secondaryCta}
              </DemoWebsiteButton>
            </SiteReveal>
          </div>
          <SiteReveal className="mx-auto w-full max-w-[460px]" delay={0.1}>
            <SitePolaroid
              src={parallax.backgroundImage}
              sizes="(min-width: 1024px) 440px, 85vw"
              tilt={2.5}
              tape={0}
              imageClassName="aspect-[4/3]"
            />
          </SiteReveal>
        </div>
      </div>
    </section>
  );
}
