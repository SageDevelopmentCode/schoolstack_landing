"use client";

import { motion } from "framer-motion";
import { Home, School } from "lucide-react";
import type { DemoHybridRhythmSection } from "@/data/school-demos/types";

export default function HybridRhythmSection({
  section,
}: {
  section: DemoHybridRhythmSection;
}) {
  return (
    <section id="signature" className="py-24 px-8 sm:px-12 lg:px-16" style={{ backgroundColor: "var(--demo-page-bg)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-14 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-5 py-2 bg-[var(--demo-badge-bg)] text-[var(--demo-dark)] text-xs font-semibold rounded-full font-secondary mb-5 uppercase tracking-wider">
            {section.eyebrow}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-heading leading-tight mb-4">
            {section.heading}
          </h2>
          <p className="text-gray-500 font-secondary text-lg">{section.subtitle}</p>
          {section.tagline && (
            <p className="mt-4 text-lg font-semibold text-[var(--demo-primary)] font-heading italic">
              {section.tagline}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            className="rounded-3xl p-8 border-2 border-[var(--demo-primary)] bg-[color-mix(in_srgb,var(--demo-primary)_6%,transparent)]"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--demo-primary)] flex items-center justify-center">
                <School className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-[var(--demo-dark)] font-secondary">
                On Campus
              </p>
            </div>
            <div className="space-y-5">
              {section.campusDays.map((day) => (
                <div key={day.title}>
                  <p className="text-xs font-semibold text-[var(--demo-primary)] font-secondary uppercase tracking-wider mb-1">
                    {day.label}
                  </p>
                  <h3 className="text-lg font-bold text-gray-900 font-heading mb-1">{day.title}</h3>
                  <p className="text-sm text-gray-600 font-secondary leading-relaxed">{day.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="rounded-3xl p-8 border border-[var(--demo-light-border)] bg-[var(--demo-light-bg)]"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--demo-dark)] flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-[var(--demo-dark)] font-secondary">
                At Home
              </p>
            </div>
            <div className="space-y-5">
              {section.homeDays.map((day) => (
                <div key={day.title}>
                  <p className="text-xs font-semibold text-[var(--demo-accent-text)] font-secondary uppercase tracking-wider mb-1">
                    {day.label}
                  </p>
                  <h3 className="text-lg font-bold text-gray-900 font-heading mb-1">{day.title}</h3>
                  <p className="text-sm text-gray-600 font-secondary leading-relaxed">{day.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {section.serviceNote && (
          <motion.p
            className="text-center mt-10 text-base text-gray-600 font-secondary max-w-2xl mx-auto leading-relaxed"
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
