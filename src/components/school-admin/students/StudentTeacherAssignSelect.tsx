"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  staffLoading?: boolean;
  staffLoaded?: boolean;
  disabled?: boolean;
  onAssign: (studentId: string, staffMemberIds: string[]) => Promise<void>;
  onInteract?: () => void;
  className?: string;
};

export default function StudentTeacherAssignSelect({
  C,
  studentId,
  studentName,
  assignedTeachers,
  activeStaff,
  staffPath,
  staffLoading = false,
  staffLoaded = false,
  disabled = false,
  onAssign,
  onInteract,
  className,
}: StudentTeacherAssignSelectProps) {
  const [open, setOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);

  useEffect(() => {
    if (!pendingOpen || !staffLoaded || staffLoading) return;

    queueMicrotask(() => {
      if (activeStaff.length > 0) {
        setOpen(true);
      }
      setPendingOpen(false);
    });
  }, [pendingOpen, staffLoaded, staffLoading, activeStaff.length]);

  if (staffLoading) {
    return (
      <div className={className}>
        <span className="text-xs" style={{ color: C.textTertiary }}>
          Loading staff...
        </span>
      </div>
    );
  }

  if (staffLoaded && activeStaff.length === 0) {
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

  const isUnassigned = assignedTeachers.length === 0;
  const unassignedBorder = "#E8C58A";
  const unassignedText = "#A26B22";

  const handleButtonClick = () => {
    if (staffLoaded && activeStaff.length > 0) {
      setOpen(true);
      return;
    }

    onInteract?.();
    setPendingOpen(true);
  };

  return (
    <div
      className={className}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={handleButtonClick}
        className="inline-flex min-w-[9rem] max-w-[14rem] items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm disabled:opacity-60"
        style={{
          borderColor: isUnassigned ? unassignedBorder : C.inputBorder,
          backgroundColor: C.input,
          color: isUnassigned ? unassignedText : C.textPrimary,
        }}
        aria-label="Assign teachers"
      >
        <span className="truncate">
          {formatAssignedTeachersLabel(assignedTeachers)}
        </span>
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0"
          style={{ color: isUnassigned ? unassignedBorder : C.textTertiary }}
        />
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
