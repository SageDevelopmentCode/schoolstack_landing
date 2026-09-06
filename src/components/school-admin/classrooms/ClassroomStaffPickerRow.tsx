"use client";

import StudentPhoto from "@/components/students/StudentPhoto";
import { staffDisplayName } from "@/lib/staff/staff-display";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import type { ClassroomStaffRole } from "@/lib/school-admin/classrooms";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

const ROLE_LABELS: Record<ClassroomStaffRole, string> = {
  lead: "Lead teacher",
  assistant: "Assistant",
};

type ClassroomStaffPickerRowProps = {
  member: StaffMemberRecord;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  selected?: boolean;
  disabled?: boolean;
  alreadyAssigned?: boolean;
  assignedRole?: ClassroomStaffRole;
  showRolePicker?: boolean;
  role?: ClassroomStaffRole;
  onSelect?: () => void;
  onRoleChange?: (role: ClassroomStaffRole) => void;
};

export default function ClassroomStaffPickerRow({
  member,
  theme,
  C,
  selected = false,
  disabled = false,
  alreadyAssigned = false,
  assignedRole,
  showRolePicker = false,
  role = "lead",
  onSelect,
  onRoleChange,
}: ClassroomStaffPickerRowProps) {
  const displayName = staffDisplayName(member);
  const subtitleParts = [member.roleTitle ?? null];

  if (alreadyAssigned && assignedRole) {
    subtitleParts.push(ROLE_LABELS[assignedRole], "Selected");
  }

  const subtitle = subtitleParts.filter(Boolean).join(" · ");

  return (
    <div>
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled || alreadyAssigned}
        className="flex w-full items-center gap-2.5 rounded-[11px] border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          borderColor: selected ? "#CCE0CF" : "#DCE4DC",
          backgroundColor: selected ? "#EDF5EE" : theme.white,
        }}
      >
        <StudentPhoto
          name={displayName}
          photoUrl={member.profilePhotoUrl}
          size="md"
          shape="circle"
          accentColor={C.accent}
          accentGlowColor={C.accentLight}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold" style={{ color: theme.ink }}>
            {displayName}
          </div>
          {subtitle ? (
            <div className="mt-0.5 truncate text-[11px]" style={{ color: theme.muted }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        {alreadyAssigned ? (
          <span
            className="shrink-0 text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: C.textTertiary }}
          >
            Selected
          </span>
        ) : null}
      </button>

      {showRolePicker ? (
        <label className="ml-1 mt-1.5 block space-y-1 pl-3">
          <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
            Role
          </span>
          <select
            value={role}
            onChange={(event) => onRoleChange?.(event.target.value as ClassroomStaffRole)}
            className="w-full rounded-[9px] border px-3 py-2 text-sm"
            style={{
              borderColor: C.inputBorder,
              backgroundColor: C.input,
              color: C.textPrimary,
            }}
          >
            <option value="lead">Lead teacher</option>
            <option value="assistant">Assistant</option>
          </select>
        </label>
      ) : null}
    </div>
  );
}
