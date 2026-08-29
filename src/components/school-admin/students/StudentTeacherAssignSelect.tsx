"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import StudentTeacherAssignSheet from "./StudentTeacherAssignSheet";
import {
  formatAssignedTeachersLabel,
  type AssignedTeacher,
} from "@/lib/school-admin/enrolled-students";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";

type StudentTeacherAssignSelectProps = {
  C: AdminThemeTokens;
  studentId: string;
  studentName: string;
  assignedTeachers: AssignedTeacher[];
  activeStaff: StaffMemberRecord[];
  staffPath: string;
  disabled?: boolean;
  onAssign: (studentId: string, staffMemberIds: string[]) => Promise<void>;
  className?: string;
};

export default function StudentTeacherAssignSelect({
  C,
  studentId,
  studentName,
  assignedTeachers,
  activeStaff,
  staffPath,
  disabled = false,
  onAssign,
  className,
}: StudentTeacherAssignSelectProps) {
  const [open, setOpen] = useState(false);

  if (activeStaff.length === 0) {
    return (
      <div className={className}>
        <p className="text-xs" style={{ color: C.textTertiary }}>
          No staff yet
        </p>
        <Link
          href={staffPath}
          className="mt-0.5 inline-block text-xs font-medium underline-offset-2 hover:underline"
          style={{ color: C.accent }}
          onClick={(event) => event.stopPropagation()}
        >
          Add staff →
        </Link>
      </div>
    );
  }

  return (
    <div
      className={className}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="inline-flex min-w-[9rem] max-w-[14rem] items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm disabled:opacity-60"
        style={{
          borderColor: C.inputBorder,
          backgroundColor: C.input,
          color: assignedTeachers.length > 0 ? C.textPrimary : C.textTertiary,
        }}
        aria-label="Assign teachers"
      >
        <span className="truncate">
          {formatAssignedTeachersLabel(assignedTeachers)}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: C.textTertiary }} />
      </button>

      <StudentTeacherAssignSheet
        open={open}
        onClose={() => setOpen(false)}
        studentName={studentName}
        assignedTeachers={assignedTeachers}
        activeStaff={activeStaff}
        saving={disabled}
        C={C}
        onSave={async (staffMemberIds) => {
          await onAssign(studentId, staffMemberIds);
        }}
      />
    </div>
  );
}
