import type { LucideIcon } from "lucide-react";
import { getFeatureIcon } from "./icon-registry";
import {
  ADMIN_NAV_CATALOG_ENTRIES,
  getEnabledFeatureNavChildren,
  getFeatureNavChildLabel,
  mergePortalFeatureNav,
  resolveFeatureNavChildren,
  resolveFeatureNavItem,
  resolvePortalFeatureOrder,
} from "./feature-nav";
import { humanizeFeatureKey } from "./features";
import type { AdminNavPath } from "./admin-routes";
import type { AdminFeatures, PortalFeatureNav } from "./types";

export type AdminNavPage = keyof AdminFeatures | string;

export type AdminNavChildItem = {
  key: string;
  name: string;
  icon: LucideIcon;
};

export type AdminNavItem = {
  key: string;
  name: string;
  icon: LucideIcon;
  children?: AdminNavChildItem[];
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

export function getAdminSubtabLabel(
  parentKey: string,
  childKey: string,
  portalNav?: PortalFeatureNav,
): string {
  const mergedNav = mergePortalFeatureNav("admin", portalNav);
  const children = resolveFeatureNavChildren("admin", parentKey, mergedNav);
  const child = children.find((item) => item.key === childKey);
  return getFeatureNavChildLabel(parentKey, childKey, child);
}

export function getFirstAdminNavPath(
  adminFeatures: AdminFeatures,
  portalNav?: PortalFeatureNav,
): AdminNavPath | null {
  const groups = buildAdminNavGroups(adminFeatures, portalNav);
  for (const group of groups) {
    if (group.items.length > 0) {
      const item = group.items[0];
      if (item.children?.length) {
        return { feature: item.key, subtab: item.children[0].key };
      }
      return { feature: item.key };
    }
  }
  return null;
}

/** @deprecated Use getFirstAdminNavPath */
export function getFirstAdminNavPage(
  adminFeatures: AdminFeatures,
  portalNav?: PortalFeatureNav,
): string | null {
  const path = getFirstAdminNavPath(adminFeatures, portalNav);
  return path?.feature ?? null;
}

export function buildAdminNavGroups(
  adminFeatures: AdminFeatures,
  portalNav?: PortalFeatureNav,
): { label: string; items: AdminNavItem[] }[] {
  const record = toAdminFeatureRecord(adminFeatures);
  const mergedNav = mergePortalFeatureNav("admin", portalNav);
  const allKeys = Object.keys(record);
  const orderedKeys = resolvePortalFeatureOrder("admin", allKeys, mergedNav);

  const buckets = new Map<string, AdminNavItem[]>();

  for (const key of orderedKeys) {
    if (!record[key]) continue;
    const resolved = resolveFeatureNavItem("admin", key, mergedNav);
    const group = resolved.group || mergedNav.groups[0] || "Main";
    const children = getEnabledFeatureNavChildren("admin", key, mergedNav);
    const items = buckets.get(group) ?? [];
    items.push({
      key,
      name: resolved.label ?? getAdminPageLabel(key, mergedNav),
      icon: getFeatureIcon(resolved.icon),
      ...(children.length > 0
        ? {
            children: children.map((child) => ({
              key: child.key,
              name: getFeatureNavChildLabel(key, child.key, child),
              icon: getFeatureIcon(child.icon),
            })),
          }
        : {}),
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
