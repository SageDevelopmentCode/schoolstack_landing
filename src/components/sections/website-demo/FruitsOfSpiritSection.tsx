"use client";

import { motion } from "framer-motion";
import DemoWebsiteCard from "./DemoWebsiteCard";
import DemoWebsiteSectionKicker from "./DemoWebsiteSectionKicker";
import type { DemoFruitsOfSpiritSection } from "@/data/school-demos/types";

export default function FruitsOfSpiritSection({
  section,
}: {
  section: DemoFruitsOfSpiritSection;
}) {
  return (
    <section
      id="signature"
      className="py-24 px-8 sm:px-12 lg:px-16"
      style={{ backgroundColor: "var(--demo-paper)" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
        <motion.div
          className="w-full lg:w-5/12 lg:sticky lg:top-28"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-6">
            <DemoWebsiteSectionKicker>{section.eyebrow}</DemoWebsiteSectionKicker>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold font-heading leading-tight mb-5"
            style={{ color: "var(--demo-ink)" }}
          >
            {section.heading}
          </h2>
          <p className="mb-6 text-base font-secondary leading-relaxed" style={{ color: "var(--demo-muted)" }}>
            {section.intro}
          </p>
          {section.quote && (
            <blockquote className="border-l-4 border-[var(--demo-primary)] py-1 pl-5">
              <p className="text-sm font-secondary italic leading-relaxed" style={{ color: "var(--demo-ink)" }}>
                &ldquo;{section.quote}&rdquo;
              </p>
            </blockquote>
          )}
        </motion.div>

        <div className="w-full lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {section.fruits.map((fruit, i) => (
            <motion.div
              key={fruit.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <DemoWebsiteCard className="h-full bg-[var(--demo-cream)]">
                <p className="mb-1.5 text-sm font-bold font-heading" style={{ color: "var(--demo-ink)" }}>
                  {fruit.name}
                </p>
                <p className="text-xs font-secondary leading-relaxed" style={{ color: "var(--demo-muted)" }}>
                  {fruit.desc}
                </p>
              </DemoWebsiteCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
