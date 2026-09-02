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
  staffLoading?: boolean;
  disabled?: boolean;
  onAssign: (studentId: string, staffMemberIds: string[]) => Promise<void>;
  onInteract?: () => void;
};

export default function StudentTeacherCell({
  C,
  studentId,
  studentName,
  assignedTeachers,
  activeStaff,
  staffPath,
  staffLoading = false,
  disabled = false,
  onAssign,
  onInteract,
}: StudentTeacherCellProps) {
  return (
    <StudentTeacherAssignSelect
      C={C}
      studentId={studentId}
      studentName={studentName}
      assignedTeachers={assignedTeachers}
      activeStaff={activeStaff}
      staffPath={staffPath}
      staffLoading={staffLoading}
      disabled={disabled}
      onAssign={onAssign}
      onInteract={onInteract}
    />
  );
}
