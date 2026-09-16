"use client";

import { motion } from "framer-motion";
import DemoIcon from "./DemoIcon";
import DemoWebsiteCard from "./DemoWebsiteCard";
import DemoWebsiteSectionKicker from "./DemoWebsiteSectionKicker";
import type { DemoLearningModesSection } from "@/data/school-demos/types";

export default function LearningModesSection({
  section,
}: {
  section: DemoLearningModesSection;
}) {
  return (
    <section
      id="signature"
      className="py-24 px-8 sm:px-12 lg:px-16"
      style={{ backgroundColor: "var(--demo-cream)" }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-14 max-w-3xl mx-auto"
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
          {section.subtitle && (
            <p className="mt-4 font-secondary text-lg" style={{ color: "var(--demo-muted)" }}>
              {section.subtitle}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {section.modes.map((mode, i) => (
            <motion.div
              key={mode.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <DemoWebsiteCard className="h-full">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[var(--demo-radius-button)] bg-[color-mix(in_srgb,var(--demo-primary)_12%,transparent)]">
                  <DemoIcon name={mode.icon} className="h-5 w-5 text-[var(--demo-accent-text)]" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--demo-primary)] font-secondary mb-2">
                  {mode.label}
                </p>
                <h3 className="text-lg font-bold font-heading mb-2" style={{ color: "var(--demo-ink)" }}>
                  {mode.title}
                </h3>
                <p className="text-sm font-secondary leading-relaxed" style={{ color: "var(--demo-muted)" }}>
                  {mode.desc}
                </p>
              </DemoWebsiteCard>
            </motion.div>
          ))}
        </div>

        {section.flexFriday && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <DemoWebsiteCard className="overflow-hidden p-0" padding="none">
              <div className="flex flex-col md:flex-row">
                <div
                  className="flex items-center justify-center px-8 py-10 md:w-2/5"
                  style={{ backgroundColor: "var(--demo-primary-soft)" }}
                >
                  <p
                    className="text-center text-2xl font-bold font-heading leading-tight md:text-3xl"
                    style={{ color: "var(--demo-ink)" }}
                  >
                    {section.flexFriday.title}
                  </p>
                </div>
                <div className="flex items-center px-8 py-10 md:w-3/5">
                  <p className="text-base font-secondary leading-relaxed" style={{ color: "var(--demo-muted)" }}>
                    {section.flexFriday.desc}
                  </p>
                </div>
              </div>
            </DemoWebsiteCard>
          </motion.div>
        )}
      </div>
    </section>
  );
}
