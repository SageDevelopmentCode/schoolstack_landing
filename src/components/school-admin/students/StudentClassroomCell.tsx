"use client";

import StudentClassroomAssignSelect from "./StudentClassroomAssignSelect";
import type { ClassroomSummary } from "@/lib/school-admin/classrooms";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type StudentClassroomCellProps = {
  C: AdminThemeTokens;
  studentId: string;
  studentName: string;
  studentProgramNames: string[];
  classroomIds: string[];
  classroomNames: string[];
  classrooms: ClassroomSummary[];
  classroomsPath: string;
  classroomsLoading?: boolean;
  classroomsLoaded?: boolean;
  disabled?: boolean;
  onAssign: (studentId: string, classroomIds: string[]) => Promise<void>;
  onInteract?: () => void;
};

export default function StudentClassroomCell({
  C,
  studentId,
  studentName,
  studentProgramNames,
  classroomIds,
  classroomNames,
  classrooms,
  classroomsPath,
  classroomsLoading = false,
  classroomsLoaded = false,
  disabled = false,
  onAssign,
  onInteract,
}: StudentClassroomCellProps) {
  return (
    <StudentClassroomAssignSelect
      C={C}
      studentId={studentId}
      studentName={studentName}
      studentProgramNames={studentProgramNames}
      classroomIds={classroomIds}
      classroomNames={classroomNames}
      classrooms={classrooms}
      classroomsPath={classroomsPath}
      classroomsLoading={classroomsLoading}
      classroomsLoaded={classroomsLoaded}
      disabled={disabled}
      onAssign={onAssign}
      onInteract={onInteract}
    />
  );
}
