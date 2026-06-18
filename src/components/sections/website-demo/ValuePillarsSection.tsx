"use client";

import { motion } from "framer-motion";
import DemoIcon from "./DemoIcon";
import type { DemoValuePillarsSection } from "@/data/school-demos/types";

export default function ValuePillarsSection({
  section,
}: {
  section: DemoValuePillarsSection;
}) {
  return (
    <section id="signature" className="py-24 px-8 sm:px-12 lg:px-16" style={{ backgroundColor: "var(--demo-dark)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-5 py-2 bg-white/15 text-white text-xs font-semibold rounded-full font-secondary mb-5 uppercase tracking-wider">
            {section.eyebrow}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white font-heading leading-tight mb-4">
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
              className="bg-white/8 backdrop-blur-sm rounded-2xl p-8 border border-white/15 hover:bg-white/12 transition-colors duration-200"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                <DemoIcon name={pillar.icon} className="w-6 h-6 text-[var(--demo-primary)]" />
              </div>
              <h3 className="text-xl font-bold text-white font-heading mb-3">{pillar.title}</h3>
              <p className="text-sm text-white/70 font-secondary leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
