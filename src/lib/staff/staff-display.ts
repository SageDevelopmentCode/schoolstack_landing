import type { ParentPortalLoginDisplayStatus } from "@/components/admissions/ParentPortalLoginBadge";
import type { StaffMemberRecord, StaffPortalRole } from "@/lib/staff/staff-members";

export function staffDisplayName(member: Pick<StaffMemberRecord, "firstName" | "lastName" | "email">): string {
  return (
    [member.firstName, member.lastName].filter(Boolean).join(" ") ||
    member.email ||
    "Staff member"
  );
}

export function employmentStatusLabel(
  status: StaffMemberRecord["employmentStatus"],
): string {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "on_leave":
      return "On leave";
    default:
      return status;
  }
}

export function portalRoleLabel(role: StaffPortalRole | null): string {
  if (role === "teacher") return "Teacher";
  if (role === "staff") return "Staff";
  return "—";
}

export function staffPortalLoginBadgeStatus(
  member: Pick<
    StaffMemberRecord,
    "isLinked" | "hasEverSignedIn" | "lastSignInAt"
  >,
): ParentPortalLoginDisplayStatus {
  return {
    accountLinked: member.isLinked,
    hasEverSignedIn: member.hasEverSignedIn ?? false,
    lastSignInAt: member.lastSignInAt ?? null,
  };
}
