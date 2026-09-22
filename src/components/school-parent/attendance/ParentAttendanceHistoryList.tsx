"use client";

import type { AttendanceHistoryEntry } from "@/lib/school-admin/attendance/attendance-types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import ParentAttendanceHistoryListItem from "./ParentAttendanceHistoryListItem";
import ParentAttendanceHistoryListSkeleton from "./ParentAttendanceHistoryListSkeleton";

type ParentAttendanceHistoryListProps = {
  entries: AttendanceHistoryEntry[];
  theme: ParentThemeTokens;
  loading?: boolean;
  loadingMore?: boolean;
  emptyMessage?: string;
  onSelectEntry: (entry: AttendanceHistoryEntry) => void;
};

export default function ParentAttendanceHistoryList({
  entries,
  theme,
  loading = false,
  loadingMore = false,
  emptyMessage = "No attendance records yet.",
  onSelectEntry,
}: ParentAttendanceHistoryListProps) {
  if (loading && entries.length === 0) {
    return <ParentAttendanceHistoryListSkeleton theme={theme} rowCount={9} />;
  }

  if (entries.length === 0) {
    return (
      <p
        className="py-2 text-[13px]"
        style={{ color: theme.muted }}
        data-testid="parent-attendance-history-empty"
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div data-testid="parent-attendance-history-list">
      {entries.map((entry) => (
        <ParentAttendanceHistoryListItem
          key={entry.date}
          entry={entry}
          theme={theme}
          onSelect={onSelectEntry}
        />
      ))}
      {loadingMore ? (
        <ParentAttendanceHistoryListSkeleton theme={theme} rowCount={3} />
      ) : null}
    </div>
  );
}
