"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "../DemoWebsiteButton";
import DemoWebsiteSectionKicker from "../DemoWebsiteSectionKicker";
import { DEMO_GUTTER, DEMO_H2 } from "../bright-demo-theme";

type Props = {
  parallax: SchoolWebsiteDemoConfig["parallax"];
  onCtaClick: () => void;
  onSecondaryCtaClick: () => void;
};

/** Full-bleed photo inside a rounded block with white pills. */
export default function SitePhotoBand({ parallax, onCtaClick, onSecondaryCtaClick }: Props) {
  return (
    <section className={`py-3 ${DEMO_GUTTER}`}>
      <div className="relative mx-auto flex min-h-[480px] max-w-[1400px] items-end overflow-hidden rounded-[32px] @3xl/site:min-h-[560px] @3xl/site:rounded-[40px]">
        <Image src={parallax.backgroundImage} fill sizes="1400px" className="object-cover" alt="" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, color-mix(in srgb, var(--demo-ink) 88%, transparent) 0%, color-mix(in srgb, var(--demo-ink) 55%, transparent) 45%, transparent 85%)",
          }}
        />
        <FadeInView className="relative max-w-[680px] px-6 py-12 @3xl/site:px-14 @3xl/site:py-16">
          <DemoWebsiteSectionKicker onDark>{parallax.eyebrow}</DemoWebsiteSectionKicker>
          <h2 className={`${DEMO_H2} mt-4 text-balance text-white`}>{parallax.heading.join(" ")}</h2>
          <p className="font-secondary mt-5 max-w-[520px] text-[17px] leading-relaxed text-white/75">{parallax.subtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <DemoWebsiteButton variant="white" onClick={onCtaClick}>
              {parallax.primaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </DemoWebsiteButton>
            <DemoWebsiteButton variant="ghostDark" onClick={onSecondaryCtaClick}>
              {parallax.secondaryCta}
            </DemoWebsiteButton>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
