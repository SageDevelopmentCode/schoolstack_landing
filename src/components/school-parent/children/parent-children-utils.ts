import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";

export type ParentChildRecordSection = "application" | "checklist" | "teachers";

export function childFirstName(fullName: string): string {
  const part = fullName.trim().split(/\s+/).filter(Boolean)[0];
  return part ?? fullName;
}

export function formatChildrenPageDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function familyChildrenSubtitle(children: FamilyChildOverview[]): string {
  if (children.length === 0) return "";
  const enrolledCount = children.filter((c) => c.isEnrolled).length;
  const learnerLabel = children.length === 1 ? "learner" : "learners";
  if (enrolledCount === children.length) {
    return `${children.length} ${learnerLabel} · All enrolled`;
  }
  if (enrolledCount > 0) {
    return `${children.length} ${learnerLabel} · ${enrolledCount} enrolled`;
  }
  return `${children.length} ${learnerLabel} on file`;
}

export function childApplicationHref(
  schoolSlug: string,
  child: FamilyChildOverview,
  previewBasePath?: string,
): string {
  if (previewBasePath) {
    if (child.isEnrolled || child.status === "enrolling") {
      return `${previewBasePath}/apply/${child.applicationId}/enrollment`;
    }
    return `${previewBasePath}/apply/${child.applicationId}`;
  }
  if (child.isEnrolled || child.status === "enrolling") {
    return `/school/${schoolSlug}/apply/${child.applicationId}/enrollment`;
  }
  return `/school/${schoolSlug}/apply/${child.applicationId}`;
}

export function childGradeLine(child: FamilyChildOverview): string {
  return child.grade ? `Grade ${child.grade}` : "Grade not listed";
}

export function childStatusChipTone(child: FamilyChildOverview): "success" | "info" | "warning" {
  if (child.isEnrolled) return "success";
  if (child.status === "enrolling") return "warning";
  return "info";
}

export function childrenPagePath(schoolSlug: string, previewBasePath?: string): string {
  return previewBasePath
    ? `${previewBasePath}/parent/children`
    : schoolParentPath(schoolSlug, "children");
}
