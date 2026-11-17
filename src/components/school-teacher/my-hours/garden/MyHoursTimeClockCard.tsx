"use client";

import { Loader2, LogIn, LogOut } from "lucide-react";
import { GCard, GKicker } from "@/components/school-parent/garden/ui";
import {
  MY_HOURS_PREVIEW_REASON,
  type TeacherMyHoursModel,
} from "@/components/school-teacher/my-hours/useTeacherMyHoursModel";
import {
  formatHoursMinutes,
  formatLiveElapsed,
  formatWallClockTime,
} from "@/lib/school-teacher/my-hours/format-duration";
import { todayClockLine, weekToGoLabel } from "@/lib/school-teacher/my-hours/my-hours-status";

/** The page's one toy button: a white pill with an ink edge, on the dark card. */
const CLOCK_BTN =
  "inline-flex min-w-[11rem] items-center justify-center gap-2 rounded-full border-2 border-[var(--sf-ink)] bg-white px-6 py-3 text-[15px] font-extrabold text-[var(--sf-ink)] shadow-[0_5px_0_0_var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_7px_0_0_var(--sf-ink)] active:translate-y-1 active:shadow-[0_1px_0_0_var(--sf-ink)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_5px_0_0_var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60";

/**
 * Time clock (the page's one dark card and one toy button): live timer while
 * on the clock, today's total, this week against the goal, Clock in / out.
 * Same layout and copy as the mobile Garden time clock.
 */
export default function MyHoursTimeClockCard({ model }: { model: TeacherMyHoursModel }) {
  const { clock, week, today, previewMode } = model;
  const { clockedIn, activeSessionStartedAt, elapsedSeconds, pending } = clock;
  const toGo = weekToGoLabel(week);
  const todayLine = todayClockLine({ ...today, elapsedSeconds });

  const buttonLabel =
    pending === "in" ? "Clocking in…" : pending === "out" ? "Clocking out…" : clockedIn ? "Clock out" : "Clock in";

  return (
    <GCard
      index={1}
      tone="dark"
      kicker="Time clock"
      title={clockedIn ? "On the clock" : "Off the clock"}
      data-testid="teacher-my-hours-clock-card"
      action={
        <span
          data-testid="teacher-my-hours-clock-status"
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
            clockedIn ? "bg-[var(--sf-mint)] text-[var(--sf-forest)]" : "bg-white/15 text-white/90"
          }`}
        >
          {clockedIn ? <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-[var(--sf-forest)]" /> : null}
          {clockedIn ? "Clocked in" : "Not clocked in"}
        </span>
      }
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {clockedIn && activeSessionStartedAt ? (
            <>
              <p
                className="sf-display m-0 text-[2.8rem] leading-none tabular-nums text-white sm:text-[3.4rem]"
                data-testid="teacher-my-hours-live-timer"
                aria-label={`On the clock for ${formatLiveElapsed(elapsedSeconds)}`}
              >
                {formatLiveElapsed(elapsedSeconds)}
              </p>
              <p className="m-0 mt-2 text-[15px] font-semibold text-white/80">
                Started at {formatWallClockTime(activeSessionStartedAt)}
              </p>
            </>
          ) : (
            <p className="m-0 max-w-[34ch] text-[15px] font-semibold text-white/80">
              Clock in when your day starts. Each session saves here when you clock out.
            </p>
          )}
          <p className="m-0 mt-1 text-[14px] font-extrabold text-[var(--sf-butter)]" aria-live="polite">
            {todayLine}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            type="button"
            className={CLOCK_BTN}
            onClick={() => void (clockedIn ? clock.clockOut() : clock.clockIn())}
            disabled={previewMode || pending != null}
            aria-busy={pending != null || undefined}
            title={previewMode ? MY_HOURS_PREVIEW_REASON : undefined}
            data-testid="teacher-my-hours-clock-action"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden data-testid="teacher-my-hours-clock-action-loading" />
            ) : clockedIn ? (
              <LogOut className="h-4 w-4" aria-hidden />
            ) : (
              <LogIn className="h-4 w-4" aria-hidden />
            )}
            {buttonLabel}
          </button>
          {previewMode ? (
            <p className="m-0 text-[12px] font-semibold text-white/70">{MY_HOURS_PREVIEW_REASON}.</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 border-t-[1.5px] border-dashed border-white/25 pt-4">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <GKicker light>This week</GKicker>
          <p className="m-0 text-[15px] font-extrabold tabular-nums text-white">
            {formatHoursMinutes(week.loggedMinutes)}
            {week.goalMinutes > 0 ? (
              <span className="font-semibold text-white/75"> of {formatHoursMinutes(week.goalMinutes)}</span>
            ) : null}
            {toGo ? <span className="font-semibold text-white/75"> · {toGo}</span> : null}
          </p>
        </div>
        <WeekBar
          logged={week.loggedMinutes}
          goal={week.goalMinutes}
          label={`This week: ${formatHoursMinutes(week.loggedMinutes)} of ${formatHoursMinutes(week.goalMinutes)}`}
        />
      </div>
    </GCard>
  );
}

/** Week progress on the dark card: butter fill (mint once the goal is met); the kit bar's accent fill would vanish here. */
function WeekBar({ logged, goal, label }: { logged: number; goal: number; label: string }) {
  const pct = goal > 0 ? Math.min(100, Math.round((logged / goal) * 100)) : logged > 0 ? 100 : 0;
  const done = goal > 0 && logged >= goal;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className="h-3 w-full overflow-hidden rounded-full border-[1.5px] border-white/50 bg-white/15"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${done ? "bg-[var(--sf-mint)]" : "bg-[var(--sf-butter)]"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
