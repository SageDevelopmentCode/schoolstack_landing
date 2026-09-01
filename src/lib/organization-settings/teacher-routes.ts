import type { OrganizationFeatures } from "./types";

export type TeacherNavPath = {
  feature: string;
  subtab?: string;
};

export function schoolTeacherPath(
  slug: string,
  featureKey: string,
  subtab?: string,
): string {
  const base = `/school/${slug}/teacher/${featureKey}`;
  return subtab ? `${base}/${subtab}` : base;
}

export function teacherClassroomSignupPath(
  slug: string,
  signupId: string,
  teacherBasePath?: string,
): string {
  const base = teacherBasePath ?? schoolTeacherPath(slug, "classroom_signups");
  return `${base}/${signupId}`;
}

export function schoolTeacherLoginPath(slug: string): string {
  return `/school/${slug}/teacher/login`;
}

export function parseSchoolTeacherPath(pathname: string): TeacherNavPath | null {
  const match = pathname.match(/\/school\/[^/]+\/teacher\/([^/]+)(?:\/([^/]+))?$/);
  if (!match) return null;
  return {
    feature: match[1],
    subtab: match[2],
  };
}

export function isTeacherMessagesPath(pathname: string): boolean {
  if (parseSchoolTeacherPath(pathname)?.feature === "messages") return true;
  return /\/teacher\/messages(?:\/|$)/.test(pathname);
}

export function isTeacherFeatureEnabled(
  features: OrganizationFeatures,
  featureKey: string,
): boolean {
  const teacherFeatures = features.teacher;
  if (
    !teacherFeatures ||
    typeof teacherFeatures !== "object" ||
    Array.isArray(teacherFeatures)
  ) {
    return false;
  }

  return Boolean(
    (teacherFeatures as Record<string, boolean>)[featureKey],
  );
}

export function isTeacherPortalEnabled(features: OrganizationFeatures): boolean {
  const teacherFeatures = features.teacher;
  if (
    !teacherFeatures ||
    typeof teacherFeatures !== "object" ||
    Array.isArray(teacherFeatures)
  ) {
    return false;
  }

  return Object.values(teacherFeatures as Record<string, boolean>).some(Boolean);
}

export function isTeacherNavPathEnabled(
  features: OrganizationFeatures,
  featureKey: string,
): boolean {
  return isTeacherFeatureEnabled(features, featureKey);
}
