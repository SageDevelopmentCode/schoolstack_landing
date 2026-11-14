"use client";

import {
  ATTENDANCE_STATUSES,
  attendanceStatusLabel,
  type AttendanceRecentWeeks,
} from "@/components/school-parent/attendance/attendance-format";
import { formatAttendanceHistoryDateLabel } from "@/lib/school-admin/attendance/attendance-history";
import { ATTENDANCE_DOT } from "@/components/school-parent/attendance/garden/attendance-garden-tones";
import { GCard, GSkeleton, G_FOCUS, SPRINGY } from "@/components/school-parent/garden/ui";
import type { AttendanceHistoryEntry } from "@/lib/school-admin/attendance/attendance-types";

/*
 * A small calendar of the last few school weeks: one dot per day, coloured by
 * status. Days with a record open the day drawer. Built from loaded days only.
 */
export default function AttendanceRecentWeeksCard({
  weeks,
  loading,
  selectedDate,
  onSelectEntry,
}: {
  weeks: AttendanceRecentWeeks | null;
  loading: boolean;
  selectedDate: string | null;
  onSelectEntry: (entry: AttendanceHistoryEntry) => void;
}) {
  if (loading && !weeks) {
    return (
      <GCard index={3} kicker="Recent weeks" title="Week by week">
        <GSkeleton className="h-[170px] !rounded-[16px]" />
      </GCard>
    );
  }
  if (!weeks) return null;

  const cols = weeks.weekdays.length === 7 ? "grid-cols-7" : "grid-cols-5";

  return (
    <GCard
      index={3}
      kicker={`Recent weeks · ${weeks.rangeLabel}`}
      title="Week by week"
      data-testid="parent-attendance-recent-weeks"
    >
      <div className="flex flex-col gap-1.5">
        <div aria-hidden="true" className={`grid ${cols} gap-1.5`}>
          {weeks.weekdays.map((weekday) => (
            <span
              key={weekday}
              className="text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--sf-soft)]"
            >
              {weekday.slice(0, 2)}
            </span>
          ))}
        </div>
        {weeks.rows.map((row) => (
          <div key={row.weekStartKey} role="group" aria-label={row.label} className={`grid ${cols} gap-1.5`}>
            {row.days.map((day) => {
              const entry = day.entry;
              const label = `${formatAttendanceHistoryDateLabel(day.dateKey)}: ${entry ? attendanceStatusLabel(entry.status) : "No record"}`;
              const selected = entry !== null && day.dateKey === selectedDate;
              const face = (
                  <span
                    aria-hidden="true"
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] text-[12px] font-extrabold sm:h-9 sm:w-9 ${
                      entry
                        ? `${ATTENDANCE_DOT[entry.status]} text-[var(--sf-ink)]`
                        : "border-dashed border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)]/35"
                    } ${selected ? "ring-2 ring-[var(--sf-clay)] ring-offset-2 ring-offset-white" : ""}`}
                  >
                    {day.dayOfMonth}
                  </span>
              );
              return (
                <div key={day.dateKey} className="flex justify-center">
                  {entry ? (
                    <button
                      type="button"
                      onClick={() => onSelectEntry(entry)}
                      aria-label={label}
                      title={label}
                      data-testid={`parent-attendance-week-day-${day.dateKey}`}
                      className={`rounded-full hover:-translate-y-0.5 ${SPRINGY} ${G_FOCUS} focus-visible:ring-offset-0`}
                    >
                      {face}
                    </button>
                  ) : (
                    <span aria-label={label} title={label} role="img">
                      {face}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <ul className="m-0 mt-4 flex list-none flex-wrap gap-x-4 gap-y-1.5 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 p-0 pt-3">
        {ATTENDANCE_STATUSES.map((status) => (
          <li key={status} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[var(--sf-ink)]/75">
            <span aria-hidden="true" className={`h-3 w-3 rounded-full border-[1.5px] ${ATTENDANCE_DOT[status]}`} />
            {attendanceStatusLabel(status)}
          </li>
        ))}
        <li className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[var(--sf-ink)]/75">
          <span aria-hidden="true" className="h-3 w-3 rounded-full border-[1.5px] border-dashed border-[var(--sf-ink)]/30 bg-white" />
          No record
        </li>
      </ul>
      <p className="m-0 mt-2 text-[12px] font-semibold text-[var(--sf-soft)]">Tap a coloured day to see its details.</p>
    </GCard>
  );
}
