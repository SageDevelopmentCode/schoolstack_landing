"use client";

import { ArrowRight } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "../DemoWebsiteButton";
import DemoWebsiteSectionKicker from "../DemoWebsiteSectionKicker";
import { DEMO_GUTTER, DEMO_H1 } from "../bright-demo-theme";

type Props = {
  closingCta: SchoolWebsiteDemoConfig["closingCta"];
  onCtaClick: () => void;
  onSecondaryCtaClick: () => void;
};

/** Ink closing block with a big headline and soft palette glow. */
export default function SiteClosing({ closingCta, onCtaClick, onSecondaryCtaClick }: Props) {
  return (
    <section className={`py-3 ${DEMO_GUTTER}`}>
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[32px] bg-[var(--demo-ink)] px-6 py-20 text-center @3xl/site:rounded-[40px] @3xl/site:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-[var(--demo-glow)] blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <FadeInView className="relative mx-auto max-w-[860px]">
          <DemoWebsiteSectionKicker onDark>{closingCta.eyebrow}</DemoWebsiteSectionKicker>
          <h2 className={`${DEMO_H1} mt-5 text-balance text-white`}>
            {closingCta.heading}{" "}
            <span className="text-[var(--demo-primary-light)] [box-decoration-break:clone] bg-[linear-gradient(transparent_62%,rgba(255,255,255,0.14)_62%)]">
              {closingCta.headingAccent}
            </span>
          </h2>
          <p className="font-secondary mx-auto mt-6 max-w-[560px] text-[17px] leading-relaxed text-white/70">
            {closingCta.description}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <DemoWebsiteButton variant="white" onClick={onCtaClick}>
              {closingCta.primaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </DemoWebsiteButton>
            <DemoWebsiteButton variant="ghostDark" onClick={onSecondaryCtaClick}>
              {closingCta.secondaryCta}
            </DemoWebsiteButton>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
