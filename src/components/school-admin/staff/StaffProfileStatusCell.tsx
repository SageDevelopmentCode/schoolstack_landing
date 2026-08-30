import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { staffProfileNeedsReview } from "@/lib/school-admin/admin-staff-roster-metrics";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";

type StaffProfileStatusCellProps = {
  member: StaffMemberRecord;
  theme: ParentThemeTokens;
};

export default function StaffProfileStatusCell({
  member,
  theme,
}: StaffProfileStatusCellProps) {
  const needsReview = staffProfileNeedsReview(member);

  return (
    <AdminChip theme={theme} tone={needsReview ? "warning" : "success"}>
      {needsReview ? "Needs review" : "Complete"}
    </AdminChip>
  );
}
