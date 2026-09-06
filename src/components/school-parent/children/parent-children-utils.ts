import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import {
  childHealthDeepLinkHref,
  parentChildrenPagePath,
  schoolProgramParentPath,
} from "@/lib/organization-settings/parent-routes";

export type ParentChildRecordSection = "application" | "checklist" | "teachers" | "health";

export function isParentChildRecordSection(value: string | null): value is ParentChildRecordSection {
  return (
    value === "application" ||
    value === "checklist" ||
    value === "teachers" ||
    value === "health"
  );
}

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

export function formatChildProgramLine(child: FamilyChildOverview): string | null {
  if (child.enrolledPrograms.length === 0) return null;
  return child.enrolledPrograms
    .map((program) => program.portalLabel || program.programName)
    .join(" · ");
}

export function childLearnerSubtitleLine(child: FamilyChildOverview): string {
  const parts = [childGradeLine(child)];
  const programs = formatChildProgramLine(child);
  if (programs) parts.push(programs);
  if (child.isEnrolled) {
    parts.push("Enrolled");
  } else {
    parts.push(child.statusLabel);
  }
  return parts.join(" · ");
}

export function childIsolatedPortalHref(
  schoolSlug: string,
  child: FamilyChildOverview,
  previewParentBasePath?: string,
): string | null {
  const isolatedProgram = child.enrolledPrograms.find(
    (program) => program.isIsolatedPortal && program.portalSlug,
  );
  if (!isolatedProgram?.portalSlug) return null;

  if (previewParentBasePath) {
    return `${previewParentBasePath}/p/${isolatedProgram.portalSlug}/portal`;
  }

  return schoolProgramParentPath(schoolSlug, isolatedProgram.portalSlug, "portal");
}

export function childIsolatedPortalLabel(child: FamilyChildOverview): string | null {
  const isolatedProgram = child.enrolledPrograms.find(
    (program) => program.isIsolatedPortal,
  );
  if (!isolatedProgram) return null;
  return isolatedProgram.portalLabel || isolatedProgram.programName;
}

export function filterFamilyChildrenForProgramPortal(
  children: FamilyChildOverview[],
  programId: string,
): FamilyChildOverview[] {
  const normalizedProgramId = programId.trim();
  if (!normalizedProgramId) return children;

  return children.filter((child) =>
    child.enrolledPrograms.some((program) => program.programId === normalizedProgramId),
  );
}

export function programPortalChildrenEmptyMessage(portalLabel: string): string {
  const label = portalLabel.trim() || "this program";
  return `No learners enrolled in ${label} yet.`;
}

export function childStatusChipTone(child: FamilyChildOverview): "success" | "info" | "warning" {
  if (child.isEnrolled) return "success";
  if (child.status === "enrolling") return "warning";
  return "info";
}

export function childrenPagePath(schoolSlug: string, previewBasePath?: string): string {
  return parentChildrenPagePath(schoolSlug, previewBasePath);
}

export { childHealthDeepLinkHref };
