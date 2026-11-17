"use client";

import { ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Tick } from "@/components/garden/ui";
import { gFade, useCelebrate } from "@/components/school-parent/garden/motion";
import { GChip, GProgress, G_FOCUS, SPRINGY } from "@/components/school-parent/garden/ui";
import type { TeacherDashboardModel } from "../useTeacherDashboardModel";

/**
 * Today's rhythm as three connected steps: Roll call → In class → Pickup.
 * Every number comes from today's attendance summary; each step opens the
 * roster on the matching filter. Roll call turning complete is a real
 * success moment (mint + one celebration per day).
 */
export default function TeacherDayRhythm({ model }: { model: TeacherDashboardModel }) {
  const reduce = useReducedMotion() === true;
  const s = model.todaySummary;
  const done = model.rollCallDoneToday;
  const dateKey = model.summary.attendanceToday?.date ?? "today";
  useCelebrate(done && !model.previewMode, model.theme, `teacher-roll-call-done-${dateKey}`);

  if (!model.showAttendanceSection || s.totalStudents === 0) return null;
  const marked = s.totalStudents - s.notMarkedCount;

  return (
    <motion.section
      {...gFade(1, reduce)}
      aria-labelledby="teacher-day-rhythm-title"
      data-testid="teacher-dashboard-day-rhythm"
      className={`rounded-[24px] border-[1.5px] p-4 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] transition-colors duration-500 sm:p-5 ${
        done ? "border-[var(--sf-forest)]/25 bg-[var(--sf-mint)]" : "border-[var(--sf-ink)]/12 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
            Today&apos;s rhythm
          </p>
          <h2 id="teacher-day-rhythm-title" className="sf-display m-0 mt-1 text-[1.25rem] leading-tight text-[var(--sf-ink)]">
            {done ? "Roll call is done. Everyone's accounted for." : `Roll call: ${marked} of ${s.totalStudents} marked`}
          </h2>
        </div>
        <div className="flex min-w-0 items-center gap-3 sm:w-[260px]">
          <GProgress
            value={marked}
            total={s.totalStudents}
            label={`${marked} of ${s.totalStudents} students marked today`}
            done={done}
          />
          <span className="shrink-0 text-[12px] font-extrabold tabular-nums text-[var(--sf-ink)]/65">
            {s.notMarkedCount > 0 ? `${s.notMarkedCount} left` : "All marked"}
          </span>
        </div>
      </div>

      <ol className="m-0 mt-4 grid list-none gap-2 p-0 sm:grid-cols-3" aria-label="Today's steps">
        {model.daySteps.map((step, index) => (
          <li key={step.key} className="relative">
            {index > 0 ? (
              <span
                aria-hidden="true"
                className={`absolute -left-2 top-1/2 hidden h-[2px] w-2 -translate-y-1/2 sm:block ${
                  step.done || step.current ? "bg-[var(--sf-clay)]" : "bg-[var(--sf-ink)]/15"
                }`}
              />
            ) : null}
            <button
              type="button"
              onClick={() => model.showRoster(step.filter)}
              aria-current={step.current ? "step" : undefined}
              aria-label={`${step.label}: ${step.detail}${step.done ? ", done" : step.current ? ", now" : ""}. Show these students`}
              data-testid={`teacher-day-step-${step.key}`}
              className={`group flex h-full w-full items-center gap-3 rounded-[16px] border-[1.5px] px-3.5 py-3 text-left ${SPRINGY} ${G_FOCUS} hover:-translate-y-0.5 ${
                step.current
                  ? "border-[var(--sf-clay)]/45 bg-[var(--sf-accent-wash)]"
                  : step.done
                    ? "border-[var(--sf-forest)]/20 bg-white/70"
                    : "border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]"
              }`}
            >
              {step.done ? (
                <Tick className="h-8 w-8" color="var(--sf-forest)" />
              ) : (
                <span
                  aria-hidden="true"
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold ${
                    step.current
                      ? "bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
                      : "bg-white text-[var(--sf-ink)]/55 ring-[1.5px] ring-[var(--sf-ink)]/15"
                  }`}
                >
                  {index + 1}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[14.5px] font-extrabold text-[var(--sf-ink)]">
                  {step.label}
                  {step.current ? (
                    <GChip tone="info" className="!py-0 !text-[10px]">
                      Now
                    </GChip>
                  ) : null}
                </span>
                <span className="block truncate text-[12.5px] font-semibold tabular-nums text-[var(--sf-soft)]">
                  {step.detail}
                </span>
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/35 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ol>
    </motion.section>
  );
}
