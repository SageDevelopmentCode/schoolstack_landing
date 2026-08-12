import type { EnrollmentBillingStatus, FamilyEnrollmentSummary } from "./types";

export type FamilyEnrollmentBadgeKind = "enrolling" | "enrolled";

export function formatEnrollmentStatusLabel(status: EnrollmentBillingStatus): string {
  switch (status) {
    case "pending":
      return "Enrolling";
    case "enrolled":
      return "Enrolled";
    case "waitlisted":
      return "Waitlisted";
    case "withdrawn":
      return "Withdrawn";
    default:
      return "Enrolled";
  }
}

export function familyEnrollmentStatusBadges(
  enrollments: Array<Pick<FamilyEnrollmentSummary, "status">>,
): FamilyEnrollmentBadgeKind[] {
  const badges: FamilyEnrollmentBadgeKind[] = [];
  if (enrollments.some((enrollment) => enrollment.status === "pending")) {
    badges.push("enrolling");
  }
  if (enrollments.some((enrollment) => enrollment.status === "enrolled")) {
    badges.push("enrolled");
  }
  return badges;
}

export function familyEnrollmentBadgeLabel(kind: FamilyEnrollmentBadgeKind): string {
  return kind === "enrolling" ? "Enrolling" : "Enrolled";
}
