"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import DemoIcon from "./DemoIcon";
import type { DemoFarmExperienceSection } from "@/data/school-demos/types";

export default function FarmExperienceSection({
  section,
}: {
  section: DemoFarmExperienceSection;
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
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {section.paths.map((path, i) => (
            <motion.div
              key={path.title}
              className="group rounded-2xl overflow-hidden border border-[var(--demo-light-border)] bg-white hover:shadow-[0_20px_40px_color-mix(in_srgb,var(--demo-primary)_10%,transparent)] transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              {path.image && (
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={path.image}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={path.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}
              <div className="p-6">
                <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--demo-primary)_12%,transparent)] flex items-center justify-center mb-4">
                  <DemoIcon name={path.icon} className="w-5 h-5 text-[var(--demo-accent-text)]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-heading mb-2">{path.title}</h3>
                <p className="text-sm text-gray-500 font-secondary leading-relaxed">{path.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
