"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Draw, Star, Tick } from "@/components/garden/ui";
import GardenBrowserFrame from "@/components/home-garden/GardenBrowserFrame";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { STEP_PREVIEW_DATA as D, STEPS, TIMELINE_COPY } from "./sagefield-copy";

const TONE = {
  good: "text-[var(--sf-forest)]",
  warm: "text-[var(--sf-clay-deep)]",
  quiet: "text-[var(--sf-soft)]",
} as const;

/** Small paper mock-ups of each phase, drawn in Garden colours. */
const PREVIEWS = [
  <div key="launch" className="space-y-3 bg-[var(--sf-paper)] p-6">
    <div className="h-5 w-2/3 rounded bg-[var(--sf-ink)]/15" />
    <div className="h-3 w-full rounded bg-[var(--sf-ink)]/8" />
    <div className="h-3 w-4/5 rounded bg-[var(--sf-ink)]/8" />
    <div className="flex gap-2 pt-2">
      <div className="h-8 w-28 rounded-full bg-[var(--sf-clay)]" />
      <div className="h-8 w-24 rounded-full border-2 border-[var(--sf-ink)]/15 bg-white" />
    </div>
    <div className="grid grid-cols-3 gap-2 pt-2">
      {D.launchTabs.map((t, i) => (
        <div key={t} className={`rounded-xl py-3 text-center text-xs font-extrabold text-[var(--sf-ink)] ${["bg-[var(--sf-mint)]", "bg-[var(--sf-butter)]", "bg-[var(--sf-sky)]"][i]}`}>
          {t}
        </div>
      ))}
    </div>
  </div>,
  <div key="enroll" className="space-y-2.5 bg-[var(--sf-paper)] p-6">
    {D.enrollFamilies.map((f) => (
      <div key={f.name} className="flex items-center gap-3 rounded-xl border-2 border-[var(--sf-ink)]/10 bg-white px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sf-sky)] text-xs font-extrabold text-[var(--sf-ink)]">{f.name[0]}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-[var(--sf-ink)]">{f.name}</span>
          <span className="block text-xs font-semibold text-[var(--sf-soft)]">{f.status}</span>
        </span>
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${f.done ? "bg-[var(--sf-forest)]" : "bg-[var(--sf-clay)]"}`} />
      </div>
    ))}
    <div className="rounded-xl border-2 border-dashed border-[var(--sf-clay)]/40 bg-[var(--sf-peach)]/40 px-4 py-3 text-center text-xs font-extrabold text-[var(--sf-clay-deep)]">
      {D.enrollAdd}
    </div>
  </div>,
  <div key="onboard" className="bg-[var(--sf-paper)] p-6">
    <div className="overflow-hidden rounded-xl border-2 border-[var(--sf-ink)]/10 bg-white">
      <div className="flex items-center gap-2 border-b-2 border-[var(--sf-ink)]/10 px-4 py-2.5">
        <span className="text-xs font-extrabold text-[var(--sf-ink)]">{D.onboardTitle}</span>
        <span className="ml-auto rounded-full bg-[var(--sf-mint)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--sf-forest)]">{D.onboardLive}</span>
      </div>
      <div className="space-y-2 p-4">
        {D.onboardItems.map((item, i) => (
          <div key={item} className="flex items-center gap-3 rounded-lg bg-[var(--sf-cream)] px-3 py-2">
            <span className={`h-6 w-6 shrink-0 rounded-md ${["bg-[var(--sf-sky)]", "bg-[var(--sf-butter)]", "bg-[var(--sf-peach)]", "bg-[var(--sf-lav)]"][i]}`} />
            <span className="text-xs font-bold text-[var(--sf-ink)]/80">{item}</span>
          </div>
        ))}
      </div>
    </div>
  </div>,
  <div key="operate" className="space-y-2.5 bg-[var(--sf-paper)] p-6">
    {D.operateRows.map(({ label, value, tone }) => (
      <div key={label} className="flex items-center justify-between rounded-xl border-2 border-[var(--sf-ink)]/10 bg-white px-4 py-3">
        <span className="text-xs font-bold text-[var(--sf-soft)]">{label}</span>
        <span className={`text-sm font-extrabold ${TONE[tone]}`}>{value}</span>
      </div>
    ))}
  </div>,
];

/**
 * "From idea to operating school": the page's one forest panel. Four butter
 * number dots on a dashed line pick the phase; the phase card and its paper
 * mock-up swap in. Arrow keys move between phases.
 */
export default function SagefieldGardenTimeline() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const step = STEPS[active];
  const Icon = step.icon;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + STEPS.length) % STEPS.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="px-3 py-10 lg:px-6 lg:py-16">
      <div className="relative overflow-hidden rounded-[44px] bg-[var(--sf-forest)] py-20 text-[var(--sf-cream)] lg:py-28">
        <Draw className="absolute right-[8%] top-14 hidden w-14 lg:block">
          <Star color="var(--sf-butter)" />
        </Draw>
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <SectionIntro
            pill={`🌱 ${TIMELINE_COPY.eyebrow}`}
            tint="ink"
            lead={TIMELINE_COPY.headlineLead}
            accent={TIMELINE_COPY.headlineAccent}
            accentColor="text-[var(--sf-butter)]"
            squiggle={null}
            dark
            headingClassName="text-5xl md:text-6xl"
            bodyClassName="text-[var(--sf-cream)]/85"
            body={<p>{TIMELINE_COPY.body}</p>}
          />

          <div className="mt-16 grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
            {/* Step picker */}
            <div className="relative">
              <span className="absolute bottom-6 left-[27px] top-6 hidden border-l-2 border-dashed border-white/25 lg:block" aria-hidden="true" />
              <div
                role="tablist"
                aria-label={TIMELINE_COPY.eyebrow}
                aria-orientation="vertical"
                className="sf-no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6 pb-2 [scroll-padding-inline:1.5rem] sm:-mx-10 sm:px-10 lg:mx-0 lg:flex-col lg:gap-2 lg:overflow-visible lg:p-0"
              >
                {STEPS.map((s, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={s.number}
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      role="tab"
                      type="button"
                      id={`sf-step-tab-${i}`}
                      aria-selected={isActive}
                      aria-controls="sf-step-panel"
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActive(i)}
                      onKeyDown={(e) => onKeyDown(e, i)}
                      className={`relative flex shrink-0 cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/50 lg:w-full ${
                        isActive ? "bg-white/12" : "hover:bg-white/6"
                      }`}
                    >
                      <span
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-extrabold transition-all duration-300 ${
                          isActive
                            ? "scale-110 border-[var(--sf-ink)] bg-[var(--sf-butter)] text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)]"
                            : "border-white/30 bg-[var(--sf-forest)] text-[var(--sf-cream)]/80"
                        }`}
                      >
                        {s.number}
                      </span>
                      <span className="pr-2">
                        <span className={`block font-extrabold ${isActive ? "text-[var(--sf-cream)]" : "text-[var(--sf-cream)]/75"}`}>{s.title}</span>
                        <span className="hidden text-xs font-semibold text-[var(--sf-cream)]/70 lg:block">{s.outcome}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phase */}
            <div id="sf-step-panel" role="tabpanel" aria-labelledby={`sf-step-tab-${active}`} className="min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={reduce ? false : { opacity: 0, y: 16, rotate: -1 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="grid items-start gap-10 xl:grid-cols-[1fr_0.95fr]"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-[var(--sf-butter)] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sf-ink)]">
                        Step {step.number}
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--sf-forest)] ring-2 ring-[var(--sf-ink)]">
                        <Icon size={17} strokeWidth={2.5} aria-hidden />
                      </span>
                    </div>
                    <h3 className="sf-display mt-5 text-5xl leading-none text-[var(--sf-cream)]">{step.title}</h3>
                    <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--sf-butter)]">{step.outcome}</p>
                    <p className="mt-5 text-lg leading-relaxed text-[var(--sf-cream)]/85">{step.body}</p>
                    <ul className="mt-6 space-y-3">
                      {step.details.map((d) => (
                        <li key={d} className="flex items-start gap-3 font-bold text-[var(--sf-cream)]">
                          <Tick className="mt-0.5 h-6 w-6" color="var(--sf-forest)" fill="var(--sf-butter)" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <GardenBrowserFrame label={active === 0 ? "sagefield.co" : `Sage Field · ${step.title}`} tilt={1.2} tape="var(--sf-peach)">
                    {PREVIEWS[active]}
                  </GardenBrowserFrame>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
