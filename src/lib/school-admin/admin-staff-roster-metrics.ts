import { summarizeStaffPortalLoginStatus } from "@/lib/staff/staff-portal-login-status";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { staffDisplayName } from "@/lib/staff/staff-display";

export type StaffRosterFilter = "all" | "teachers" | "portal_active" | "review";

export type StaffRosterMetrics = {
  totalCount: number;
  activeCount: number;
  portalSignedInCount: number;
  withLearnersCount: number;
  needsReviewCount: number;
  teacherCount: number;
  portalActiveCount: number;
};

export function staffProfileNeedsReview(
  member: Pick<StaffMemberRecord, "email" | "roleTitle">,
): boolean {
  return !member.email?.trim() || !member.roleTitle?.trim();
}

export function deriveStaffRosterMetrics(
  members: StaffMemberRecord[],
): StaffRosterMetrics {
  const loginSummary = summarizeStaffPortalLoginStatus(members);

  let activeCount = 0;
  let withLearnersCount = 0;
  let needsReviewCount = 0;
  let teacherCount = 0;
  let portalActiveCount = 0;

  for (const member of members) {
    if (member.employmentStatus === "active") {
      activeCount += 1;
    }
    if (member.portalRole === "teacher") {
      teacherCount += 1;
    }
    if (member.hasEverSignedIn) {
      portalActiveCount += 1;
    }
    if ((member.assignedStudentCount ?? 0) > 0) {
      withLearnersCount += 1;
    }
    if (staffProfileNeedsReview(member)) {
      needsReviewCount += 1;
    }
  }

  return {
    totalCount: members.length,
    activeCount,
    portalSignedInCount: loginSummary.signedIn,
    withLearnersCount,
    needsReviewCount,
    teacherCount,
    portalActiveCount,
  };
}

export function filterStaffByRosterFilter(
  members: StaffMemberRecord[],
  filter: StaffRosterFilter,
): StaffMemberRecord[] {
  if (filter === "all") return members;
  if (filter === "teachers") {
    return members.filter((member) => member.portalRole === "teacher");
  }
  if (filter === "portal_active") {
    return members.filter((member) => member.hasEverSignedIn);
  }
  return members.filter(staffProfileNeedsReview);
}

export function matchesStaffSearch(member: StaffMemberRecord, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    staffDisplayName(member),
    member.firstName,
    member.lastName,
    member.email ?? "",
    member.roleTitle ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

export function firstStaffNeedingReview(
  members: StaffMemberRecord[],
): StaffMemberRecord | null {
  return members.find(staffProfileNeedsReview) ?? null;
}
