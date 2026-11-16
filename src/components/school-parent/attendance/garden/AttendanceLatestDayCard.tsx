"use client";

import { ArrowRight } from "lucide-react";
import {
  attendanceDayTimeline,
  attendanceRelativeDayLabel,
  attendanceStaffRecorder,
  attendanceStatusLabel,
} from "@/components/school-parent/attendance/attendance-format";
import {
  ATTENDANCE_PANEL_BG,
  AttendanceStatusMark,
} from "@/components/school-parent/attendance/garden/attendance-garden-tones";
import { GCard, GSkeleton, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { formatAttendanceHistoryFullDateLabel } from "@/lib/school-admin/attendance/attendance-history";
import type { AttendanceHistoryEntry } from "@/lib/school-admin/attendance/attendance-types";

/*
 * The page's primary status: the most recent recorded day as a pastel strip
 * (status, date, check-in → pickup times, who recorded it) with the one toy
 * button that opens the full day.
 */
export default function AttendanceLatestDayCard({
  entry,
  firstName,
  loading,
  onOpen,
}: {
  entry: AttendanceHistoryEntry | null;
  firstName: string;
  loading: boolean;
  onOpen: (entry: AttendanceHistoryEntry) => void;
}) {
  if (loading && !entry) {
    return (
      <GCard index={1} kicker="Latest day" title={`${firstName}'s most recent day`}>
        <GSkeleton className="h-[132px] !rounded-[18px]" />
      </GCard>
    );
  }

  if (!entry) return null;

  const relative = attendanceRelativeDayLabel(entry.date);
  const fullDate = formatAttendanceHistoryFullDateLabel(entry.date);
  const steps = attendanceDayTimeline(entry);
  const recorder = attendanceStaffRecorder(entry);
  const label = attendanceStatusLabel(entry.status);

  return (
    <GCard
      index={1}
      kicker={`Latest day · ${relative}`}
      title={`${firstName}'s most recent day`}
      data-testid="parent-attendance-latest-day"
    >
      <div
        className={`flex flex-col gap-4 rounded-[18px] p-4 sm:flex-row sm:items-center sm:p-5 ${ATTENDANCE_PANEL_BG[entry.status]}`}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <AttendanceStatusMark status={entry.status} size="lg" />
          <div className="min-w-0">
            <p className="sf-display m-0 text-[1.9rem] leading-none text-[var(--sf-ink)]">{label}</p>
            <p className="m-0 mt-1.5 text-[13px] font-extrabold text-[var(--sf-ink)]/75">{fullDate}</p>
            {steps.length > 0 ? (
              <ol className="m-0 mt-2.5 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0 text-[13px] font-semibold text-[var(--sf-ink)]/80">
                {steps.map((step, index) => (
                  <li key={step.key} className="inline-flex items-center gap-2">
                    {index > 0 ? (
                      <ArrowRight className="h-3.5 w-3.5 text-[var(--sf-ink)]/45" aria-hidden="true" />
                    ) : null}
                    <span>
                      <span className="font-extrabold text-[var(--sf-ink)]">{step.label}</span>
                      {step.time ? ` ${step.time}` : ""}
                      {step.detail ? ` ${step.detail}` : ""}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
            {recorder ? (
              <p className="m-0 mt-1 text-[12px] font-semibold text-[var(--sf-ink)]/65">
                Recorded by {recorder.name}
              </p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          className={`${gBtnPopSm} w-full shrink-0 sm:w-auto`}
          onClick={() => onOpen(entry)}
          data-testid="parent-attendance-latest-open"
        >
          View day details <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </GCard>
  );
}
