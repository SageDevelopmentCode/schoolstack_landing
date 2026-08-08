"use client";

import Link from "next/link";
import { useMemo } from "react";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import { formatStaffMemberName } from "@/lib/school-admin/enrolled-students";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";

type StudentTeacherAssignSelectProps = {
  C: AdminThemeTokens;
  studentId: string;
  assignedTeacherId: string | null;
  activeStaff: StaffMemberRecord[];
  staffPath: string;
  disabled?: boolean;
  onAssign: (
    studentId: string,
    staffMemberId: string | null,
  ) => Promise<void>;
  className?: string;
};

function staffSortKey(member: StaffMemberRecord): string {
  return formatStaffMemberName(member).toLowerCase();
}

export default function StudentTeacherAssignSelect({
  C,
  studentId,
  assignedTeacherId,
  activeStaff,
  staffPath,
  disabled = false,
  onAssign,
  className,
}: StudentTeacherAssignSelectProps) {
  const sortedStaff = useMemo(
    () =>
      [...activeStaff].sort((a, b) =>
        staffSortKey(a).localeCompare(staffSortKey(b)),
      ),
    [activeStaff],
  );

  const options = useMemo(
    () => [
      { value: "", label: "Unassigned" },
      ...sortedStaff.map((member) => ({
        value: member.id,
        label: formatStaffMemberName(member),
      })),
    ],
    [sortedStaff],
  );

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
      <SchoolAdminSelect
        value={assignedTeacherId ?? ""}
        onChange={(value) => {
          void onAssign(studentId, value === "" ? null : value);
        }}
        options={options}
        placeholder="Assign teacher…"
        disabled={disabled}
        ariaLabel="Assign teacher"
        C={C}
        triggerClassName="min-w-[9rem] max-w-[14rem] text-sm"
      />
    </div>
  );
}
