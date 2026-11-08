"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Quote } from "lucide-react";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import { DEMO_BODY, DEMO_CHIP, DEMO_CONTAINER, DEMO_STICKER, STORY_EASE } from "../bright-demo-theme";
import SiteSectionHeader from "./SiteSectionHeader";

export default function SiteFounder({ founder }: { founder: SchoolWebsiteDemoConfig["founder"] }) {
  return (
    <section id="founder" className="scroll-mt-[88px] bg-white py-20 @3xl/site:py-28">
      <div className={`${DEMO_CONTAINER} grid items-center gap-14 @5xl/site:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] @5xl/site:gap-20`}>
        <motion.div
          className="relative mx-auto h-[440px] w-full max-w-[460px] @3xl/site:h-[540px]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: STORY_EASE }}
        >
          <div className="absolute inset-x-6 inset-y-4 rotate-[4deg] rounded-[40px] bg-[var(--demo-tint-1)]" aria-hidden />
          <div className="absolute inset-x-3 inset-y-0 -rotate-[2deg] overflow-hidden rounded-[36px] shadow-[var(--demo-shadow-float)] ring-1 ring-black/[0.06]">
            <Image src={founder.image} fill sizes="460px" className="object-cover" alt={founder.name} />
          </div>
          <div className={`${DEMO_STICKER} absolute -right-1 top-8 max-w-[200px]`}>
            <p className="font-secondary text-[11px] font-semibold uppercase tracking-wider text-[var(--demo-muted)]">
              {founder.imageBadge.label}
            </p>
            <p className="font-secondary mt-0.5 text-[15px] font-bold text-[var(--demo-ink)]">{founder.imageBadge.value}</p>
          </div>
          <div className={`${DEMO_STICKER} absolute -left-1 bottom-8 flex items-center gap-3`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--demo-ink)] text-white" aria-hidden>
              <Award className="h-5 w-5" />
            </span>
            <span>
              <span className="font-secondary block text-[15px] font-bold text-[var(--demo-ink)]">{founder.name}</span>
              <span className="font-secondary block text-[12px] text-[var(--demo-muted)]">{founder.title}</span>
            </span>
          </div>
        </motion.div>

        <div>
          <SiteSectionHeader eyebrow={founder.eyebrow} heading={founder.heading} accent={founder.headingAccent} />
          <div className="mt-6 space-y-4">
            {founder.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className={DEMO_BODY}>
                {p}
              </p>
            ))}
          </div>
          {founder.credentials.length > 0 ? (
            <ul className="mt-7 flex flex-wrap gap-2">
              {founder.credentials.map((cred) => (
                <li key={cred} className={`${DEMO_CHIP} bg-[var(--demo-tint-3)] px-4 py-2 text-[13px] ring-0`}>
                  {cred}
                </li>
              ))}
            </ul>
          ) : null}
          <figure className="mt-8 rounded-[28px] bg-[var(--demo-tint-1)] p-7">
            <Quote className="h-7 w-7 text-[var(--demo-primary)]" aria-hidden />
            <blockquote className="font-secondary mt-3 text-[17px] font-semibold leading-relaxed tracking-[-0.01em] text-[var(--demo-ink)]">
              &ldquo;{founder.quote}&rdquo;
            </blockquote>
            <figcaption className="font-secondary mt-4 text-[13px] italic text-[var(--demo-muted)]">
              &mdash; {founder.quoteAttribution.replace(/^[\s—–-]+/, "")}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
