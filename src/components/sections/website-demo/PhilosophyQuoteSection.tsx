"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import DemoWebsiteButton from "./DemoWebsiteButton";
import DemoWebsiteCard from "./DemoWebsiteCard";
import DemoWebsiteSectionKicker from "./DemoWebsiteSectionKicker";
import type { DemoPhilosophyQuoteSection } from "@/data/school-demos/types";

interface Props {
  section: DemoPhilosophyQuoteSection;
  onCtaClick: () => void;
}

export default function PhilosophyQuoteSection({ section, onCtaClick }: Props) {
  return (
    <section
      id="signature"
      className="py-24 px-8 sm:px-12 lg:px-16"
      style={{ backgroundColor: "var(--demo-cream)" }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <DemoWebsiteCard className="text-center">
            <div className="mb-6">
              <DemoWebsiteSectionKicker>{section.eyebrow}</DemoWebsiteSectionKicker>
            </div>
            <h2
              className="mb-8 text-3xl font-bold font-heading leading-tight md:text-4xl"
              style={{ color: "var(--demo-ink)" }}
            >
              {section.heading}
            </h2>
            <blockquote
              className="mb-6 text-2xl font-heading italic leading-snug md:text-3xl"
              style={{ color: "var(--demo-ink)" }}
            >
              &ldquo;{section.quote}&rdquo;
            </blockquote>
            {section.attribution && (
              <p
                className="mb-8 text-sm font-secondary uppercase tracking-widest"
                style={{ color: "var(--demo-muted)" }}
              >
                {section.attribution}
              </p>
            )}
            <p
              className="mx-auto mb-10 max-w-2xl text-base font-secondary leading-relaxed"
              style={{ color: "var(--demo-muted)" }}
            >
              {section.body}
            </p>
            <DemoWebsiteButton
              type="button"
              onClick={onCtaClick}
              variant="primary"
              className="inline-flex items-center gap-2"
            >
              {section.ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </DemoWebsiteButton>
          </DemoWebsiteCard>
        </motion.div>
      </div>
    </section>
  );
}
