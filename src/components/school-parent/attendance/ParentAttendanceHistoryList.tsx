"use client";

import { CalendarCheck } from "lucide-react";
import { groupAttendanceEntriesByMonth } from "@/components/school-parent/attendance/attendance-format";
import { GIcon, GKicker } from "@/components/school-parent/garden/ui";
import type { AttendanceHistoryEntry } from "@/lib/school-admin/attendance/attendance-types";
import ParentAttendanceHistoryListItem from "./ParentAttendanceHistoryListItem";
import ParentAttendanceHistoryListSkeleton from "./ParentAttendanceHistoryListSkeleton";

type ParentAttendanceHistoryListProps = {
  entries: AttendanceHistoryEntry[];
  loading?: boolean;
  loadingMore?: boolean;
  emptyMessage?: string;
  selectedDate?: string | null;
  onSelectEntry: (entry: AttendanceHistoryEntry) => void;
};

/**
 * Notebook list of recorded days, grouped under sticky month kickers.
 * Empty = no records at all (filtered-out states are handled by the card).
 */
export default function ParentAttendanceHistoryList({
  entries,
  loading = false,
  loadingMore = false,
  emptyMessage = "No attendance records yet.",
  selectedDate = null,
  onSelectEntry,
}: ParentAttendanceHistoryListProps) {
  if (loading && entries.length === 0) {
    return <ParentAttendanceHistoryListSkeleton rowCount={6} />;
  }

  if (entries.length === 0) {
    return (
      <div
        className="flex items-start gap-4 rounded-[18px] bg-[var(--sf-paper)] p-5"
        data-testid="parent-attendance-history-empty"
      >
        <GIcon>
          <CalendarCheck />
        </GIcon>
        <div className="min-w-0">
          <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">{emptyMessage}</p>
          <p className="m-0 mt-1 text-[13px] font-semibold leading-relaxed text-[var(--sf-soft)]">
            Each school day shows up here once the school marks attendance.
          </p>
          <span aria-hidden="true" className="sf-hand mt-1.5 block text-lg text-[var(--sf-forest)]">
            fresh page, ready to fill ✿
          </span>
        </div>
      </div>
    );
  }

  const groups = groupAttendanceEntriesByMonth(entries);

  return (
    <div data-testid="parent-attendance-history-list" className="flex flex-col gap-3">
      {groups.map((group) => (
        <section key={group.key} aria-label={group.label}>
          <div className="sticky top-0 z-[1] -mx-1 flex items-center justify-between bg-white/95 px-1 py-1.5 backdrop-blur-sm">
            <GKicker>{group.label}</GKicker>
            <span className="text-[12px] font-bold text-[var(--sf-soft)]">
              {group.entries.length} {group.entries.length === 1 ? "day" : "days"}
            </span>
          </div>
          <ul className="m-0 list-none rounded-[16px] bg-[var(--sf-paper)] border-[1.5px] border-[var(--sf-ink)]/10 p-1">
            {group.entries.map((entry) => (
              <ParentAttendanceHistoryListItem
                key={entry.date}
                entry={entry}
                selected={entry.date === selectedDate}
                onSelect={onSelectEntry}
              />
            ))}
          </ul>
        </section>
      ))}
      {loadingMore ? (
        <ParentAttendanceHistoryListSkeleton rowCount={3} label="Loading more days" />
      ) : null}
    </div>
  );
}
