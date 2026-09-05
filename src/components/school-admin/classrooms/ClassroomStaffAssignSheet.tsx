"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import ClassroomStaffPickerRow from "@/components/school-admin/classrooms/ClassroomStaffPickerRow";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { staffDisplayName } from "@/lib/staff/staff-display";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import type { ClassroomStaffRole } from "@/lib/school-admin/classrooms";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ClassroomStaffAssignSheetProps = {
  open: boolean;
  onClose: () => void;
  classroomName: string;
  staffMembers: StaffMemberRecord[];
  assignedStaffRoles: Map<string, ClassroomStaffRole>;
  staffPath: string;
  saving?: boolean;
  C: AdminThemeTokens;
  onSave: (staffMemberId: string, role: ClassroomStaffRole) => Promise<void>;
};

export default function ClassroomStaffAssignSheet({
  open,
  onClose,
  classroomName,
  staffMembers,
  assignedStaffRoles,
  staffPath,
  saving = false,
  C,
  onSave,
}: ClassroomStaffAssignSheetProps) {
  const router = useRouter();
  const { theme } = useSchoolAdminStoryTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [role, setRole] = useState<ClassroomStaffRole>("lead");
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelectedId(null);
      setSearchQuery("");
      setRole("lead");
    }
  }

  const sortedStaff = useMemo(
    () =>
      [...staffMembers].sort((a, b) =>
        staffDisplayName(a).toLowerCase().localeCompare(staffDisplayName(b).toLowerCase()),
      ),
    [staffMembers],
  );

  const filteredStaff = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return sortedStaff;
    return sortedStaff.filter((member) => {
      const haystack = [staffDisplayName(member), member.roleTitle ?? "", member.email ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [searchQuery, sortedStaff]);

  const selectedIsAssignable =
    selectedId != null && !assignedStaffRoles.has(selectedId);

  const handleAddStaff = () => {
    onClose();
    router.push(staffPath);
  };

  const handleSelectStaff = (staffMemberId: string) => {
    setSelectedId(staffMemberId);
    setRole("lead");
  };

  const handleSave = async () => {
    if (!selectedId || !selectedIsAssignable) return;
    await onSave(selectedId, role);
    onClose();
  };

  return (
    <SchoolAdminSlideOverShell
      open={open}
      onClose={onClose}
      title="Assign staff"
      subtitle={classroomName}
      C={C}
      footer={
        <>
          <AdminButton theme={theme} variant="soft" onClick={onClose} disabled={saving}>
            Cancel
          </AdminButton>
          <AdminButton
            theme={theme}
            variant="primary"
            onClick={() => void handleSave()}
            disabled={saving || !selectedIsAssignable}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Assign staff
          </AdminButton>
        </>
      }
    >
      <div className="space-y-4">
        {staffMembers.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: C.textTertiary }}>
              No staff yet. Add staff members before assigning them to this classroom.
            </p>
            <AdminTextLink theme={theme} onClick={handleAddStaff}>
              Add staff →
            </AdminTextLink>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                style={{ color: C.textTertiary }}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search staff…"
                className="w-full rounded-[9px] border py-2 pl-8 pr-3 text-sm outline-none"
                style={{
                  borderColor: C.inputBorder,
                  backgroundColor: C.input,
                  color: C.textPrimary,
                }}
              />
            </div>

            {filteredStaff.length === 0 ? (
              <p className="text-sm" style={{ color: C.textTertiary }}>
                No staff match your search.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {filteredStaff.map((member) => {
                  const alreadyAssigned = assignedStaffRoles.has(member.id);
                  const isSelected = selectedId === member.id;

                  return (
                    <li key={member.id}>
                      <ClassroomStaffPickerRow
                        member={member}
                        theme={theme}
                        C={C}
                        selected={isSelected}
                        disabled={saving}
                        alreadyAssigned={alreadyAssigned}
                        assignedRole={assignedStaffRoles.get(member.id)}
                        showRolePicker={isSelected && !alreadyAssigned}
                        role={role}
                        onSelect={() => handleSelectStaff(member.id)}
                        onRoleChange={setRole}
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            <AdminTextLink theme={theme} onClick={handleAddStaff}>
              Add staff →
            </AdminTextLink>
          </>
        )}
      </div>
    </SchoolAdminSlideOverShell>
  );
}
