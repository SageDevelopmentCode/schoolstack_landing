import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import type { AdminChipTone } from "@/components/school-admin/ui/story/AdminChip";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { staffPortalLoginBadgeStatus } from "@/lib/staff/staff-display";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";

type StaffPortalCellProps = {
  member: StaffMemberRecord;
  theme: ParentThemeTokens;
};

function portalChipTone(member: StaffMemberRecord): AdminChipTone {
  const status = staffPortalLoginBadgeStatus(member);
  if (!status.accountLinked) return "warning";
  if (!status.hasEverSignedIn) return "info";
  return "success";
}

function portalChipLabel(member: StaffMemberRecord): string {
  const status = staffPortalLoginBadgeStatus(member);
  if (!status.accountLinked) return "No account";
  if (!status.hasEverSignedIn) return "Never signed in";
  return "Signed in";
}

export default function StaffPortalCell({ member, theme }: StaffPortalCellProps) {
  return (
    <AdminChip theme={theme} tone={portalChipTone(member)}>
      {portalChipLabel(member)}
    </AdminChip>
  );
}
