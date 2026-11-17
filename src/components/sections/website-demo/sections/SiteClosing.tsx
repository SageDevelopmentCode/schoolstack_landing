"use client";

import { ArrowRight } from "lucide-react";
import { Star, Tape } from "@/components/garden/ui";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "../DemoWebsiteButton";
import { SITE_GUTTER, SITE_LEAD } from "../site-garden-theme";
import { keepHyphenated, SiteAccent, SitePill, SiteReveal } from "../garden/SiteKit";

type Props = {
  closingCta: SchoolWebsiteDemoConfig["closingCta"];
  onCtaClick: () => void;
  onSecondaryCtaClick: () => void;
};

/** Closing call to action on a taped card (light, so the page keeps one dark panel). */
export default function SiteClosing({ closingCta, onCtaClick, onSecondaryCtaClick }: Props) {
  return (
    <section className={`sf-grid py-20 @3xl/site:py-28 ${SITE_GUTTER}`}>
      <SiteReveal className="relative mx-auto max-w-[1100px]">
        <div className="relative rounded-[32px] border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] px-6 py-16 text-center shadow-[0_10px_0_0_var(--sf-ink)] @3xl/site:rounded-[44px] @3xl/site:py-24">
          <Tape color="var(--sf-mint)" className="-top-3 left-[18%] h-6 w-24 -rotate-6" />
          <Tape color="var(--sf-sky)" className="-top-3 right-[18%] h-6 w-24 rotate-6" />
          <Star className="pointer-events-none absolute left-8 top-10 hidden h-10 w-10 @3xl/site:block" color="var(--sf-ink)" />
          <Star className="pointer-events-none absolute bottom-10 right-10 hidden h-7 w-7 @3xl/site:block" color="var(--sf-clay)" />
          <div className="mx-auto max-w-[820px]">
            <SitePill className="!bg-white">{closingCta.eyebrow}</SitePill>
            <h2 className="sf-display mt-6 text-balance text-[clamp(2.4rem,5.2cqw,4.6rem)] leading-[0.95] text-[var(--sf-ink)]">
              {keepHyphenated(closingCta.heading)} <SiteAccent>{keepHyphenated(closingCta.headingAccent)}</SiteAccent>
            </h2>
            <p className={`${SITE_LEAD} mx-auto mt-6 max-w-[560px] !text-[var(--sf-ink)]/75`}>{closingCta.description}</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <DemoWebsiteButton variant="primary" className="!h-14 !px-7 !text-[16px]" onClick={onCtaClick}>
                {closingCta.primaryCta}
                <ArrowRight className="h-4 w-4" strokeWidth={2.6} aria-hidden />
              </DemoWebsiteButton>
              <DemoWebsiteButton variant="outline" className="!h-14 !px-7 !text-[16px]" onClick={onSecondaryCtaClick}>
                {closingCta.secondaryCta}
              </DemoWebsiteButton>
            </div>
          </div>
        </div>
      </SiteReveal>
    </section>
  );
}
