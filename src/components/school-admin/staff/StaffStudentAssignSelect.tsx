"use client";

import { useMemo } from "react";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import {
  formatEnrolledStudentName,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type StaffStudentAssignSelectProps = {
  C: AdminThemeTokens;
  staffMemberId: string;
  enrolledStudents: AdminEnrolledStudentSummary[];
  disabled?: boolean;
  assigning?: boolean;
  onAssign: (studentId: string) => Promise<void>;
  className?: string;
};

function studentSortKey(student: AdminEnrolledStudentSummary): string {
  return formatEnrolledStudentName(student).toLowerCase();
}

function studentOptionLabel(
  student: AdminEnrolledStudentSummary,
  staffMemberId: string,
): string {
  const name = formatEnrolledStudentName(student);
  if (
    student.assignedTeacherName &&
    student.assignedTeacherId !== staffMemberId
  ) {
    return `${name} (${student.assignedTeacherName})`;
  }
  return name;
}

export default function StaffStudentAssignSelect({
  C,
  staffMemberId,
  enrolledStudents,
  disabled = false,
  assigning = false,
  onAssign,
  className,
}: StaffStudentAssignSelectProps) {
  const assignableStudents = useMemo(
    () =>
      [...enrolledStudents]
        .filter((student) => student.assignedTeacherId !== staffMemberId)
        .sort((a, b) => studentSortKey(a).localeCompare(studentSortKey(b))),
    [enrolledStudents, staffMemberId],
  );

  const options = useMemo(
    () =>
      assignableStudents.map((student) => ({
        value: student.id,
        label: studentOptionLabel(student, staffMemberId),
      })),
    [assignableStudents],
  );

  if (assignableStudents.length === 0) {
    return (
      <p className={className} style={{ color: C.textTertiary }}>
        All enrolled students are already assigned to this staff member.
      </p>
    );
  }

  return (
    <div className={className}>
      <SchoolAdminSelect
        value=""
        onChange={(value) => {
          if (!value || assigning) return;
          void onAssign(value);
        }}
        options={options}
        placeholder={assigning ? "Assigning…" : "Select student to assign…"}
        disabled={disabled || assigning}
        ariaLabel="Assign student"
        C={C}
        triggerClassName="min-w-[12rem] max-w-full text-sm"
      />
    </div>
  );
}
