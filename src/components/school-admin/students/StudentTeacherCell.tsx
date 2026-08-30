"use client";

import StudentTeacherAssignSelect from "./StudentTeacherAssignSelect";
import type { AssignedTeacher } from "@/lib/school-admin/enrolled-students";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";

type StudentTeacherCellProps = {
  C: AdminThemeTokens;
  studentId: string;
  studentName: string;
  assignedTeachers: AssignedTeacher[];
  activeStaff: StaffMemberRecord[];
  staffPath: string;
  disabled?: boolean;
  onAssign: (studentId: string, staffMemberIds: string[]) => Promise<void>;
};

export default function StudentTeacherCell({
  C,
  studentId,
  studentName,
  assignedTeachers,
  activeStaff,
  staffPath,
  disabled = false,
  onAssign,
}: StudentTeacherCellProps) {
  return (
    <StudentTeacherAssignSelect
      C={C}
      studentId={studentId}
      studentName={studentName}
      assignedTeachers={assignedTeachers}
      activeStaff={activeStaff}
      staffPath={staffPath}
      disabled={disabled}
      onAssign={onAssign}
    />
  );
}
