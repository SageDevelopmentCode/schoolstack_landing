"use client";

import { motion } from "framer-motion";
import DemoIcon from "./DemoIcon";
import DemoWebsiteCard from "./DemoWebsiteCard";
import DemoWebsiteSectionKicker from "./DemoWebsiteSectionKicker";
import type { DemoNatureArtJoySection } from "@/data/school-demos/types";

export default function NatureArtJoySection({
  section,
}: {
  section: DemoNatureArtJoySection;
}) {
  return (
    <section
      id="signature"
      className="py-24 px-8 sm:px-12 lg:px-16"
      style={{ backgroundColor: "var(--demo-cream)" }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-5">
            <DemoWebsiteSectionKicker>{section.eyebrow}</DemoWebsiteSectionKicker>
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold font-heading leading-tight"
            style={{ color: "var(--demo-ink)" }}
          >
            {section.heading}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {section.pillars.map((pillar, i) => (
            <motion.div
              key={pillar.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <DemoWebsiteCard className="relative h-full overflow-hidden text-center">
                <div
                  className="absolute left-0 right-0 top-0 h-1"
                  style={{ backgroundColor: "var(--demo-primary)" }}
                />
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[var(--demo-radius-button)] bg-[color-mix(in_srgb,var(--demo-primary)_10%,transparent)]">
                  <DemoIcon name={pillar.icon} className="h-7 w-7 text-[var(--demo-accent-text)]" />
                </div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--demo-primary)] font-secondary">
                  {pillar.label}
                </p>
                <h3 className="mb-3 text-xl font-bold font-heading" style={{ color: "var(--demo-ink)" }}>
                  {pillar.title}
                </h3>
                <p className="text-sm font-secondary leading-relaxed" style={{ color: "var(--demo-muted)" }}>
                  {pillar.desc}
                </p>
              </DemoWebsiteCard>
            </motion.div>
          ))}
        </div>

        {section.trustLine && (
          <motion.p
            className="text-center text-sm font-secondary"
            style={{ color: "var(--demo-muted)" }}
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
