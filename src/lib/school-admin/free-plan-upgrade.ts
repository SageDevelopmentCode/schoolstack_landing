import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  getAdminPageLabel,
  getAdminSubtabLabel,
} from "@/lib/organization-settings/admin-nav";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import type { OrganizationPlan } from "@/lib/organization-settings/plans";

export const FREE_PLAN_UPGRADE_QUERY = "upgrade";

function isDefaultPaidAdminFeature(feature: string): boolean {
  if (feature === "dashboard") return false;
  const admin = DEFAULT_FEATURES.admin;
  if (!(feature in admin)) return false;
  return admin[feature as keyof typeof admin] === true;
}

/** Label for the upgrade popup, or null when this URL should stay a normal page or a 404. */
export function freePlanLockedUpgradeLabel(
  plan: OrganizationPlan,
  feature: string,
  subtab?: string,
): string | null {
  if (plan !== "free" || !isDefaultPaidAdminFeature(feature)) return null;
  if (subtab) return getAdminSubtabLabel(feature, subtab);
  return getAdminPageLabel(feature);
}

/** Dashboard URL that opens the upgrade popup for a locked default feature. */
export function freePlanUpgradePath(
  slug: string,
  plan: OrganizationPlan,
  feature: string,
  subtab?: string,
): string | null {
  const label = freePlanLockedUpgradeLabel(plan, feature, subtab);
  if (!label) return null;
  const params = new URLSearchParams({ [FREE_PLAN_UPGRADE_QUERY]: label });
  return `${schoolAdminPath(slug, "dashboard")}?${params.toString()}`;
}
