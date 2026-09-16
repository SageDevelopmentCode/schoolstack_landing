"use client";

import { motion } from "framer-motion";
import DemoIcon from "./DemoIcon";
import DemoWebsiteCard from "./DemoWebsiteCard";
import DemoWebsiteSectionKicker from "./DemoWebsiteSectionKicker";
import type { DemoValuePillarsSection } from "@/data/school-demos/types";

export default function ValuePillarsSection({
  section,
}: {
  section: DemoValuePillarsSection;
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
            className="text-4xl md:text-5xl font-bold font-heading leading-tight mb-4"
            style={{ color: "var(--demo-ink)" }}
          >
            {section.heading}
          </h2>
          {section.tagline && (
            <p className="text-xl font-semibold text-[var(--demo-primary)] font-heading">
              {section.tagline}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {section.pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <DemoWebsiteCard className="h-full">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[var(--demo-radius-button)] bg-[var(--demo-primary-soft)]">
                  <DemoIcon name={pillar.icon} className="h-6 w-6 text-[var(--demo-primary)]" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3" style={{ color: "var(--demo-ink)" }}>
                  {pillar.title}
                </h3>
                <p className="text-sm font-secondary leading-relaxed" style={{ color: "var(--demo-muted)" }}>
                  {pillar.desc}
                </p>
              </DemoWebsiteCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
