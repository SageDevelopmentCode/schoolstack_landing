import {
  getEnabledFeatureNavChildren,
  mergePortalFeatureNav,
} from "./feature-nav";
import type { OrganizationFeatures } from "./types";

export type AdminNavPath = {
  feature: string;
  subtab?: string;
};

export function schoolAdminPath(
  slug: string,
  featureKey: string,
  subtab?: string,
): string {
  const base = `/school/${slug}/admin/${featureKey}`;
  return subtab ? `${base}/${subtab}` : base;
}

export function parseSchoolAdminPath(pathname: string): AdminNavPath | null {
  const match = pathname.match(/\/school\/[^/]+\/admin\/([^/]+)(?:\/([^/]+))?$/);
  if (!match) return null;
  return {
    feature: match[1],
    subtab: match[2],
  };
}

export function isAdminFeatureEnabled(
  features: OrganizationFeatures,
  featureKey: string,
): boolean {
  const adminFeatures = features.admin;
  if (
    !adminFeatures ||
    typeof adminFeatures !== "object" ||
    Array.isArray(adminFeatures)
  ) {
    return false;
  }

  return Boolean(
    (adminFeatures as Record<string, boolean>)[featureKey],
  );
}

export function isAdminNavPathEnabled(
  features: OrganizationFeatures,
  featureKey: string,
  subtab?: string,
): boolean {
  if (!isAdminFeatureEnabled(features, featureKey)) {
    return false;
  }

  if (!subtab) {
    return true;
  }

  const portalNav = mergePortalFeatureNav("admin", features.feature_nav?.admin);
  const children = getEnabledFeatureNavChildren("admin", featureKey, portalNav);
  return children.some((child) => child.key === subtab);
}
