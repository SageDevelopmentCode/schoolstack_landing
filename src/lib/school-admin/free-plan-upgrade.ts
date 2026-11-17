import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  getAdminPageLabel,
  getAdminSubtabLabel,
  type AdminNavChildItem,
  type AdminNavItem,
} from "@/lib/organization-settings/admin-nav";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import type { OrganizationPlan } from "@/lib/organization-settings/plans";

export const FREE_PLAN_UPGRADE_QUERY = "upgrade";

/** Popup label for the locked MudKitchen Account button and its pitch key. */
export const MUDKITCHEN_ACCOUNT_LABEL = "MudKitchen Account";
export const MUDKITCHEN_ACCOUNT_PITCH_KEY = "mudkitchen_account";
/** Popup labels for the Schedule tabs locked on Free, and their pitch keys. */
export const FREE_PLAN_SCHEDULE_UPGRADE_LABELS: Partial<Record<string, string>> = {
  overview: "Schedule overview",
  events: "School events",
  permissions: "Event permissions",
  shadow: "Shadow days",
};
const IN_PAGE_UPGRADE_PITCH_KEYS: Record<string, string> = {
  "Schedule overview": "schedule:overview",
  "School events": "schedule:events",
  "Event permissions": "schedule:permissions",
  "Shadow days": "schedule:shadow",
};
/** Popup label for the sidebar's Free plan chip (generic pitch). */
export const FREE_PLAN_FULL_PLAN_LABEL = "Full plan";

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

function childPitchKey(parentFeature: string, child: AdminNavChildItem): string {
  if (child.routeFeature) {
    return child.routeSubtab
      ? `${child.routeFeature}:${child.routeSubtab}`
      : child.routeFeature;
  }
  return `${parentFeature}:${child.key}`;
}

function findChildPitchKey(
  parentFeature: string,
  navChildren: readonly AdminNavChildItem[],
  label: string,
): string | null {
  for (const child of navChildren) {
    if (child.name === label) return childPitchKey(parentFeature, child);
    if (child.children?.length) {
      const nested = findChildPitchKey(parentFeature, child.children, label);
      if (nested) return nested;
    }
  }
  return null;
}

/**
 * Pitch key (`feature` or `feature:child`) for the label a locked sidebar row,
 * search result or `?upgrade=` URL opened the popup with. Null = generic pitch.
 */
export function resolveFreePlanUpgradeTarget(
  navGroups: readonly { items: readonly AdminNavItem[] }[],
  label: string,
): string | null {
  if (label === MUDKITCHEN_ACCOUNT_LABEL) return MUDKITCHEN_ACCOUNT_PITCH_KEY;
  if (IN_PAGE_UPGRADE_PITCH_KEYS[label]) return IN_PAGE_UPGRADE_PITCH_KEYS[label];
  const items = navGroups.flatMap((group) => group.items);
  for (const item of items) {
    if (item.name === label) return item.key;
  }
  for (const item of items) {
    if (!item.children?.length) continue;
    const key = findChildPitchKey(item.key, item.children, label);
    if (key) return key;
  }
  return null;
}
