import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";

export function filterPhotoPermissionChildren(
  children: FamilyChildOverview[],
): FamilyChildOverview[] {
  return children.filter((child) => Boolean(child.studentId) && child.isEnrolled);
}
