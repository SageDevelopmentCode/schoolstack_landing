"use client";

import { useCallback, useMemo, useState } from "react";
import AttendanceDayDrawer from "@/components/school-parent/attendance/garden/AttendanceDayDrawer";
import AttendanceHistoryCard from "@/components/school-parent/attendance/garden/AttendanceHistoryCard";
import AttendanceLatestDayCard from "@/components/school-parent/attendance/garden/AttendanceLatestDayCard";
import AttendanceRecentWeeksCard from "@/components/school-parent/attendance/garden/AttendanceRecentWeeksCard";
import {
  buildAttendanceRecentWeeks,
  countAttendanceByStatus,
  type AttendanceFilter,
} from "@/components/school-parent/attendance/attendance-format";
import { useParentAttendanceHistory } from "@/components/school-parent/attendance/useParentAttendanceHistory";
import type {
  AttendanceHistoryEntry,
  AttendanceHistoryResponse,
} from "@/lib/school-admin/attendance/attendance-types";

type ParentAttendanceHistoryPanelProps = {
  organizationId: string;
  studentId: string;
  studentName: string;
  previewMode?: boolean;
  initialHistory?: AttendanceHistoryResponse;
};

/**
 * One child's attendance (keyed per child by the page):
 *   [latest day · history]  |  rail: [recent weeks]
 * plus the day drawer. All data comes from useParentAttendanceHistory.
 */
export default function ParentAttendanceHistoryPanel({
  organizationId,
  studentId,
  studentName,
  previewMode = false,
  initialHistory,
}: ParentAttendanceHistoryPanelProps) {
  const history = useParentAttendanceHistory({
    organizationId,
    studentId,
    studentName,
    previewMode,
    initialHistory,
  });
  const { entries, loading, firstName } = history;

  const [filter, setFilter] = useState<AttendanceFilter>("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const counts = useMemo(() => countAttendanceByStatus(entries), [entries]);
  const weeks = useMemo(() => buildAttendanceRecentWeeks(entries), [entries]);
  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.date === selectedDate) ?? null,
    [entries, selectedDate],
  );
  const latest = entries[0] ?? null;

  const selectEntry = useCallback((entry: AttendanceHistoryEntry) => setSelectedDate(entry.date), []);
  const closeDrawer = useCallback(() => setSelectedDate(null), []);

  const loadOlderFromDrawer = useCallback(async () => {
    const next = await history.loadMore();
    if (next && next[0]) setSelectedDate(next[0].date);
  }, [history]);

  const showRail = !history.error && (loading || entries.length > 0);

  return (
    <>
      <div className={`grid items-start gap-5 ${showRail ? "lg:grid-cols-[1.55fr_1fr]" : ""}`}>
        <div className="flex min-w-0 flex-col gap-5">
          {!history.error ? (
            <AttendanceLatestDayCard
              entry={latest}
              firstName={firstName}
              loading={loading}
              onOpen={selectEntry}
            />
          ) : null}
          <AttendanceHistoryCard
            history={history}
            counts={counts}
            filter={filter}
            onFilterChange={setFilter}
            selectedDate={selectedDate}
            onSelectEntry={selectEntry}
            previewMode={previewMode}
          />
        </div>

        {showRail ? (
          <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6">
            <AttendanceRecentWeeksCard
              weeks={weeks}
              loading={loading}
              selectedDate={selectedDate}
              onSelectEntry={selectEntry}
            />
          </div>
        ) : null}
      </div>

      <AttendanceDayDrawer
        entry={selectedEntry}
        entries={entries}
        firstName={firstName}
        hasMore={!previewMode && history.hasMore}
        loadingMore={history.loadingMore}
        onClose={closeDrawer}
        onNavigate={selectEntry}
        onLoadOlder={() => void loadOlderFromDrawer()}
      />
    </>
  );
}
