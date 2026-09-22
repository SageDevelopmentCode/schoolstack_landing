import type { OrganizationFeatures } from "./types";

export function isParentHomeFridayBranchEnabled(
  features: OrganizationFeatures,
): boolean {
  return (
    Boolean(features.parent_home?.friday_branch) &&
    Boolean(features.parent?.friday_branch)
  );
}
