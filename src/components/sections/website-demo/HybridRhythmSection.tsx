"use client";

import { motion } from "framer-motion";
import { Home, School } from "lucide-react";
import type { DemoHybridRhythmSection } from "@/data/school-demos/types";
import DemoWebsiteCard from "./DemoWebsiteCard";
import DemoWebsiteSectionKicker from "./DemoWebsiteSectionKicker";

export default function HybridRhythmSection({
  section,
}: {
  section: DemoHybridRhythmSection;
}) {
  return (
    <section
      id="signature"
      className="py-24 px-8 sm:px-12 lg:px-16"
      style={{ backgroundColor: "var(--demo-paper)" }}
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
            className="text-4xl md:text-5xl font-bold font-heading leading-tight mb-4"
            style={{ color: "var(--demo-ink)" }}
          >
            {section.heading}
          </h2>
          <p className="font-secondary text-lg" style={{ color: "var(--demo-muted)" }}>
            {section.subtitle}
          </p>
          {section.tagline && (
            <p className="mt-4 text-lg font-semibold text-[var(--demo-primary)] font-heading italic">
              {section.tagline}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <DemoWebsiteCard className="border-2 border-[var(--demo-primary)] bg-[color-mix(in_srgb,var(--demo-primary)_6%,transparent)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--demo-radius-button)] bg-[var(--demo-primary)]">
                  <School className="h-5 w-5 text-white" />
                </div>
                <p
                  className="text-sm font-bold uppercase tracking-wider font-secondary"
                  style={{ color: "var(--demo-ink)" }}
                >
                  On Campus
                </p>
              </div>
              <div className="space-y-5">
                {section.campusDays.map((day) => (
                  <div key={day.title}>
                    <p className="text-xs font-semibold text-[var(--demo-primary)] font-secondary uppercase tracking-wider mb-1">
                      {day.label}
                    </p>
                    <h3
                      className="text-lg font-bold font-heading mb-1"
                      style={{ color: "var(--demo-ink)" }}
                    >
                      {day.title}
                    </h3>
                    <p className="text-sm font-secondary leading-relaxed" style={{ color: "var(--demo-muted)" }}>
                      {day.desc}
                    </p>
                  </div>
                ))}
              </div>
            </DemoWebsiteCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <DemoWebsiteCard className="bg-[var(--demo-cream)]">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-[var(--demo-radius-button)]"
                  style={{ backgroundColor: "var(--demo-ink)" }}
                >
                  <Home className="h-5 w-5 text-white" />
                </div>
                <p
                  className="text-sm font-bold uppercase tracking-wider font-secondary"
                  style={{ color: "var(--demo-ink)" }}
                >
                  At Home
                </p>
              </div>
              <div className="space-y-5">
                {section.homeDays.map((day) => (
                  <div key={day.title}>
                    <p className="text-xs font-semibold text-[var(--demo-accent-text)] font-secondary uppercase tracking-wider mb-1">
                      {day.label}
                    </p>
                    <h3
                      className="text-lg font-bold font-heading mb-1"
                      style={{ color: "var(--demo-ink)" }}
                    >
                      {day.title}
                    </h3>
                    <p className="text-sm font-secondary leading-relaxed" style={{ color: "var(--demo-muted)" }}>
                      {day.desc}
                    </p>
                  </div>
                ))}
              </div>
            </DemoWebsiteCard>
          </motion.div>
        </div>

        {section.serviceNote && (
          <motion.p
            className="text-center mt-10 text-base font-secondary max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--demo-muted)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {section.serviceNote}
          </motion.p>
        )}
      </div>
    </section>
  );
}
