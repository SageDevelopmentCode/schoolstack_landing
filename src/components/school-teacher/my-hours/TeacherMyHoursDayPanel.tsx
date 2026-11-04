"use client";

import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, LogIn, LogOut } from "lucide-react";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import {
  formatHoursMinutes,
  formatLiveElapsed,
  formatLongWeekdayDate,
  formatWallClockTime,
  isSameDay,
  toDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";
import { MY_HOURS_CALENDAR_LINE, MY_HOURS_LOGGED_BG } from "@/lib/school-teacher/my-hours/calendar-styles";
import {
  myHoursFadeUpTransition,
  myHoursRowTransition,
} from "@/lib/school-teacher/my-hours/my-hours-motion";
import {
  activeSessionCountsInFocusDaySessionTotal,
  activeSessionLoggedMinutesForFocusDay,
} from "@/lib/school-teacher/my-hours/my-hours-page-utils";
import type {
  MyHoursDayLog,
  MyHoursSession,
  TeacherMyHoursActiveSession,
} from "@/lib/school-teacher/my-hours/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ClockActionPending = "in" | "out" | null;

type TeacherMyHoursDayPanelProps = {
  theme: ParentThemeTokens;
  focusDate: Date;
  referenceDate: Date;
  dayLog: MyHoursDayLog | null;
  closedSessions: MyHoursSession[];
  activeSession: TeacherMyHoursActiveSession | null;
  activeSessionStartedAt: Date | null;
  elapsedSeconds: number;
  previewMode?: boolean;
  clockActionPending: ClockActionPending;
  onClockIn: () => void | Promise<void>;
  onClockOut: () => void | Promise<void>;
};

type SessionsTableProps = {
  theme: ParentThemeTokens;
  sessions: MyHoursSession[];
  activeSessionStartedAt?: Date | null;
  elapsedSeconds?: number;
  animateRows?: boolean;
};

function LoggedSummaryStrip({
  theme,
  totalLabel,
  sessionLabel,
}: {
  theme: ParentThemeTokens;
  totalLabel: string;
  sessionLabel: string;
}) {
  return (
    <div
      className="rounded-lg px-4 py-3 text-sm"
      style={{ backgroundColor: MY_HOURS_LOGGED_BG, color: theme.ink }}
    >
      <span className="font-bold uppercase tracking-wide text-[11px]" style={{ color: theme.primary }}>
        Logged
      </span>
      <p className="mt-1 font-semibold tabular-nums">
        {totalLabel} · {sessionLabel}
      </p>
    </div>
  );
}

function SessionsTable({
  theme,
  sessions,
  activeSessionStartedAt = null,
  elapsedSeconds = 0,
  animateRows = false,
}: SessionsTableProps) {
  const reducedMotion = useReducedMotion();
  const rowMotion = myHoursRowTransition(reducedMotion ?? false);
  const showActive = activeSessionStartedAt != null;
  if (sessions.length === 0 && !showActive) {
    return null;
  }

  const RowWrapper = animateRows ? motion.tr : "tr";
  const ActiveRowWrapper = animateRows ? motion.tr : "tr";

  return (
    <div className="mt-5">
      <p
        className="mb-3 text-[11px] font-bold uppercase tracking-wider"
        style={{ color: theme.muted }}
      >
        Sessions
      </p>
      <div
        className="overflow-hidden rounded-lg border"
        style={{ borderColor: MY_HOURS_CALENDAR_LINE }}
      >
        <table className="w-full text-left text-sm">
          <thead>
            <tr
              className="border-b text-[11px] font-bold uppercase tracking-wider"
              style={{ borderColor: MY_HOURS_CALENDAR_LINE, color: theme.muted }}
            >
              <th className="px-4 py-2.5">In</th>
              <th className="px-4 py-2.5">Out</th>
              <th className="px-4 py-2.5 text-right">Duration</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {sessions.map((session) => (
                <RowWrapper
                  key={session.id}
                  className="border-b last:border-b-0"
                  style={{ borderColor: MY_HOURS_CALENDAR_LINE, color: theme.ink }}
                  {...(animateRows ? rowMotion : {})}
                >
                  <td className="px-4 py-3 tabular-nums">{session.clockIn}</td>
                  <td className="px-4 py-3 tabular-nums">{session.clockOut}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {formatHoursMinutes(session.minutes)}
                  </td>
                </RowWrapper>
              ))}
              {showActive && activeSessionStartedAt ? (
                <ActiveRowWrapper
                  key="active-session"
                  style={{ color: theme.ink, backgroundColor: "#F7FAF7" }}
                  {...(animateRows ? rowMotion : {})}
                >
                  <td className="px-4 py-3 tabular-nums">
                    {formatWallClockTime(activeSessionStartedAt)}
                  </td>
                  <td className="px-4 py-3 tabular-nums" style={{ color: theme.muted }}>
                    In progress
                  </td>
                  <td
                    className="px-4 py-3 text-right font-semibold tabular-nums"
                    style={{ color: theme.primary }}
                  >
                    {formatLiveElapsed(elapsedSeconds)}
                  </td>
                </ActiveRowWrapper>
              ) : null}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TeacherMyHoursDayPanel({
  theme,
  focusDate,
  referenceDate,
  dayLog,
  closedSessions,
  activeSession,
  activeSessionStartedAt,
  elapsedSeconds,
  previewMode = false,
  clockActionPending,
  onClockIn,
  onClockOut,
}: TeacherMyHoursDayPanelProps) {
  const reducedMotion = useReducedMotion();
  const fadeUp = myHoursFadeUpTransition(reducedMotion ?? false);
  const isToday = isSameDay(focusDate, referenceDate);
  const isClockedIn = activeSessionStartedAt != null;
  const showDayClockActions = isToday || isClockedIn;
  const isPending = clockActionPending != null;

  const focusDateKey = toDateKey(focusDate);
  const referenceDateKey = toDateKey(referenceDate);

  const activeCountsInLoggedTotal = activeSessionCountsInFocusDaySessionTotal(
    activeSession,
    focusDateKey,
    referenceDateKey,
  );

  const todayTotalMinutes = useMemo(() => {
    const completed = closedSessions.reduce((sum, s) => sum + s.minutes, 0);
    const active = activeSessionLoggedMinutesForFocusDay(
      activeSession,
      focusDateKey,
      referenceDateKey,
      elapsedSeconds,
    );
    return completed + active;
  }, [
    activeSession,
    closedSessions,
    elapsedSeconds,
    focusDateKey,
    referenceDateKey,
  ]);

  const showTodayLoggedSummary =
    isToday && (closedSessions.length > 0 || activeCountsInLoggedTotal);

  const sessionCountToday =
    closedSessions.length + (activeCountsInLoggedTotal ? 1 : 0);

  const pastDaySessions = !isToday ? closedSessions : [];

  return (
    <ParentCard theme={theme} className="p-5 sm:p-6" data-testid="teacher-my-hours-day-panel">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-xl font-semibold" style={{ color: theme.ink }}>
          {formatLongWeekdayDate(focusDate)}
        </h2>
        {isToday ? (
          <ParentChip theme={theme} tone="info">
            Today
          </ParentChip>
        ) : null}
      </div>

      {dayLog && !isToday ? (
        <>
          <div className="mt-4">
            <LoggedSummaryStrip
              theme={theme}
              totalLabel={formatHoursMinutes(dayLog.totalMinutes)}
              sessionLabel={`${dayLog.sessionCount} ${dayLog.sessionCount === 1 ? "session" : "sessions"}`}
            />
          </div>
          <SessionsTable
            theme={theme}
            sessions={pastDaySessions}
            activeSessionStartedAt={activeSessionStartedAt}
            elapsedSeconds={elapsedSeconds}
          />
        </>
      ) : null}

      {showDayClockActions ? (
        <>
          {isToday ? (
            <AnimatePresence initial={false}>
              {showTodayLoggedSummary ? (
                <motion.div key="today-logged-summary" className="mt-4" {...fadeUp}>
                  <LoggedSummaryStrip
                    theme={theme}
                    totalLabel={formatHoursMinutes(todayTotalMinutes)}
                    sessionLabel={`${sessionCountToday} ${sessionCountToday === 1 ? "session" : "sessions"}`}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          ) : null}

          {isClockedIn && activeSessionStartedAt ? (
            isToday ? (
              <AnimatePresence initial={false}>
                <motion.div key="current-session" className="mt-5" {...fadeUp}>
                  <p
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: theme.muted }}
                  >
                    Current session
                  </p>
                  <p
                    className="mt-2 font-display text-4xl font-semibold tabular-nums sm:text-5xl"
                    style={{ color: theme.ink }}
                    data-testid="teacher-my-hours-live-timer"
                  >
                    {formatLiveElapsed(elapsedSeconds)}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                    Started at {formatWallClockTime(activeSessionStartedAt)}
                  </p>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="mt-5">
                <p
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: theme.muted }}
                >
                  Current session
                </p>
                <p
                  className="mt-2 font-display text-4xl font-semibold tabular-nums sm:text-5xl"
                  style={{ color: theme.ink }}
                  data-testid="teacher-my-hours-live-timer"
                >
                  {formatLiveElapsed(elapsedSeconds)}
                </p>
                <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                  Started at {formatWallClockTime(activeSessionStartedAt)}
                </p>
              </div>
            )
          ) : null}

          {isToday ? (
            <SessionsTable
              theme={theme}
              sessions={closedSessions}
              activeSessionStartedAt={activeSessionStartedAt}
              elapsedSeconds={elapsedSeconds}
              animateRows
            />
          ) : isClockedIn && !dayLog ? (
            <SessionsTable
              theme={theme}
              sessions={closedSessions}
              activeSessionStartedAt={activeSessionStartedAt}
              elapsedSeconds={elapsedSeconds}
            />
          ) : null}

          <div className="mt-5 flex justify-center sm:justify-start">
            <motion.div whileTap={reducedMotion ? undefined : { scale: 0.98 }}>
              <ParentButton
                theme={theme}
                variant="primary"
                disabled={previewMode || isPending}
                onClick={isClockedIn ? onClockOut : onClockIn}
                className="inline-flex min-w-[10rem] items-center justify-center gap-2"
                data-testid="teacher-my-hours-clock-action"
              >
                {isPending ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden
                      data-testid="teacher-my-hours-clock-action-loading"
                    />
                    {clockActionPending === "in" ? "Clocking in…" : "Saving…"}
                  </>
                ) : isClockedIn ? (
                  <>
                    <LogOut className="h-4 w-4" aria-hidden />
                    Clock Out
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" aria-hidden />
                    Clock In
                  </>
                )}
              </ParentButton>
            </motion.div>
          </div>
        </>
      ) : !dayLog ? (
        <p className="mt-5 text-sm" style={{ color: theme.muted }}>
          No hours logged for this day.
        </p>
      ) : null}
    </ParentCard>
  );
}
