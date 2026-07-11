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

export function parseSchoolParentPath(pathname: string): ParentNavPath | null {
  const match = pathname.match(/\/school\/[^/]+\/parent\/([^/]+)(?:\/([^/]+))?$/);
  if (!match) return null;
  return {
    feature: match[1],
    subtab: match[2],
  };
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
