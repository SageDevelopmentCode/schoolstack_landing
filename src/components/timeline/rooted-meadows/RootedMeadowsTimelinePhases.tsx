"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeInView } from "@/components/ui/FadeInView";
import {
  ROOTED_MEADOWS_TIMELINE_PHASES,
  ROOTED_MEADOWS_TIMELINE_THEME,
  type TimelinePersona,
  type TimelinePhase,
} from "@/data/school-demos/rooted-meadows-timeline";
import { prototypeStepUrl } from "@/lib/demo-walkthrough";
import { getPhaseCountdown } from "@/lib/timeline-countdown";

const PERSONA_LABELS: Record<TimelinePersona, string> = {
  admin: "Admin",
  parent: "Parent",
  teacher: "Teacher",
};

function phaseAccent(phase: TimelinePhase) {
  if (phase.accent === "olive") {
    return {
      bg: ROOTED_MEADOWS_TIMELINE_THEME.oliveStepBg,
      title: ROOTED_MEADOWS_TIMELINE_THEME.oliveStepTitle,
      solid: ROOTED_MEADOWS_TIMELINE_THEME.clay,
    };
  }
  return {
    bg: ROOTED_MEADOWS_TIMELINE_THEME.purpleStepBg,
    title: ROOTED_MEADOWS_TIMELINE_THEME.purpleStepTitle,
    solid: ROOTED_MEADOWS_TIMELINE_THEME.accent,
  };
}

function countdownColor(
  status: ReturnType<typeof getPhaseCountdown>["status"],
  accentSolid: string,
) {
  if (status === "in_progress") return accentSolid;
  return ROOTED_MEADOWS_TIMELINE_THEME.textSecondary;
}

interface Props {
  activePhase: number;
  onPhaseSelect: (index: number) => void;
}

export default function RootedMeadowsTimelinePhases({
  activePhase,
  onPhaseSelect,
}: Props) {
  const phase = ROOTED_MEADOWS_TIMELINE_PHASES[activePhase];
  const accent = phaseAccent(phase);
  const activeCountdown = getPhaseCountdown(phase.startDate, phase.endDate);

  return (
    <section className="px-6 py-10 lg:px-16 lg:py-14">
      <div className="mx-auto max-w-[1100px]">
        <FadeInView>
          <div className="mb-10 text-center lg:text-left">
            <p
              className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
            >
              Phase by phase
            </p>
            <h2
              className="font-heading mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-tight"
              style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary }}
            >
              Our proposed timeline
            </h2>
          </div>
        </FadeInView>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-8">
          {/* Mobile pills */}
          <div
            className="flex gap-2 overflow-x-auto pb-1 lg:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {ROOTED_MEADOWS_TIMELINE_PHASES.map((step, i) => {
              const stepAccent = phaseAccent(step);
              const countdown = getPhaseCountdown(step.startDate, step.endDate);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onPhaseSelect(i)}
                  className="font-secondary h-9 shrink-0 cursor-pointer rounded-full px-3.5 text-[11px] font-semibold transition-all duration-200"
                  style={{
                    backgroundColor:
                      activePhase === i ? stepAccent.solid : "white",
                    color:
                      activePhase === i
                        ? "#ffffff"
                        : ROOTED_MEADOWS_TIMELINE_THEME.textSecondary,
                    border: `1px solid ${activePhase === i ? stepAccent.solid : ROOTED_MEADOWS_TIMELINE_THEME.border}`,
                  }}
                >
                  {step.number} · {step.title} · {countdown.compactLabel}
                </button>
              );
            })}
          </div>

          {/* Desktop stepper */}
          <div className="relative hidden w-[280px] shrink-0 lg:block">
            <div
              className="pointer-events-none absolute top-5 bottom-5"
              style={{
                left: "27px",
                borderLeft: `1px dashed ${ROOTED_MEADOWS_TIMELINE_THEME.borderStrong}`,
              }}
              aria-hidden
            />
            <div className="flex flex-col gap-1">
              {ROOTED_MEADOWS_TIMELINE_PHASES.map((step, i) => {
                const isActive = activePhase === i;
                const stepAccent = phaseAccent(step);
                const countdown = getPhaseCountdown(step.startDate, step.endDate);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onPhaseSelect(i)}
                    className="relative flex w-full cursor-pointer items-start gap-3 rounded-lg px-4 py-3.5 text-left transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? stepAccent.bg : "transparent",
                      borderLeft: isActive
                        ? `2px solid ${stepAccent.solid}`
                        : "2px solid transparent",
                    }}
                  >
                    <span
                      className="font-secondary relative z-10 mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-200"
                      style={{
                        backgroundColor: isActive
                          ? stepAccent.solid
                          : "white",
                        color: isActive
                          ? "#ffffff"
                          : ROOTED_MEADOWS_TIMELINE_THEME.textSecondary,
                        border: isActive
                          ? "none"
                          : `1px solid ${ROOTED_MEADOWS_TIMELINE_THEME.border}`,
                      }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <span
                        className="font-secondary block text-[13px] font-medium leading-snug transition-all duration-200"
                        style={{
                          color: isActive
                            ? ROOTED_MEADOWS_TIMELINE_THEME.textPrimary
                            : ROOTED_MEADOWS_TIMELINE_THEME.textSecondary,
                        }}
                      >
                        {step.title}
                      </span>
                      <span
                        className="font-secondary mt-0.5 block text-[11px] font-medium"
                        style={{
                          color: countdownColor(
                            countdown.status,
                            stepAccent.solid,
                          ),
                        }}
                      >
                        {countdown.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          <div
            className="min-w-0 flex-1 overflow-hidden rounded-2xl border"
            style={{
              backgroundColor: "white",
              borderColor: ROOTED_MEADOWS_TIMELINE_THEME.border,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col p-7 sm:p-9 lg:p-10"
              >
                <div className="mb-5 flex flex-wrap items-center gap-2.5">
                  <span
                    className="font-secondary inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white"
                    style={{ backgroundColor: accent.solid }}
                  >
                    Phase {phase.number}
                  </span>
                  <span
                    className="font-secondary rounded-full px-3 py-1 text-[11px] font-medium"
                    style={{
                      color: accent.title,
                      backgroundColor: accent.bg,
                    }}
                  >
                    {phase.dateRange}
                  </span>
                  <span
                    className="font-secondary rounded-full px-3 py-1 text-[11px] font-semibold"
                    style={{
                      color: countdownColor(
                        activeCountdown.status,
                        accent.solid,
                      ),
                      backgroundColor:
                        activeCountdown.status === "in_progress"
                          ? accent.bg
                          : ROOTED_MEADOWS_TIMELINE_THEME.pageBg,
                      border: `1px solid ${
                        activeCountdown.status === "in_progress"
                          ? `${accent.solid}44`
                          : ROOTED_MEADOWS_TIMELINE_THEME.border
                      }`,
                    }}
                  >
                    {activeCountdown.label}
                  </span>
                </div>

                <h3
                  className="font-heading text-[1.6rem] font-medium leading-snug sm:text-[1.75rem]"
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary }}
                >
                  {phase.title}
                </h3>
                <p
                  className="font-secondary mt-1 text-[13px] font-semibold uppercase tracking-widest"
                  style={{ color: accent.solid }}
                >
                  {phase.goal}
                </p>
                <p
                  className="font-secondary mt-3 text-[15px] leading-relaxed"
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                >
                  {phase.summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {phase.personas.map((persona) => (
                    <span
                      key={persona}
                      className="font-secondary rounded-full border px-2.5 py-1 text-[11px] font-medium"
                      style={{
                        borderColor: ROOTED_MEADOWS_TIMELINE_THEME.border,
                        color: ROOTED_MEADOWS_TIMELINE_THEME.accentDark,
                      }}
                    >
                      {PERSONA_LABELS[persona]}
                    </span>
                  ))}
                </div>

                <div className="mt-7 space-y-3">
                  {phase.features.map((feature) => (
                    <div
                      key={feature.title}
                      className="rounded-xl border p-4 transition-colors duration-200 hover:border-[#D4C9BA]"
                      style={{
                        borderColor: ROOTED_MEADOWS_TIMELINE_THEME.border,
                        backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.pageBg,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: accent.bg,
                            border: `1px solid ${accent.solid}33`,
                          }}
                        >
                          <Check
                            size={11}
                            strokeWidth={2.5}
                            style={{ color: accent.solid }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-secondary text-[14px] font-semibold"
                            style={{
                              color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary,
                            }}
                          >
                            {feature.title}
                          </p>
                          <p
                            className="font-secondary mt-1 text-[13px] leading-relaxed"
                            style={{
                              color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary,
                            }}
                          >
                            {feature.description}
                          </p>
                          {feature.prototypeStepId ? (
                            <Link
                              href={prototypeStepUrl(feature.prototypeStepId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-secondary mt-2.5 inline-flex items-center gap-1 text-[12px] font-semibold transition-opacity hover:opacity-80"
                              style={{ color: accent.solid }}
                            >
                              See in prototype
                              <ArrowUpRight size={13} aria-hidden />
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
