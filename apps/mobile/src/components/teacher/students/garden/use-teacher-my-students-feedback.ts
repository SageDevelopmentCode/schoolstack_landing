import { useCallback, useState } from 'react';

import { closeThen, useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { useGardenToast } from '@/components/parent/garden/toast';
import {
  HEALTH_NOTES_FILTER,
  tileFilterAnnouncement,
} from '@/components/teacher/students/garden/teacher-my-students-status';
import type { TeacherMyStudentsController } from '@/components/teacher/students/garden/use-teacher-my-students-controller';
import { haptic } from '@/lib/haptics';
import { filterStudentsByRosterFilter } from '@/lib/school-admin/admin-student-roster-metrics';

/**
 * Wraps the My Students controller with feedback (toasts, haptics) without
 * changing what it does: number tiles filter the list and say what's shown,
 * pull to refresh confirms, and the Programs tile opens a picker.
 */
export function useTeacherMyStudentsFeedback(controller: TeacherMyStudentsController) {
  const toast = useGardenToast();
  const [programsOpen, setProgramsOpen] = useState(false);
  const {
    refreshAll,
    error,
    schoolError,
    students,
    filtering,
    changeRosterFilter,
    changeClassroomFilter,
    setSearchQuery,
  } = controller;

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: refreshAll,
    error: error ?? schoolError,
    label: 'My students',
    id: 'teacher-students-refresh',
  });

  /** A number tile: show only those students (search and classroom cleared) and say so. */
  const applyTileFilter = useCallback(
    (filter: string) => {
      const count =
        filter === HEALTH_NOTES_FILTER
          ? students.filter((student) => student.hasStandingHealthItems).length
          : filterStudentsByRosterFilter(students, filter).length;
      if (count === 0 && filter !== 'all') {
        // Nothing to filter to: say so instead of showing an empty list.
        haptic.tap();
        toast.info(
          filter === HEALTH_NOTES_FILTER
            ? 'No health notes on file'
            : filter === 'unassigned'
              ? 'Every student has a teacher'
              : `No students in ${filter}`,
          { id: 'teacher-students-filter', durationMs: 2600 },
        );
        return;
      }
      haptic.select();
      if (filter === 'all' && !filtering) return; // already showing everyone
      changeClassroomFilter('all');
      setSearchQuery('');
      changeRosterFilter(filter);
      toast.info(tileFilterAnnouncement(filter, count), {
        id: 'teacher-students-filter',
        description: filter === 'all' ? undefined : 'Tap "All" to see everyone again.',
        durationMs: 2600,
      });
    },
    [changeClassroomFilter, changeRosterFilter, filtering, setSearchQuery, students, toast],
  );

  const openPrograms = useCallback(() => {
    haptic.tap();
    setProgramsOpen(true);
  }, []);

  const closePrograms = useCallback(() => setProgramsOpen(false), []);

  const pickProgram = useCallback(
    (programName: string) => {
      closeThen(closePrograms, () => applyTileFilter(programName));
    },
    [applyTileFilter, closePrograms],
  );

  return {
    toast,
    pullRefreshing,
    onPullRefresh,
    applyTileFilter,
    programsOpen,
    openPrograms,
    closePrograms,
    pickProgram,
  };
}

export type TeacherMyStudentsFeedback = ReturnType<typeof useTeacherMyStudentsFeedback>;
