"use client";

import { motion } from "framer-motion";
import type { DemoFruitsOfSpiritSection } from "@/data/school-demos/types";

export default function FruitsOfSpiritSection({
  section,
}: {
  section: DemoFruitsOfSpiritSection;
}) {
  return (
    <section id="signature" className="py-24 px-8 sm:px-12 lg:px-16" style={{ backgroundColor: "var(--demo-page-bg)" }}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
        <motion.div
          className="w-full lg:w-5/12 lg:sticky lg:top-28"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block px-5 py-2 bg-[var(--demo-badge-bg)] text-[var(--demo-dark)] text-xs font-semibold rounded-full font-secondary mb-6 uppercase tracking-wider">
            {section.eyebrow}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading leading-tight mb-5">
            {section.heading}
          </h2>
          <p className="text-base text-gray-600 font-secondary leading-relaxed mb-6">
            {section.intro}
          </p>
          {section.quote && (
            <blockquote className="border-l-4 border-[var(--demo-primary)] pl-5 py-1">
              <p className="text-sm italic text-gray-700 font-secondary leading-relaxed">
                &ldquo;{section.quote}&rdquo;
              </p>
            </blockquote>
          )}
        </motion.div>

        <div className="w-full lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {section.fruits.map((fruit, i) => (
            <motion.div
              key={fruit.name}
              className="bg-[var(--demo-light-bg)] rounded-xl p-5 border border-[var(--demo-light-border)] hover:border-[color-mix(in_srgb,var(--demo-primary)_40%,transparent)] transition-colors duration-200"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <p className="text-sm font-bold text-[var(--demo-dark)] font-heading mb-1.5">
                {fruit.name}
              </p>
              <p className="text-xs text-gray-500 font-secondary leading-relaxed">{fruit.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
