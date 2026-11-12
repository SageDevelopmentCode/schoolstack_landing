import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  getAdminPageLabel,
  getAdminSubtabLabel,
} from "@/lib/organization-settings/admin-nav";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import type { OrganizationPlan } from "@/lib/organization-settings/plans";

export const FREE_PLAN_UPGRADE_QUERY = "upgrade";

const FREE_ADMISSIONS_SUBTABS = new Set(["programs", "flows", "submissions"]);

/** Paths a free school can open. Every other default admin path stays locked. */
export function isFreePlanAdminPathOpen(
  feature: string,
  subtab?: string,
): boolean {
  if (feature === "schedule" && !subtab) return true;
  if (
    feature === "admissions" &&
    (!subtab || FREE_ADMISSIONS_SUBTABS.has(subtab))
  ) {
    return true;
  }
  return feature === "my_school" && subtab === "newsletters";
}

export function isFreePlanNavChildOpen(
  parentFeature: string,
  child: {
    key: string;
    routeFeature?: string;
    routeSubtab?: string;
    children?: readonly {
      key: string;
      routeFeature?: string;
      routeSubtab?: string;
    }[];
  },
): boolean {
  if (child.children?.length) {
    return child.children.some((nested) =>
      isFreePlanNavChildOpen(parentFeature, nested),
    );
  }
  if (child.routeFeature) {
    return isFreePlanAdminPathOpen(child.routeFeature, child.routeSubtab);
  }
  return isFreePlanAdminPathOpen(parentFeature, child.key);
}

function isDefaultPaidAdminFeature(feature: string): boolean {
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
  if (isFreePlanAdminPathOpen(feature, subtab)) return null;
  if (subtab) return getAdminSubtabLabel(feature, subtab);
  return getAdminPageLabel(feature);
}

/** Home URL that opens the upgrade popup for a locked default feature. */
export function freePlanUpgradePath(
  slug: string,
  plan: OrganizationPlan,
  feature: string,
  subtab?: string,
): string | null {
  const label = freePlanLockedUpgradeLabel(plan, feature, subtab);
  if (!label) return null;
  const params = new URLSearchParams({ [FREE_PLAN_UPGRADE_QUERY]: label });
  return `${schoolAdminPath(slug, "home")}?${params.toString()}`;
}
