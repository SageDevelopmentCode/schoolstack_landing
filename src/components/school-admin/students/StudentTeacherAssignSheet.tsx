"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Search } from "lucide-react";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import {
  formatStaffMemberName,
  type AssignedTeacher,
} from "@/lib/school-admin/enrolled-students";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";

type StudentTeacherAssignSheetProps = {
  open: boolean;
  onClose: () => void;
  studentName: string;
  assignedTeachers: AssignedTeacher[];
  activeStaff: StaffMemberRecord[];
  saving?: boolean;
  C: AdminThemeTokens;
  onSave: (staffMemberIds: string[]) => Promise<void>;
};

function staffSortKey(member: StaffMemberRecord): string {
  return formatStaffMemberName(member).toLowerCase();
}

export default function StudentTeacherAssignSheet({
  open,
  onClose,
  studentName,
  assignedTeachers,
  activeStaff,
  saving = false,
  C,
  onSave,
}: StudentTeacherAssignSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setSelectedIds(assignedTeachers.map((teacher) => teacher.id));
    setSearchQuery("");
  }, [open, assignedTeachers]);

  const sortedStaff = useMemo(
    () =>
      [...activeStaff].sort((a, b) =>
        staffSortKey(a).localeCompare(staffSortKey(b)),
      ),
    [activeStaff],
  );

  const filteredStaff = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return sortedStaff;
    return sortedStaff.filter((member) =>
      formatStaffMemberName(member).toLowerCase().includes(normalized),
    );
  }, [searchQuery, sortedStaff]);

  const toggleStaff = (staffMemberId: string) => {
    setSelectedIds((current) =>
      current.includes(staffMemberId)
        ? current.filter((id) => id !== staffMemberId)
        : [...current, staffMemberId],
    );
  };

  const handleSave = async () => {
    await onSave(selectedIds);
    onClose();
  };

  return (
    <SchoolAdminSlideOverShell
      open={open}
      onClose={onClose}
      title="Assign teachers"
      subtitle={studentName}
      C={C}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60"
            style={{ color: C.textSecondary }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60"
            style={{ backgroundColor: C.accent, color: "#fff" }}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Save
          </button>
        </>
      }
    >
      {activeStaff.length === 0 ? (
        <p className="text-sm" style={{ color: C.textTertiary }}>
          No staff yet. Add staff members before assigning teachers.
        </p>
      ) : (
        <>
          <div className="relative mb-3">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: C.textTertiary }}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search staff…"
              className="w-full rounded-md border py-2 pl-8 pr-3 text-sm outline-none"
              style={{
                borderColor: C.inputBorder,
                backgroundColor: C.input,
                color: C.textPrimary,
              }}
            />
          </div>

          <ul className="space-y-1">
            {filteredStaff.map((member) => {
              const selected = selectedIds.includes(member.id);
              const label = formatStaffMemberName(member);

              return (
                <li key={member.id}>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => toggleStaff(member.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm disabled:opacity-60"
                    style={{
                      backgroundColor: selected ? C.accentLight : "transparent",
                      color: selected ? C.accent : C.textPrimary,
                    }}
                  >
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                      style={{
                        borderColor: selected ? C.accent : C.border,
                        backgroundColor: selected ? C.accent : C.surface,
                      }}
                    >
                      {selected ? (
                        <Check className="h-3 w-3" style={{ color: "#fff" }} />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    {member.roleTitle ? (
                      <span
                        className="shrink-0 text-xs"
                        style={{ color: C.textTertiary }}
                      >
                        {member.roleTitle}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          {filteredStaff.length === 0 ? (
            <p className="mt-3 text-sm" style={{ color: C.textTertiary }}>
              No staff match your search.
            </p>
          ) : null}
        </>
      )}
    </SchoolAdminSlideOverShell>
  );
}
