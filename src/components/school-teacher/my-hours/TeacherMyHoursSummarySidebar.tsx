"use client";

import { TrendingUp } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import { formatHoursMinutes } from "@/lib/school-teacher/my-hours/format-duration";
import type { MyHoursSidebarSummary } from "@/lib/school-teacher/my-hours/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherMyHoursSummarySidebarProps = {
  theme: ParentThemeTokens;
  summary: MyHoursSidebarSummary;
  clockedIn: boolean;
  todayLiveMinutes?: number | null;
};

export default function TeacherMyHoursSummarySidebar({
  theme,
  summary,
  clockedIn,
  todayLiveMinutes = null,
}: TeacherMyHoursSummarySidebarProps) {
  const weekProgress = summary.week.goalMinutes
    ? Math.min(100, (summary.week.loggedMinutes / summary.week.goalMinutes) * 100)
    : 0;
  const remainingMinutes = Math.max(
    0,
    summary.week.goalMinutes - summary.week.loggedMinutes,
  );

  return (
    <aside className="flex flex-col gap-4" data-testid="teacher-my-hours-sidebar">
      <ParentCard theme={theme} className="p-5">
        <p
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: theme.muted }}
        >
          This week
        </p>
        <p className="mt-2 font-display text-3xl font-semibold tabular-nums" style={{ color: theme.ink }}>
          {formatHoursMinutes(summary.week.loggedMinutes)}
        </p>
        <p className="text-sm" style={{ color: theme.muted }}>
          of {formatHoursMinutes(summary.week.goalMinutes)}
        </p>
        <div
          className="mt-4 h-2 overflow-hidden rounded-full"
          style={{ backgroundColor: "#E6ECE7" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${weekProgress}%`,
              backgroundColor: theme.primary,
            }}
          />
        </div>
        <div className="mt-3 flex justify-between text-xs" style={{ color: theme.muted }}>
          <span>
            {summary.week.loggedWeekdays}/{summary.week.totalWeekdays} days
          </span>
          <span>{formatHoursMinutes(remainingMinutes)} to go</span>
        </div>
      </ParentCard>

      <div className="grid grid-cols-2 gap-3">
        <ParentCard theme={theme} className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>
            Today
          </p>
          <p className="mt-2 text-xl font-semibold tabular-nums" style={{ color: theme.ink }}>
            {todayLiveMinutes != null
              ? formatHoursMinutes(todayLiveMinutes)
              : summary.todayMinutes != null
                ? formatHoursMinutes(summary.todayMinutes)
                : "—"}
          </p>
          <p className="mt-1 text-xs" style={{ color: theme.muted }}>
            {clockedIn
              ? "Clocked in"
              : todayLiveMinutes != null || summary.todayMinutes != null
                ? "Logged"
                : "Not clocked in"}
          </p>
        </ParentCard>
        <ParentCard theme={theme} className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>
            Month
          </p>
          <p className="mt-2 text-xl font-semibold tabular-nums" style={{ color: theme.ink }}>
            {formatHoursMinutes(summary.monthLoggedMinutes)}
          </p>
          <p className="mt-1 text-xs" style={{ color: theme.muted }}>
            {summary.monthLoggedDays} {summary.monthLoggedDays === 1 ? "day" : "days"} logged
          </p>
        </ParentCard>
      </div>

      <ParentCard theme={theme} className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color: theme.primary }} aria-hidden />
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>
            Recent
          </p>
        </div>
        <ul className="space-y-3">
          {summary.recent.map((entry) => (
            <li
              key={entry.label}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div>
                <p className="font-semibold" style={{ color: theme.ink }}>
                  {entry.label}
                </p>
                <p className="text-xs" style={{ color: theme.muted }}>
                  {entry.sessionCount} {entry.sessionCount === 1 ? "session" : "sessions"}
                </p>
              </div>
              <span className="font-semibold tabular-nums" style={{ color: theme.ink }}>
                {formatHoursMinutes(entry.totalMinutes)}
              </span>
            </li>
          ))}
        </ul>
      </ParentCard>
    </aside>
  );
}
