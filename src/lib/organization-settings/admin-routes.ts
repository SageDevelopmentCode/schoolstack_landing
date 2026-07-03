import type { OrganizationFeatures } from "./types";

export function schoolAdminPath(slug: string, featureKey: string): string {
  return `/school/${slug}/admin/${featureKey}`;
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
