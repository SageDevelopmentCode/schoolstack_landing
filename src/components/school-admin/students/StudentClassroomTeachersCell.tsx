"use client";

import Link from "next/link";
import {
  formatAssignedTeachersLabel,
  type AssignedTeacher,
} from "@/lib/school-admin/enrolled-students";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type StudentClassroomTeachersCellProps = {
  C: AdminThemeTokens;
  assignedTeachers: AssignedTeacher[];
  classroomNames: string[];
  classroomsPath: string;
};

export default function StudentClassroomTeachersCell({
  C,
  assignedTeachers,
  classroomNames,
  classroomsPath,
}: StudentClassroomTeachersCellProps) {
  if (classroomNames.length === 0) {
    return (
      <div onClick={(event) => event.stopPropagation()}>
        <span className="text-xs" style={{ color: C.textTertiary }}>
          Assign a classroom first
        </span>
      </div>
    );
  }

  const isUnassigned = assignedTeachers.length === 0;
  const unassignedBorder = "#E8C58A";
  const unassignedText = "#A26B22";

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <div
        className="inline-flex min-w-[9rem] max-w-[14rem] items-center rounded-md border px-2.5 py-1.5 text-sm"
        style={{
          borderColor: isUnassigned ? unassignedBorder : C.inputBorder,
          backgroundColor: C.input,
          color: isUnassigned ? unassignedText : C.textPrimary,
        }}
      >
        <span className="truncate">{formatAssignedTeachersLabel(assignedTeachers)}</span>
      </div>
      {isUnassigned ? (
        <Link
          href={classroomsPath}
          className="mt-0.5 inline-block text-xs font-medium underline-offset-2 hover:underline"
          style={{ color: C.accent }}
          onClick={(event) => event.stopPropagation()}
        >
          Assign on Classrooms →
        </Link>
      ) : null}
    </div>
  );
}
