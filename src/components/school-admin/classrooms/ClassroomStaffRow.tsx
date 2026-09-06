"use client";

import { Check, Loader2, Trash2 } from "lucide-react";
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

type ClassroomStaffRowProps = {
  member?: StaffMemberRecord;
  name?: string;
  photoUrl?: string | null;
  roleTitle?: string | null;
  role?: ClassroomStaffRole;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  onRemove?: () => void;
  removing?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
};

export default function ClassroomStaffRow({
  member,
  name,
  photoUrl,
  roleTitle,
  role,
  theme,
  C,
  onRemove,
  removing = false,
  selectable = false,
  selected = false,
  onSelect,
  disabled = false,
}: ClassroomStaffRowProps) {
  const displayName = name ?? (member ? staffDisplayName(member) : "Staff member");
  const resolvedPhotoUrl = photoUrl ?? member?.profilePhotoUrl ?? null;
  const resolvedRoleTitle = roleTitle ?? member?.roleTitle ?? null;
  const subtitle = [resolvedRoleTitle, role ? ROLE_LABELS[role] : null]
    .filter(Boolean)
    .join(" · ");

  const content = (
    <>
      <StudentPhoto
        name={displayName}
        photoUrl={resolvedPhotoUrl}
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
      {selectable && selected ? (
        <Check className="h-4 w-4 shrink-0" style={{ color: C.accent }} aria-hidden="true" />
      ) : null}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className="rounded-md p-1.5 disabled:opacity-60"
          style={{ color: C.error }}
          aria-label={`Remove ${displayName}`}
        >
          {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      ) : null}
    </>
  );

  if (selectable) {
    return (
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className="flex w-full items-center gap-2.5 rounded-[11px] border px-3 py-2.5 text-left transition-colors disabled:opacity-60"
        style={{
          borderColor: selected ? "#CCE0CF" : "#DCE4DC",
          backgroundColor: selected ? "#EDF5EE" : theme.white,
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className="flex items-center gap-2.5 rounded-[11px] border px-3 py-2.5"
      style={{ borderColor: "#DCE4DC", backgroundColor: theme.white }}
    >
      {content}
    </div>
  );
}
