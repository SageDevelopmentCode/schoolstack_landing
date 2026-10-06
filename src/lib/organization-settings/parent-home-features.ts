import type { OrganizationFeatures } from "./types";
import {
  isFridayBranchParentPortalPaused,
  type OrganizationFridayBranchSettings,
} from "@/lib/school-admin/friday-branch/friday-branch-org-settings";
import { isParentFeatureEnabled } from "./parent-routes";

export function isParentHomeFridayBranchEnabled(
  features: OrganizationFeatures,
  fridayBranchSettings?: OrganizationFridayBranchSettings | null,
): boolean {
  if (isFridayBranchParentPortalPaused(fridayBranchSettings)) {
    return false;
  }
  return (
    Boolean(features.parent_home?.friday_branch) &&
    Boolean(features.parent?.friday_branch)
  );
}

export function isParentNavFridayBranchEnabled(
  features: OrganizationFeatures,
  fridayBranchSettings?: OrganizationFridayBranchSettings | null,
): boolean {
  return (
    isParentFeatureEnabled(features, "friday_branch") &&
    !isFridayBranchParentPortalPaused(fridayBranchSettings)
  );
}
