import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ParentAttendanceScreenController } from '@/components/parent/attendance/garden/use-parent-attendance-screen-controller';
import { useGardenToast } from '@/components/parent/garden/toast';
import type { AttendanceHistoryEntry } from '@/lib/attendance/attendance-types';
import {
  attendanceNeighbours,
  buildAttendanceRecentWeeks,
  countAttendanceByStatus,
  filterAttendanceEntries,
  groupAttendanceEntriesByMonth,
  type AttendanceFilter,
} from '@/lib/parent/parent-attendance-garden';
import { childFirstName } from '@/lib/parent/parent-children-utils';

/** Sheet state, the status filter and everything derived from the loaded entries. */
export function useParentAttendanceModel(controller: ParentAttendanceScreenController) {
  const toast = useGardenToast();
  const [filter, setFilter] = useState<AttendanceFilter>('all');
  const [openDate, setOpenDate] = useState<string | null>(null);

  const { entries, selectedChild, loadMoreFailedTick, loadMore } = controller;
  const studentId = selectedChild?.studentId ?? null;

  // A new child starts on "All" with no sheet open.
  useEffect(() => {
    setFilter('all');
    setOpenDate(null);
  }, [studentId]);

  // "Load more" failed: the loaded page stays; say so with a retry.
  useEffect(() => {
    if (loadMoreFailedTick === 0) return;
    toast.error("Couldn't load older days", {
      id: 'attendance-load-more',
      description: 'Check your connection, then try again.',
      action: { label: 'Try again', onPress: loadMore },
    });
  }, [loadMoreFailedTick, loadMore, toast]);

  const counts = useMemo(() => countAttendanceByStatus(entries), [entries]);
  const filtered = useMemo(() => filterAttendanceEntries(entries, filter), [entries, filter]);
  const groups = useMemo(() => groupAttendanceEntriesByMonth(filtered), [filtered]);
  const weeks = useMemo(() => buildAttendanceRecentWeeks(entries, 4), [entries]);
  const latest = entries[0] ?? null;

  const openEntry = useMemo<AttendanceHistoryEntry | null>(
    () => (openDate ? (entries.find((entry) => entry.date === openDate) ?? null) : null),
    [entries, openDate],
  );
  const neighbours = useMemo(
    () => (openDate ? attendanceNeighbours(entries, openDate) : { newer: null, older: null }),
    [entries, openDate],
  );

  const openDay = useCallback((entry: AttendanceHistoryEntry) => setOpenDate(entry.date), []);
  const closeDay = useCallback(() => setOpenDate(null), []);

  return {
    firstName: selectedChild ? childFirstName(selectedChild.studentName) : '',
    filter,
    setFilter,
    counts,
    filtered,
    groups,
    weeks,
    latest,
    openEntry,
    neighbours,
    openDay,
    closeDay,
  };
}

export type ParentAttendanceModel = ReturnType<typeof useParentAttendanceModel>;
