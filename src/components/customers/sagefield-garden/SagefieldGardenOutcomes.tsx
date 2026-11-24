"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SagefieldOutcomeDemoPreview from "@/components/demo/sagefield/SagefieldOutcomeDemoPreview";
import { prefetchSagefieldAdminDemo, prefetchSagefieldParentDemo, prefetchSagefieldTeacherDemo } from "@/components/demo/sagefield/lazySagefieldDemos";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { Tick, btnPop } from "@/components/garden/ui";
import GardenBrowserFrame from "@/components/home-garden/GardenBrowserFrame";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { OUTCOME_TABS, OUTCOMES_COPY, type OutcomeRole } from "./sagefield-copy";

const ROLE_STYLE: Record<OutcomeRole, { tint: string; pill: string; emoji: string }> = {
  parent: { tint: "bg-[var(--sf-sky)]", pill: "bg-[var(--sf-sky)]", emoji: "🏡" },
  teacher: { tint: "bg-[var(--sf-mint)]", pill: "bg-[var(--sf-mint)]", emoji: "🍎" },
  admin: { tint: "bg-[var(--sf-peach)]", pill: "bg-[var(--sf-peach)]", emoji: "🗂️" },
};

const PREFETCH: Record<OutcomeRole, () => void> = {
  parent: prefetchSagefieldParentDemo,
  teacher: prefetchSagefieldTeacherDemo,
  admin: prefetchSagefieldAdminDemo,
};

/** Role tabs: what each person at Sage Field runs, beside the live demo for that role. */
export default function SagefieldGardenOutcomes() {
  const [role, setRole] = useState<OutcomeRole>("parent");
  const reduce = useReducedMotion();
  const current = OUTCOME_TABS.find((t) => t.id === role)!;
  const Icon = current.icon;

  return (
    <section id="outcomes" className="relative scroll-mt-24 bg-[var(--sf-sky)]/35 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          lead={OUTCOMES_COPY.headlineLead}
          accent={OUTCOMES_COPY.headlineAccent}
          accentColor="text-[var(--sf-forest)]"
          squiggle="var(--sf-butter)"
          align="left"
          headingClassName="text-5xl md:text-6xl"
          body={<p>{OUTCOMES_COPY.body}</p>}
        />

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <div role="tablist" aria-label={OUTCOMES_COPY.eyebrow} className="inline-flex rounded-full border-2 border-[var(--sf-ink)] bg-white p-1.5 shadow-[0_4px_0_0_var(--sf-ink)]">
            {OUTCOME_TABS.map((t) => {
              const active = t.id === role;
              return (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  id={`sf-outcome-tab-${t.id}`}
                  aria-selected={active}
                  aria-controls="sf-outcome-panel"
                  onClick={() => setRole(t.id)}
                  onPointerEnter={() => PREFETCH[t.id]()}
                  onFocus={() => PREFETCH[t.id]()}
                  className="relative cursor-pointer rounded-full px-4 py-2 text-sm font-extrabold text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 sm:px-6"
                >
                  {active ? (
                    <motion.span layoutId="sf-outcome-pill" className={`absolute inset-0 rounded-full ${ROLE_STYLE[t.id].pill}`} transition={{ type: "spring", stiffness: 420, damping: 32 }} />
                  ) : null}
                  <span className="relative">
                    <span aria-hidden="true">{ROLE_STYLE[t.id].emoji}</span> {t.label}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="sf-hand hidden text-lg text-[var(--sf-soft)] lg:inline" aria-hidden="true">
            ← flip between roles
          </span>
        </div>

        <div id="sf-outcome-panel" role="tabpanel" aria-labelledby={`sf-outcome-tab-${role}`} className="mt-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={role}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12"
            >
              <div className={`relative rounded-[30px] border-2 border-[var(--sf-ink)] p-7 shadow-[0_8px_0_0_var(--sf-ink)] sm:p-8 ${ROLE_STYLE[role].tint}`} style={{ rotate: "-1deg" }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-2 ring-[var(--sf-ink)]">
                    <Icon size={18} strokeWidth={2.4} aria-hidden />
                  </span>
                  <h3 className="sf-display text-3xl leading-tight text-[var(--sf-ink)]">{current.outcome}</h3>
                </div>
                <p className="mt-5 text-[16.5px] leading-relaxed text-[var(--sf-ink)]/80">{current.tagline}</p>
                <ul className="mt-6 space-y-3">
                  {current.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 font-bold text-[var(--sf-ink)]">
                      <Tick className="mt-0.5 h-6 w-6" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <GardenBrowserFrame label={`Sage Field · ${current.label}`} tilt={0.8} tape="var(--sf-butter)">
                <SagefieldOutcomeDemoPreview role={role} bare />
              </GardenBrowserFrame>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-[28px] border-2 border-dashed border-[var(--sf-ink)]/25 bg-white/70 px-7 py-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-extrabold text-[var(--sf-ink)]">{OUTCOMES_COPY.ctaTitle}</p>
            <p className="mt-1 text-[15px] text-[var(--sf-soft)]">{OUTCOMES_COPY.ctaBody}</p>
          </div>
          <a href={BOOK_DEMO_HASH_HREF} className={`${btnPop} shrink-0`}>
            {OUTCOMES_COPY.cta}
            <ArrowRight size={18} strokeWidth={2.6} aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
