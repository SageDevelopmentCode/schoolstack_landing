"use client";

import { motion } from "framer-motion";
import DemoIcon from "./DemoIcon";
import type { DemoNatureArtJoySection } from "@/data/school-demos/types";

export default function NatureArtJoySection({
  section,
}: {
  section: DemoNatureArtJoySection;
}) {
  return (
    <section id="signature" className="py-24 px-8 sm:px-12 lg:px-16 bg-[var(--demo-light-bg)]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-5 py-2 bg-[var(--demo-badge-bg)] text-[var(--demo-dark)] text-xs font-semibold rounded-full font-secondary mb-5 uppercase tracking-wider">
            {section.eyebrow}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-heading leading-tight">
            {section.heading}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {section.pillars.map((pillar, i) => (
            <motion.div
              key={pillar.label}
              className="relative bg-white rounded-3xl p-8 text-center border border-[var(--demo-light-border)] overflow-hidden group hover:shadow-[0_24px_48px_color-mix(in_srgb,var(--demo-primary)_10%,transparent)] transition-shadow duration-300"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: "var(--demo-primary)" }}
              />
              <div className="w-14 h-14 rounded-2xl bg-[color-mix(in_srgb,var(--demo-primary)_10%,transparent)] flex items-center justify-center mx-auto mb-5">
                <DemoIcon name={pillar.icon} className="w-7 h-7 text-[var(--demo-accent-text)]" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--demo-primary)] font-secondary mb-3">
                {pillar.label}
              </p>
              <h3 className="text-xl font-bold text-gray-900 font-heading mb-3">{pillar.title}</h3>
              <p className="text-sm text-gray-500 font-secondary leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>

        {section.trustLine && (
          <motion.p
            className="text-center text-sm text-[var(--demo-muted)] font-secondary"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {section.trustLine}
          </motion.p>
        )}
      </div>
    </section>
  );
}
