import {
  getEnabledFeatureNavChildren,
  mergePortalFeatureNav,
} from "./feature-nav";
import type { OrganizationFeatures } from "./types";

export type ParentNavPath = {
  feature: string;
  subtab?: string;
};

export function schoolParentPath(
  slug: string,
  featureKey: string,
  subtab?: string,
): string {
  const base = `/school/${slug}/parent/${featureKey}`;
  return subtab ? `${base}/${subtab}` : base;
}

export function schoolProgramParentPath(
  slug: string,
  programSlug: string,
  featureKey: string,
  subtab?: string,
): string {
  const base = `/school/${slug}/parent/p/${programSlug}/${featureKey}`;
  return subtab ? `${base}/${subtab}` : base;
}

export function schoolParentRootPath(slug: string): string {
  return `/school/${slug}/parent`;
}

export function parentDocumentationPath(
  slug: string,
  options?: {
    programSlug?: string;
    previewBasePath?: string;
    parentNavBasePath?: string;
  },
): string {
  if (options?.previewBasePath) {
    if (options.programSlug) {
      return `${options.previewBasePath}/parent/p/${options.programSlug}/documentation`;
    }
    return `${options.previewBasePath}/parent/documentation`;
  }

  if (options?.parentNavBasePath) {
    return `${options.parentNavBasePath}/documentation`;
  }

  if (options?.programSlug) {
    return schoolProgramParentPath(slug, options.programSlug, "documentation");
  }

  return `${schoolParentRootPath(slug)}/documentation`;
}

export function parseProgramParentPath(pathname: string): {
  programSlug: string;
  feature: string;
  subtab?: string;
} | null {
  const match = pathname.match(
    /\/school\/[^/]+\/parent\/p\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/,
  );
  if (!match) return null;
  return {
    programSlug: match[1],
    feature: match[2],
    subtab: match[3],
  };
}

export function parentClassroomSignupsListPath(
  slug: string,
  previewBasePath?: string,
): string {
  if (previewBasePath) {
    return `${previewBasePath}/parent/classroom_signups`;
  }
  return schoolParentPath(slug, "classroom_signups");
}

export function parentClassroomSignupPath(
  slug: string,
  signupId: string,
  previewBasePath?: string,
): string {
  const base = parentClassroomSignupsListPath(slug, previewBasePath);
  return `${base}?signup=${signupId}`;
}

export function parentChildrenPagePath(
  slug: string,
  previewBasePath?: string,
): string {
  return previewBasePath
    ? `${previewBasePath}/parent/children`
    : schoolParentPath(slug, "children");
}

export function childHealthDeepLinkHref(
  slug: string,
  applicationId: string,
  previewBasePath?: string,
): string {
  const base = parentChildrenPagePath(slug, previewBasePath);
  const params = new URLSearchParams({
    applicationId,
    section: "health",
  });
  return `${base}?${params.toString()}`;
}

export function childPickupDeepLinkHref(
  slug: string,
  applicationId: string,
  previewBasePath?: string,
): string {
  const base = parentChildrenPagePath(slug, previewBasePath);
  const params = new URLSearchParams({
    applicationId,
    section: "pickup",
  });
  return `${base}?${params.toString()}`;
}

export function parseSchoolParentPath(pathname: string): ParentNavPath | null {
  const match = pathname.match(/\/school\/[^/]+\/parent\/([^/]+)(?:\/([^/]+))?$/);
  if (!match) return null;
  return {
    feature: match[1],
    subtab: match[2],
  };
}

export function isParentHomePath(pathname: string): boolean {
  if (parseProgramParentPath(pathname)?.feature === "portal") return true;
  if (parseSchoolParentPath(pathname)?.feature === "portal") return true;
  return /\/parent\/(?:p\/[^/]+\/)?portal(?:\/|$)/.test(pathname);
}

export function isParentMessagesPath(pathname: string): boolean {
  if (parseProgramParentPath(pathname)?.feature === "messages") return true;
  if (parseSchoolParentPath(pathname)?.feature === "messages") return true;
  return /\/parent\/(?:p\/[^/]+\/)?messages(?:\/|$)/.test(pathname);
}

export function isParentBillingPath(pathname: string): boolean {
  if (parseProgramParentPath(pathname)?.feature === "billing") return true;
  if (parseSchoolParentPath(pathname)?.feature === "billing") return true;
  return /\/parent\/(?:p\/[^/]+\/)?billing(?:\/|$)/.test(pathname);
}

export function isParentCurriculumPath(pathname: string): boolean {
  if (parseProgramParentPath(pathname)?.feature === "curriculum") return true;
  if (parseSchoolParentPath(pathname)?.feature === "curriculum") return true;
  return /\/parent\/(?:p\/[^/]+\/)?curriculum(?:\/|$)/.test(pathname);
}

export function isParentCommitteesPath(pathname: string): boolean {
  if (parseProgramParentPath(pathname)?.feature === "committees") return true;
  if (parseSchoolParentPath(pathname)?.feature === "committees") return true;
  return /\/parent\/(?:p\/[^/]+\/)?committees(?:\/|$)/.test(pathname);
}

export function isParentCommitteeWorkspaceOpen(
  pathname: string,
  searchParams: Pick<URLSearchParams, "get"> | null,
): boolean {
  if (!searchParams?.get("committee")) return false;
  if (isParentCommitteesPath(pathname)) return true;
  return /\/admin\/preview\/[^/]+\/family\/[^/]+\/parent\/committees(?:\/|$)/.test(pathname);
}

export function isParentSupplyListPath(pathname: string): boolean {
  if (parseProgramParentPath(pathname)?.feature === "supply_list") return true;
  if (parseSchoolParentPath(pathname)?.feature === "supply_list") return true;
  return /\/parent\/(?:p\/[^/]+\/)?supply_list(?:\/|$)/.test(pathname);
}

export function isParentTeachingSchedulePath(pathname: string): boolean {
  if (parseProgramParentPath(pathname)?.feature === "teaching_schedule") return true;
  if (parseSchoolParentPath(pathname)?.feature === "teaching_schedule") return true;
  return /\/parent\/(?:p\/[^/]+\/)?teaching_schedule(?:\/|$)/.test(pathname);
}

export function isParentFeatureEnabled(
  features: OrganizationFeatures,
  featureKey: string,
): boolean {
  const parentFeatures = features.parent;
  if (
    !parentFeatures ||
    typeof parentFeatures !== "object" ||
    Array.isArray(parentFeatures)
  ) {
    return false;
  }

  return Boolean(
    (parentFeatures as Record<string, boolean>)[featureKey],
  );
}

export function isParentPortalEnabled(features: OrganizationFeatures): boolean {
  return isParentFeatureEnabled(features, "portal");
}

export function isParentNavPathEnabled(
  features: OrganizationFeatures,
  featureKey: string,
  subtab?: string,
): boolean {
  if (!isParentFeatureEnabled(features, featureKey)) {
    return false;
  }

  if (!subtab) {
    return true;
  }

  const portalNav = mergePortalFeatureNav("parent", features.feature_nav?.parent);
  const children = getEnabledFeatureNavChildren("parent", featureKey, portalNav);
  return children.some((child) => child.key === subtab);
}
