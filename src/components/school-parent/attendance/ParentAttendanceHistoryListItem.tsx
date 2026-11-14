"use client";

import { ChevronRight } from "lucide-react";
import {
  attendanceMetaLine,
  attendanceRelativeDayLabel,
  attendanceStatusLabel,
  attendanceStatusTone,
} from "@/components/school-parent/attendance/attendance-format";
import { AttendanceStatusMark } from "@/components/school-parent/attendance/garden/attendance-garden-tones";
import { GChip, G_FOCUS } from "@/components/school-parent/garden/ui";
import { formatAttendanceHistoryDateLabel } from "@/lib/school-admin/attendance/attendance-history";
import type { AttendanceHistoryEntry } from "@/lib/school-admin/attendance/attendance-types";

type ParentAttendanceHistoryListItemProps = {
  entry: AttendanceHistoryEntry;
  selected?: boolean;
  onSelect: (entry: AttendanceHistoryEntry) => void;
};

/** One notebook row: status mark, date + time · status, status chip, chevron. */
export default function ParentAttendanceHistoryListItem({
  entry,
  selected = false,
  onSelect,
}: ParentAttendanceHistoryListItemProps) {
  const dateLabel = formatAttendanceHistoryDateLabel(entry.date);
  const relative = attendanceRelativeDayLabel(entry.date);
  const isRecent = relative === "Today" || relative === "Yesterday";

  return (
    <li className="border-t border-dashed border-[var(--sf-ink)]/12 first:border-t-0">
      <button
        type="button"
        onClick={() => onSelect(entry)}
        aria-label={`View attendance for ${dateLabel}`}
        aria-current={selected ? "true" : undefined}
        data-testid={`parent-attendance-history-item-${entry.date}`}
        className={`group relative flex min-h-[56px] w-full items-center gap-3 rounded-[14px] px-2.5 py-2.5 text-left transition-colors duration-200 ${G_FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0 ${
          selected ? "bg-[var(--sf-accent-wash)]" : "hover:bg-[var(--sf-accent-wash)]"
        }`}
      >
        {selected ? (
          <span
            aria-hidden="true"
            className="absolute inset-y-2 left-0 w-1 rounded-full bg-[var(--sf-clay)]"
          />
        ) : null}
        <AttendanceStatusMark status={entry.status} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[15px] font-extrabold leading-tight text-[var(--sf-ink)]">
              {dateLabel}
            </span>
            {isRecent ? (
              <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-clay-deep)]">
                {relative}
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block truncate text-[13px] font-semibold text-[var(--sf-soft)]">
            {attendanceMetaLine(entry)}
          </span>
        </span>
        <GChip tone={attendanceStatusTone(entry.status)} className="hidden sm:inline-flex">
          {attendanceStatusLabel(entry.status)}
        </GChip>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--sf-ink)]/70"
          aria-hidden="true"
        />
      </button>
    </li>
  );
}
