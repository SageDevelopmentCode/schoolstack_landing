import { useCallback, useState } from 'react';

import { closeThen, useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { notifyWebOnly, webAdminPath } from '@/components/school-admin/garden/admin-feedback';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import type { ClassroomSheetNotice } from '@/components/school-admin/students/garden/admin-classroom-assign-sheet';
import type { StudentsListController } from '@/components/school-admin/students/garden/use-students-list-controller';
import { haptic } from '@/lib/haptics';
import type { StudentRosterFilter } from '@/lib/school-admin/admin-student-roster-metrics';
import { formatEnrolledStudentName } from '@/lib/school-admin/enrolled-students';

function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/** "Oak Room" / "Oak Room and Pine Room" / "3 classrooms". */
export function classroomSummary(names: string[]): string {
  if (names.length === 0) return 'no classroom';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.length} classrooms`;
}

/**
 * Feedback for the Students roster: classroom saves with in-sheet status, then a
 * toast and a mint row flash once the sheet closes; pull-to-refresh toasts;
 * filter haptics; read-only preview; web-only Programs. The controller reports
 * failures, so `useAdminAction` gets no `operation` here.
 */
export function useStudentsListFeedback(controller: StudentsListController) {
  const action = useAdminAction(controller.organizationId);
  const { toast, reportError } = action;
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [sheetNotice, setSheetNotice] = useState<ClassroomSheetNotice | null>(null);
  const { pickerStudent, assignClassrooms, closeClassroomPicker, openClassroomPicker, classrooms, setRosterFilter } =
    controller;

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Students',
    id: 'admin-students-refresh',
  });

  const applyFilter = useCallback(
    (filter: StudentRosterFilter) => {
      haptic.select();
      setRosterFilter(filter);
    },
    [setRosterFilter],
  );

  const openPicker = useCallback(
    (student: Parameters<typeof openClassroomPicker>[0]) => {
      setSheetNotice(null);
      openClassroomPicker(student);
    },
    [openClassroomPicker],
  );

  const closePicker = useCallback(() => {
    setSheetNotice(null);
    closeClassroomPicker();
  }, [closeClassroomPicker]);

  /** Save from inside the sheet: status stays in the sheet; the toast waits for the close. */
  const saveClassrooms = useCallback(
    async (classroomIds: string[]): Promise<boolean> => {
      if (!pickerStudent) return false;
      if (readOnly) {
        setSheetNotice({
          tone: 'info',
          title: 'Read-only preview',
          description: 'Actions are turned off while previewing.',
        });
        return false;
      }
      const student = pickerStudent;
      const name = formatEnrolledStudentName(student);
      const key = `student-classrooms-${student.id}`;
      setSheetNotice(null);
      const ok = await action.run(() => assignClassrooms(student.id, classroomIds), {
        key,
        silent: true,
        error: (err) => ({ title: "Couldn't save classrooms", description: errorText(err, 'Failed to assign classrooms.') }),
      });
      if (!ok) {
        setSheetNotice({
          tone: 'error',
          title: "Classrooms weren't saved",
          description: `${name}'s classrooms haven't changed. Check your connection, then tap Save again.`,
        });
        return false;
      }
      const names = classrooms.filter((room) => classroomIds.includes(room.id)).map((room) => room.name);
      closeThen(closePicker, () => {
        toast.success(`Classrooms updated for ${student.firstName || name}`, {
          id: key,
          description:
            names.length > 0
              ? `${name} is now in ${classroomSummary(names)}.`
              : `${name} isn't in a classroom now.`,
        });
      });
      return true;
    },
    [action, assignClassrooms, classrooms, closePicker, pickerStudent, readOnly, toast],
  );

  /** "Programs" tile: programs are managed on the web portal. */
  const openPrograms = useCallback(() => {
    notifyWebOnly(toast, {
      webPath: webAdminPath(controller.slug, 'admissions', 'programs'),
      reportError,
      title: 'Programs are managed on the web portal',
      description: 'Filter by a program with the chips below the search.',
    });
  }, [controller.slug, reportError, toast]);

  return {
    action,
    readOnly,
    notifyReadOnly,
    pullRefreshing,
    onPullRefresh,
    applyFilter,
    openPicker,
    closePicker,
    saveClassrooms,
    sheetNotice,
    openPrograms,
  };
}

export type StudentsListFeedback = ReturnType<typeof useStudentsListFeedback>;
