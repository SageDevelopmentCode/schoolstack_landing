"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import RotateProgressBar from "@/components/home/RotateProgressBar";
import { useAutoRotate } from "@/components/home/useAutoRotate";
import type { DemoTestimonialsSection, DemoTrustSection } from "@/data/school-demos/types";
import DemoIcon from "../DemoIcon";
import {
  DEMO_BLOCK,
  DEMO_BODY,
  DEMO_GUTTER,
  DEMO_H3,
  DEMO_INK,
  DEMO_TILE,
  DEMO_TINTS,
  STORY_EASE,
} from "../bright-demo-theme";
import SiteSectionHeader from "./SiteSectionHeader";

function Testimonials({ section }: { section: DemoTestimonialsSection }) {
  const count = section.items.length;
  const { index, select, running, intervalMs } = useAutoRotate(count, 7000);
  const featured = section.items[index];
  if (!featured) return null;

  return (
    <div className={`${DEMO_BLOCK} bg-[var(--demo-tint-1)]`}>
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-white/60 blur-3xl"
        aria-hidden
      />
      <div className="relative grid gap-10 @5xl/site:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] @5xl/site:gap-14">
        <div className="flex flex-col">
          <SiteSectionHeader eyebrow={section.eyebrow} heading={section.heading} />
          <AnimatePresence mode="wait">
            <motion.figure
              key={index}
              className="mt-10 flex-1"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: STORY_EASE }}
            >
              <div className="flex gap-1" aria-label={`${featured.stars} out of 5 stars`}>
                {Array.from({ length: featured.stars }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-[var(--demo-primary)] text-[var(--demo-primary)]" aria-hidden />
                ))}
              </div>
              <blockquote className="font-secondary mt-5 border-l-[3px] border-[var(--demo-primary)] pl-6 text-[clamp(1.25rem,2.2cqw,1.9rem)] font-semibold leading-[1.35] tracking-[-0.02em] text-[var(--demo-ink)]">
                &ldquo;{featured.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3.5">
                <span className="relative h-12 w-12 overflow-hidden rounded-full ring-4 ring-white">
                  <Image src={featured.avatar} fill sizes="48px" className="object-cover" alt="" />
                </span>
                <span>
                  <span className={`font-secondary block text-[15px] font-bold ${DEMO_INK}`}>{featured.name}</span>
                  <span className="font-secondary block text-[13px] text-[var(--demo-muted)]">{featured.detail}</span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          {count > 1 ? (
            <div className="mt-10 flex items-center gap-4">
              <button
                type="button"
                onClick={() => select((index - 1 + count) % count)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-[var(--demo-ink)] ring-1 ring-black/[0.08] transition hover:-translate-x-0.5"
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => select((index + 1) % count)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[var(--demo-ink)] text-white transition hover:translate-x-0.5"
                aria-label="Next testimonial"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="flex flex-1 gap-2 text-[var(--demo-ink)]">
                {section.items.map((t, i) => (
                  <span key={`${t.name}-${i}`} className="flex-1">
                    {i === index ? (
                      <RotateProgressBar cycleKey={index} running={running} durationMs={intervalMs} color="var(--demo-ink)" />
                    ) : (
                      <span className={`block h-[3px] rounded-full ${i < index ? "bg-[var(--demo-ink)]/40" : "bg-[var(--demo-ink)]/15"}`} />
                    )}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[28px] bg-white p-3 shadow-[var(--demo-shadow-card)] ring-1 ring-black/[0.04]">
          <p className={`${DEMO_BODY} px-4 pb-2 pt-3 text-[14px]`}>{section.subtitle}</p>
          <ul className="space-y-1.5">
            {section.items.map((t, i) => {
              const isActive = i === index;
              return (
                <li key={`${t.name}-${i}`}>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-pressed={isActive}
                    className={`flex w-full cursor-pointer items-start gap-3 rounded-[20px] p-4 text-left transition-colors duration-200 ${
                      isActive ? "bg-[var(--demo-tint-1)]" : "hover:bg-[var(--demo-tint-3)]"
                    }`}
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <Image src={t.avatar} fill sizes="40px" className="object-cover" alt="" />
                    </span>
                    <span className="min-w-0">
                      <span className={`font-secondary block text-[14px] font-bold ${DEMO_INK}`}>{t.name}</span>
                      <span className="font-secondary mt-0.5 line-clamp-2 text-[13px] leading-snug text-[var(--demo-muted)]">
                        {t.quote}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** First (and last, for 3n+1 lists) tiles span two columns so the bento rows fill. */
function trustSpan(i: number, count: number) {
  const rem = count % 3;
  if (rem === 2 && i === 0) return "@5xl/site:col-span-2";
  if (rem === 1 && (i === 0 || i === count - 1)) return "@5xl/site:col-span-2";
  return "";
}

function Trust({ section }: { section: DemoTrustSection }) {
  return (
    <div className={`${DEMO_BLOCK} bg-[var(--demo-tint-4)]`}>
      <SiteSectionHeader align="center" eyebrow={section.eyebrow} heading={section.heading} subtitle={section.subtitle} />
      <div className="mt-12 grid grid-cols-1 gap-4 @3xl/site:grid-cols-2 @5xl/site:grid-cols-3">
        {section.items.map((item, i) => {
          const featured = i === 0;
          return (
            <motion.div
              key={item.title}
              className={`${DEMO_TILE} flex min-h-[220px] flex-col justify-between ${trustSpan(i, section.items.length)} ${
                featured ? "bg-[var(--demo-ink)]" : "bg-white"
              }`}
              style={featured ? undefined : { backgroundColor: i % 2 === 0 ? "#FFFFFF" : DEMO_TINTS[1] }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: STORY_EASE }}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  featured ? "bg-white/10 text-white" : "bg-[var(--demo-tint-1)] text-[var(--demo-accent)]"
                }`}
                aria-hidden
              >
                <DemoIcon name={item.icon ?? "sparkles"} className="h-6 w-6" />
              </span>
              <div className="mt-10">
                <h3 className={`${DEMO_H3} ${featured ? "text-white" : DEMO_INK} ${featured ? "text-[1.45rem]!" : ""}`}>
                  {item.title}
                </h3>
                <p className={`${DEMO_BODY} mt-2 text-[15px] ${featured ? "text-white/70!" : ""}`}>{item.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function SiteStory({
  socialProof,
}: {
  socialProof: DemoTestimonialsSection | DemoTrustSection;
}) {
  return (
    <section id="stories" className={`scroll-mt-[88px] py-3 ${DEMO_GUTTER}`}>
      {socialProof.type === "testimonials" ? <Testimonials section={socialProof} /> : <Trust section={socialProof} />}
    </section>
  );
}
