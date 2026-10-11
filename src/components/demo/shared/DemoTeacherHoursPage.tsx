"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";
import DemoSchoolTeacherStoryProvider from "@/components/demo/shared/DemoSchoolTeacherStoryProvider";
import { TEACHER_DEMO_STORY_THEME } from "@/components/demo/shared/teacher-demo-runtime";
import { buildDemoTeacherHoursSummary } from "@/data/school-demos/demo-teacher-hours-fixtures";
import { useShowcaseDesktopEmbed } from "@/components/demo/shared/showcase-desktop-embed";
import { buildShowcaseTeacherHoursSummary } from "@/data/school-demos/demo-showcase-fixtures";

export default function DemoTeacherHoursPage() {
  const showcaseEmbed = useShowcaseDesktopEmbed();
  const summary = useMemo(
    () =>
      showcaseEmbed
        ? buildShowcaseTeacherHoursSummary()
        : buildDemoTeacherHoursSummary(),
    [showcaseEmbed],
  );
  const theme = TEACHER_DEMO_STORY_THEME;
  const rowCellClass = showcaseEmbed ? "px-4 py-2" : "px-4 py-3";

  return (
    <DemoSchoolTeacherStoryProvider className="flex min-h-0 flex-1 flex-col">
      <div
        className={`pointer-events-none flex min-h-0 flex-1 select-none flex-col px-6 ${showcaseEmbed ? "py-4" : "py-6"}`}
        style={{ backgroundColor: theme.paper, fontFamily: theme.fontBody }}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1
                className="font-display text-2xl font-semibold"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                My Hours
              </h1>
              <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                {summary.weekLabel}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-pill px-5 text-sm font-semibold text-white"
              style={{ backgroundColor: theme.primary }}
            >
              <Clock size={16} aria-hidden />
              {summary.clockedInToday ? "Clock out" : "Clock in"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 showcase:grid-cols-3 sm:grid-cols-3">
            <div
              className="rounded-lg border px-4 py-3"
              style={{
                borderColor: theme.line,
                backgroundColor: theme.white,
              }}
            >
              <p
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: theme.muted }}
              >
                This week
              </p>
              <p
                className="mt-1 text-2xl font-semibold tabular-nums"
                style={{ color: theme.ink }}
              >
                {summary.weekTotalHours}h
              </p>
            </div>
            <div
              className="rounded-lg border px-4 py-3"
              style={{
                borderColor: theme.line,
                backgroundColor: theme.white,
              }}
            >
              <p
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: theme.muted }}
              >
                This month
              </p>
              <p
                className="mt-1 text-2xl font-semibold tabular-nums"
                style={{ color: theme.ink }}
              >
                {summary.monthTotalHours}h
              </p>
            </div>
            {summary.scheduledWeekHours != null ? (
              <div
                className="col-span-2 rounded-lg border px-4 py-3 showcase:col-span-1 sm:col-span-1"
                style={{
                  borderColor: theme.line,
                  backgroundColor: theme.white,
                }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: theme.muted }}
                >
                  Scheduled
                </p>
                <p
                  className="mt-1 text-2xl font-semibold tabular-nums"
                  style={{ color: theme.ink }}
                >
                  {summary.scheduledWeekHours}h
                </p>
              </div>
            ) : null}
            {summary.clockedInToday && summary.todayClockIn ? (
              <div
                className="col-span-2 rounded-lg border px-4 py-3 showcase:col-span-1 sm:col-span-1"
                style={{
                  borderColor: theme.line,
                  backgroundColor: theme.white,
                }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: theme.muted }}
                >
                  Today
                </p>
                <p className="mt-1 text-sm font-medium" style={{ color: theme.ink }}>
                  Clocked in at {summary.todayClockIn}
                </p>
              </div>
            ) : null}
          </div>

          <div
            className="overflow-hidden rounded-lg border"
            style={{ borderColor: theme.line, backgroundColor: theme.white }}
          >
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  className="border-b text-[11px] font-bold uppercase tracking-wider"
                  style={{ borderColor: theme.line, color: theme.muted }}
                >
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">In</th>
                  <th className="px-4 py-3">Out</th>
                  <th className="px-4 py-3 text-right">Hours</th>
                </tr>
              </thead>
              <tbody>
                {summary.entries.map((entry) => (
                  <tr
                    key={entry.date}
                    className="border-b last:border-b-0"
                    style={{ borderColor: theme.line, color: theme.ink }}
                  >
                    <td className={`${rowCellClass} font-medium`}>{entry.date}</td>
                    <td className={rowCellClass}>{entry.clockIn}</td>
                    <td className={rowCellClass}>{entry.clockOut}</td>
                    <td className={`${rowCellClass} text-right tabular-nums`}>
                      {entry.hours > 0 ? `${entry.hours}h` : entry.note ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DemoSchoolTeacherStoryProvider>
  );
}
