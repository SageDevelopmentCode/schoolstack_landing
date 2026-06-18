"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { DemoPhilosophyQuoteSection } from "@/data/school-demos/types";

interface Props {
  section: DemoPhilosophyQuoteSection;
  onCtaClick: () => void;
}

export default function PhilosophyQuoteSection({ section, onCtaClick }: Props) {
  return (
    <section id="signature" className="py-24 px-8 sm:px-12 lg:px-16 bg-[var(--demo-light-bg)]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block px-5 py-2 bg-[var(--demo-badge-bg)] text-[var(--demo-dark)] text-xs font-semibold rounded-full font-secondary mb-6 uppercase tracking-wider">
            {section.eyebrow}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading mb-8 leading-tight">
            {section.heading}
          </h2>
          <blockquote className="text-2xl md:text-3xl font-heading text-gray-800 leading-snug italic mb-6">
            &ldquo;{section.quote}&rdquo;
          </blockquote>
          {section.attribution && (
            <p className="text-sm text-gray-400 font-secondary uppercase tracking-widest mb-8">
              {section.attribution}
            </p>
          )}
          <p className="text-base text-gray-600 font-secondary leading-relaxed mb-10 max-w-2xl mx-auto">
            {section.body}
          </p>
          <button
            type="button"
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--demo-dark)] hover:bg-[var(--demo-dark-hover)] text-white font-semibold rounded-lg font-secondary transition-all duration-200 shadow-lg cursor-pointer"
          >
            {section.ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
