"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { DemoPhilosophyQuoteSection } from "@/data/school-demos/types";
import DemoWebsiteButton from "./DemoWebsiteButton";
import { DEMO_BLOCK, DEMO_GUTTER, STORY_EASE } from "./bright-demo-theme";
import SiteSectionHeader from "./sections/SiteSectionHeader";

export default function PhilosophyQuoteSection({
  section,
  onCtaClick,
}: {
  section: DemoPhilosophyQuoteSection;
  onCtaClick: () => void;
}) {
  return (
    <section id="signature" className={`scroll-mt-[88px] py-3 ${DEMO_GUTTER}`}>
      <div className={`${DEMO_BLOCK} bg-[var(--demo-ink)] text-white`}>
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-[var(--demo-glow)] blur-3xl" />
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/[0.06] blur-3xl" />
        </div>

        <div className="relative grid gap-10 @5xl/site:grid-cols-2 @5xl/site:items-center @5xl/site:gap-16">
          <div>
            <SiteSectionHeader eyebrow={section.eyebrow} heading={section.heading} subtitle={section.body} onDark />
            <DemoWebsiteButton variant="white" className="mt-9" onClick={onCtaClick}>
              {section.ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </DemoWebsiteButton>
          </div>

          <motion.figure
            className="relative rounded-[32px] bg-white p-8 text-[var(--demo-ink)] shadow-[var(--demo-shadow-float)] @3xl/site:p-12"
            initial={{ opacity: 0, y: 24, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: STORY_EASE }}
          >
            <span
              className="font-secondary pointer-events-none absolute -top-8 left-8 text-[120px] font-bold leading-none text-[var(--demo-primary)]"
              aria-hidden
            >
              &ldquo;
            </span>
            <blockquote className="font-secondary relative pt-6 text-[clamp(1.35rem,2.3cqw,1.9rem)] font-semibold leading-snug tracking-[-0.02em]">
              {section.quote}
            </blockquote>
            {section.attribution ? (
              <figcaption className="font-secondary mt-6 flex items-center gap-3 text-[14px] font-semibold text-[var(--demo-muted)]">
                <span className="h-px w-8 bg-[var(--demo-primary)]" aria-hidden />
                {section.attribution}
              </figcaption>
            ) : null}
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
