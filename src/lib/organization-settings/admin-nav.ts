import type { LucideIcon } from "lucide-react";
import { getFeatureIcon } from "./icon-registry";
import {
  ADMIN_NAV_CATALOG_ENTRIES,
  mergePortalFeatureNav,
  resolveFeatureNavItem,
} from "./feature-nav";
import { humanizeFeatureKey, getEnabledFeatureKeys } from "./features";
import type { AdminFeatures, PortalFeatureNav } from "./types";

export type AdminNavPage = keyof AdminFeatures | string;

export type AdminNavItem = {
  key: string;
  name: string;
  icon: LucideIcon;
};

const CATALOG_PAGE_LABELS = Object.fromEntries(
  ADMIN_NAV_CATALOG_ENTRIES.map((entry) => [entry.key, entry.label]),
) as Record<string, string>;

const CATALOG_KEYS = new Set<string>(
  ADMIN_NAV_CATALOG_ENTRIES.map((entry) => entry.key),
);

function toAdminFeatureRecord(adminFeatures: AdminFeatures): Record<string, boolean> {
  return adminFeatures as unknown as Record<string, boolean>;
}

export function getAdminPageLabel(
  key: string,
  portalNav?: PortalFeatureNav,
): string {
  const label = portalNav?.items[key]?.label ?? CATALOG_PAGE_LABELS[key];
  if (label) return label;
  return humanizeFeatureKey(key);
}

export function getFirstAdminNavPage(
  adminFeatures: AdminFeatures,
  portalNav?: PortalFeatureNav,
): string | null {
  const groups = buildAdminNavGroups(adminFeatures, portalNav);
  for (const group of groups) {
    if (group.items.length > 0) {
      return group.items[0].key;
    }
  }
  return null;
}

export function buildAdminNavGroups(
  adminFeatures: AdminFeatures,
  portalNav?: PortalFeatureNav,
): { label: string; items: AdminNavItem[] }[] {
  const record = toAdminFeatureRecord(adminFeatures);
  const mergedNav = mergePortalFeatureNav("admin", portalNav);
  const enabledKeys = getEnabledFeatureKeys(record, CATALOG_KEYS);

  const buckets = new Map<string, AdminNavItem[]>();

  for (const key of enabledKeys) {
    const resolved = resolveFeatureNavItem("admin", key, mergedNav);
    const group = resolved.group || mergedNav.groups[0] || "Main";
    const items = buckets.get(group) ?? [];
    items.push({
      key,
      name: resolved.label ?? getAdminPageLabel(key, mergedNav),
      icon: getFeatureIcon(resolved.icon),
    });
    buckets.set(group, items);
  }

  const orderedGroups: string[] = [];
  for (const group of mergedNav.groups) {
    if (buckets.has(group)) {
      orderedGroups.push(group);
    }
  }
  for (const group of buckets.keys()) {
    if (!orderedGroups.includes(group)) {
      orderedGroups.push(group);
    }
  }

  return orderedGroups.map((label) => ({
    label,
    items: buckets.get(label) ?? [],
  }));
}

export { ADMIN_NAV_CATALOG_ENTRIES, CATALOG_KEYS };
