"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { AttendanceHistoryEntry } from "@/lib/school-admin/attendance/attendance-types";
import AttendanceHistoryListItem from "./AttendanceHistoryListItem";

type AttendanceHistoryListProps = {
  entries: AttendanceHistoryEntry[];
  C: AdminThemeTokens;
  loading?: boolean;
  emptyMessage?: string;
  highlightDate?: string | null;
};

export default function AttendanceHistoryList({
  entries,
  C,
  loading = false,
  emptyMessage = "No attendance records yet.",
  highlightDate,
}: AttendanceHistoryListProps) {
  if (loading) {
    return (
      <div className="space-y-0">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-14 animate-pulse border-t"
            style={{ borderColor: "#EDF1ED", backgroundColor: C.elevated }}
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="py-2 text-sm" style={{ color: C.textSecondary }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div>
      {entries.map((entry) => (
        <AttendanceHistoryListItem
          key={entry.date}
          entry={entry}
          C={C}
          highlightDate={highlightDate}
        />
      ))}
    </div>
  );
}
