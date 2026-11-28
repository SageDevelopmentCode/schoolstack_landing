"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Tape } from "@/components/garden/ui";
import RotateProgressBar from "@/components/home/RotateProgressBar";
import { useAutoRotate } from "@/components/home/useAutoRotate";
import type { DemoTestimonialsSection, DemoTrustSection } from "@/data/school-demos/types";
import DemoIcon from "../DemoIcon";
import {
  SITE_BODY,
  SITE_CARD,
  SITE_CONTAINER,
  SITE_EASE,
  SITE_H3,
  SITE_ICON_RING,
  SITE_SECTION,
  SITE_STRAIGHTEN,
  SITE_TINT_BG,
  tiltAt,
} from "../site-garden-theme";
import { SiteReveal, SiteSectionIntro } from "../garden/SiteKit";

const roundBtn =
  "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

/** The featured testimonial as a taped postcard, with the rest listed beside it. */
function Testimonials({ section }: { section: DemoTestimonialsSection }) {
  const count = section.items.length;
  const { index, select, running, intervalMs } = useAutoRotate(count, 7000);
  const reduce = useReducedMotion();
  const featured = section.items[index];
  if (!featured) return null;

  return (
    <div className={SITE_CONTAINER}>
      <SiteSectionIntro eyebrow={section.eyebrow} heading={section.heading} />
      <div className="mt-12 grid gap-10 @5xl/site:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] @5xl/site:gap-12">
        <div className="flex flex-col">
          <div
            className="relative rounded-[26px] border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] p-7 shadow-[0_8px_0_0_var(--sf-ink)] @3xl/site:p-10"
            style={{ rotate: "-0.8deg" }}
          >
            <Tape color="var(--sf-butter)" className="-top-3 left-10 h-6 w-20 -rotate-6" />
            <AnimatePresence mode="wait">
              <motion.figure
                key={index}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: SITE_EASE }}
              >
                <div className="flex gap-1" role="img" aria-label={`${featured.stars} out of 5 stars`}>
                  {Array.from({ length: featured.stars }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-5 w-5 fill-[var(--sf-butter)] text-[var(--sf-ink)]"
                      strokeWidth={2}
                      aria-hidden
                    />
                  ))}
                </div>
                <blockquote className="sf-display mt-5 text-[clamp(1.4rem,2.3cqw,2rem)] leading-[1.12] text-[var(--sf-ink)]">
                  &ldquo;{featured.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3.5 border-t-2 border-dashed border-[var(--sf-ink)]/20 pt-6">
                  <span className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[var(--sf-ink)]">
                    <Image src={featured.avatar} fill sizes="48px" className="object-cover" alt="" />
                  </span>
                  <span>
                    <span className="block text-[15px] font-extrabold text-[var(--sf-ink)]">{featured.name}</span>
                    <span className="block text-[13px] text-[var(--sf-soft)]">{featured.detail}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {count > 1 ? (
            <div className="mt-9 flex items-center gap-3">
              <button
                type="button"
                onClick={() => select((index - 1 + count) % count)}
                className={`${roundBtn} bg-white text-[var(--sf-ink)]`}
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2.6} />
              </button>
              <button
                type="button"
                onClick={() => select((index + 1) % count)}
                className={`${roundBtn} bg-[var(--sf-clay)] text-[var(--sf-on-clay)]`}
                aria-label="Next testimonial"
              >
                <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
              </button>
              <div className="ml-2 flex flex-1 gap-2 text-[var(--sf-ink)]">
                {section.items.map((t, i) => (
                  <span key={`${t.name}-${i}`} className="flex-1">
                    {i === index ? (
                      <RotateProgressBar cycleKey={index} running={running} durationMs={intervalMs} color="var(--sf-ink)" />
                    ) : (
                      <span className={`block h-[3px] rounded-full ${i < index ? "bg-[var(--sf-ink)]/45" : "bg-[var(--sf-ink)]/15"}`} />
                    )}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className={`p-3 ${SITE_CARD}`}>
          <p className={`${SITE_BODY} px-3 pb-2 pt-2 text-[14px]`}>{section.subtitle}</p>
          <ul className="space-y-1.5">
            {section.items.map((t, i) => {
              const isActive = i === index;
              return (
                <li key={`${t.name}-${i}`}>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-pressed={isActive}
                    className={`flex w-full cursor-pointer items-start gap-3 rounded-[18px] border-2 p-3.5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 ${
                      isActive ? "border-[var(--sf-ink)] bg-[var(--sf-butter)]" : "border-transparent hover:bg-[var(--sf-accent-wash)]"
                    }`}
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[var(--sf-ink)]">
                      <Image src={t.avatar} fill sizes="40px" className="object-cover" alt="" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">{t.name}</span>
                      <span className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[var(--sf-ink)]/70">{t.quote}</span>
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

/** First (and last, for 3n+1 lists) tiles span two columns so the rows fill. */
function trustSpan(i: number, count: number) {
  const rem = count % 3;
  if (rem === 2 && i === 0) return "@5xl/site:col-span-2";
  if (rem === 1 && (i === 0 || i === count - 1)) return "@5xl/site:col-span-2";
  return "";
}

/** Reasons to trust the school as pastel index cards. */
function Trust({ section }: { section: DemoTrustSection }) {
  return (
    <div className={SITE_CONTAINER}>
      <SiteSectionIntro align="center" eyebrow={section.eyebrow} heading={section.heading} subtitle={section.subtitle} />
      <ul className="mt-14 grid grid-cols-1 gap-5 @3xl/site:grid-cols-2 @5xl/site:grid-cols-3">
        {section.items.map((item, i) => (
          <SiteReveal key={item.title} as="li" delay={i * 0.07} className={trustSpan(i, section.items.length)}>
            <div
              className={`flex h-full min-h-[220px] flex-col justify-between p-6 ${SITE_CARD} ${i === 0 ? "bg-[var(--sf-butter)]" : i % 2 === 0 ? "bg-white" : SITE_TINT_BG[(i + 1) % SITE_TINT_BG.length]} ${SITE_STRAIGHTEN}`}
              style={{ rotate: tiltAt(i) }}
            >
              <span className={SITE_ICON_RING} aria-hidden>
                <DemoIcon name={item.icon ?? "sparkles"} className="h-5 w-5" />
              </span>
              <div className="mt-10">
                <h3 className={`${SITE_H3} ${i === 0 ? "!text-[1.8rem]" : ""}`}>{item.title}</h3>
                <p className={`${SITE_BODY} mt-2 text-[15px] !text-[var(--sf-ink)]/75`}>{item.desc}</p>
              </div>
            </div>
          </SiteReveal>
        ))}
      </ul>
    </div>
  );
}

export default function SiteStory({
  socialProof,
}: {
  socialProof: DemoTestimonialsSection | DemoTrustSection;
}) {
  return (
    <section id="stories" className={`scroll-mt-[88px] bg-[var(--sf-lav)] ${SITE_SECTION}`}>
      {socialProof.type === "testimonials" ? <Testimonials section={socialProof} /> : <Trust section={socialProof} />}
    </section>
  );
}
