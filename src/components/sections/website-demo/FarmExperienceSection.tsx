"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import DemoIcon from "./DemoIcon";
import DemoWebsiteCard from "./DemoWebsiteCard";
import DemoWebsiteSectionKicker from "./DemoWebsiteSectionKicker";
import type { DemoFarmExperienceSection } from "@/data/school-demos/types";

export default function FarmExperienceSection({
  section,
}: {
  section: DemoFarmExperienceSection;
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
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {section.paths.map((path, i) => (
            <motion.div
              key={path.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <DemoWebsiteCard className="group h-full overflow-hidden p-0" padding="none">
                {path.image && (
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={path.image}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={path.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--demo-radius-button)] bg-[color-mix(in_srgb,var(--demo-primary)_12%,transparent)]">
                    <DemoIcon name={path.icon} className="h-5 w-5 text-[var(--demo-accent-text)]" />
                  </div>
                  <h3 className="text-lg font-bold font-heading mb-2" style={{ color: "var(--demo-ink)" }}>
                    {path.title}
                  </h3>
                  <p className="text-sm font-secondary leading-relaxed" style={{ color: "var(--demo-muted)" }}>
                    {path.desc}
                  </p>
                </div>
              </DemoWebsiteCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
