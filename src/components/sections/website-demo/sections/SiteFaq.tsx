"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "../DemoWebsiteButton";
import { SITE_BODY, SITE_CONTAINER, SITE_SECTION } from "../site-garden-theme";
import { SiteReveal, SiteSectionIntro, SiteStickyNote } from "../garden/SiteKit";

type Props = {
  faq: SchoolWebsiteDemoConfig["faq"];
  ctaLabel: string;
  onCtaClick: () => void;
};

/** Sticky intro beside index-card accordions (like GardenFaq). */
export default function SiteFaq({ faq, ctaLabel, onCtaClick }: Props) {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();
  const baseId = useId();

  return (
    <section id="faq" className={`scroll-mt-[88px] ${SITE_SECTION}`}>
      <div className={`${SITE_CONTAINER} grid gap-12 @5xl/site:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] @5xl/site:gap-16`}>
        <div className="@5xl/site:sticky @5xl/site:top-28 @5xl/site:self-start">
          <SiteSectionIntro eyebrow={faq.eyebrow} heading={faq.heading} subtitle={faq.subtitle} />
          <SiteReveal className="mt-10 max-w-[380px]" delay={0.1}>
            <SiteStickyNote tilt={-2} tape={2}>
              <p className="text-[17px] font-extrabold text-[var(--sf-ink)]">Still have questions?</p>
              <p className="mt-1 text-[14px] leading-relaxed text-[var(--sf-ink)]/75">
                We are happy to talk it through with your family.
              </p>
              <DemoWebsiteButton variant="primary" className="mt-5 !h-11" onClick={onCtaClick}>
                {ctaLabel}
                <ArrowRight className="h-4 w-4" strokeWidth={2.6} aria-hidden />
              </DemoWebsiteButton>
            </SiteStickyNote>
          </SiteReveal>
        </div>

        <ul className="space-y-4">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-faq-${i}`;
            const buttonId = `${baseId}-faq-btn-${i}`;
            return (
              <li
                key={item.q}
                className={`rounded-[22px] border-2 border-[var(--sf-ink)] transition-[background-color,box-shadow] duration-200 ${
                  isOpen ? "bg-white shadow-[0_5px_0_0_var(--sf-ink)]" : "bg-[var(--sf-paper)] shadow-[0_3px_0_0_var(--sf-ink)]"
                }`}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full cursor-pointer items-center justify-between gap-6 rounded-[20px] px-6 py-5 text-left text-[16px] font-extrabold text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 @3xl/site:text-[17px]"
                  >
                    {item.q}
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] transition-[rotate,background-color] duration-300 ${
                        isOpen ? "rotate-45 bg-[var(--sf-butter)]" : "bg-white"
                      }`}
                      aria-hidden
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.6} />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="overflow-hidden"
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className={`${SITE_BODY} border-t-2 border-dashed border-[var(--sf-ink)]/15 px-6 pb-6 pt-4`}>{item.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
