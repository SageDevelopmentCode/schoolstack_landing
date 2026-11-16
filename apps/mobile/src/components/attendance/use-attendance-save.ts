import { useCallback } from 'react';

import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { useAttendance } from '@/contexts/attendance-context';
import type {
  AttendanceAction,
  AttendancePickupSelection,
  AttendanceRosterStudent,
} from '@/lib/attendance/attendance-types';

function firstNameOf(student: AttendanceRosterStudent) {
  return student.firstName.trim() || student.lastName.trim() || 'Student';
}

function successSpec(student: AttendanceRosterStudent, action: AttendanceAction, pickupName?: string | null) {
  const name = firstNameOf(student);
  switch (action) {
    case 'present':
      return { title: `${name} marked present.`, description: 'Tap Pickup when they head home.' };
    case 'absent':
      return { title: `${name} marked absent.`, description: 'Open their details to change it.' };
    case 'pickup':
      return {
        title: `${name} picked up.`,
        description: pickupName ? `Picked up by ${pickupName}.` : undefined,
      };
  }
}

function errorSpec(student: AttendanceRosterStudent, action: AttendanceAction) {
  const name = firstNameOf(student);
  const verb =
    action === 'present' ? `mark ${name} present` : action === 'absent' ? `mark ${name} absent` : `record ${name}'s pickup`;
  return {
    title: `Couldn't ${verb}`,
    description: "Their attendance didn't change. Check your connection, then try again.",
  };
}

/**
 * Attendance saves with the admin feedback contract: success toast + mint row
 * flash, error toast with Retry. `saveAction` already reports failures, so this
 * never reports again. Inside a sheet pass `silent` and show status there.
 */
export function useAttendanceSave() {
  const { organizationId, saveAction } = useAttendance();
  const action = useAdminAction(organizationId);
  const { run, toast, flash } = action;

  const save = useCallback(
    (
      student: AttendanceRosterStudent,
      kind: AttendanceAction,
      options: { selection?: AttendancePickupSelection; pickupName?: string | null; silent?: boolean } = {},
    ) =>
      run(() => saveAction(student, kind, options.selection), {
        key: `attendance-${student.id}`,
        failed: (ok) => !ok,
        success: successSpec(student, kind, options.pickupName),
        error: errorSpec(student, kind),
        retry: true,
        silent: options.silent,
      }),
    [run, saveAction],
  );

  /** Toast + flash for a save that finished inside a sheet (call after the sheet closes). */
  const announce = useCallback(
    (student: AttendanceRosterStudent, kind: AttendanceAction, pickupName?: string | null) => {
      const spec = successSpec(student, kind, pickupName);
      toast.success(spec.title, { id: `attendance-${student.id}`, description: spec.description });
      flash(`attendance-${student.id}`);
    },
    [flash, toast],
  );

  return { save, announce, flashKey: action.flashKey };
}

export type AttendanceSave = ReturnType<typeof useAttendanceSave>;
