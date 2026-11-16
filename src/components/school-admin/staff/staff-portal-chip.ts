import type { GChipTone } from "@/components/school-parent/garden/ui";
import { staffPortalLoginBadgeStatus } from "@/lib/staff/staff-display";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";

/** Portal status chip for a staff member (list rows + detail header). */
export function staffPortalChip(member: StaffMemberRecord): { tone: GChipTone; label: string } {
  if (member.membershipStatus === "disabled") return { tone: "alert", label: "Access off" };
  const status = staffPortalLoginBadgeStatus(member);
  if (!status.accountLinked) return { tone: "warning", label: "No account" };
  if (!status.hasEverSignedIn) return { tone: "info", label: "Never signed in" };
  return { tone: "success", label: "Portal active" };
}
