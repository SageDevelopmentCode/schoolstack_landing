"use client";

import { motion } from "framer-motion";
import DemoIcon from "./DemoIcon";
import type { DemoLearningModesSection } from "@/data/school-demos/types";

export default function LearningModesSection({
  section,
}: {
  section: DemoLearningModesSection;
}) {
  return (
    <section id="signature" className="py-24 px-8 sm:px-12 lg:px-16 bg-[var(--demo-light-bg)]">
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
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-heading leading-tight">
            {section.heading}
          </h2>
          {section.subtitle && (
            <p className="text-gray-500 font-secondary text-lg mt-4">{section.subtitle}</p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {section.modes.map((mode, i) => (
            <motion.div
              key={mode.title}
              className="bg-white rounded-2xl p-6 border border-[var(--demo-light-border)] shadow-sm hover:shadow-[0_20px_40px_color-mix(in_srgb,var(--demo-primary)_12%,transparent)] transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="w-11 h-11 rounded-xl bg-[color-mix(in_srgb,var(--demo-primary)_12%,transparent)] flex items-center justify-center mb-4">
                <DemoIcon name={mode.icon} className="w-5 h-5 text-[var(--demo-accent-text)]" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--demo-primary)] font-secondary mb-2">
                {mode.label}
              </p>
              <h3 className="text-lg font-bold text-gray-900 font-heading mb-2">{mode.title}</h3>
              <p className="text-sm text-gray-500 font-secondary leading-relaxed">{mode.desc}</p>
            </motion.div>
          ))}
        </div>

        {section.flexFriday && (
          <motion.div
            className="rounded-2xl overflow-hidden flex flex-col md:flex-row border border-[var(--demo-light-border)]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="md:w-2/5 px-8 py-10 flex items-center justify-center"
              style={{ backgroundColor: "var(--demo-dark)" }}
            >
              <p className="text-2xl md:text-3xl font-bold text-white font-heading leading-tight text-center">
                {section.flexFriday.title}
              </p>
            </div>
            <div className="md:w-3/5 px-8 py-10 bg-white flex items-center">
              <p className="text-base text-gray-600 font-secondary leading-relaxed">
                {section.flexFriday.desc}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
