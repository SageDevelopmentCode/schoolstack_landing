import type { LucideIcon } from "lucide-react";
import { getFeatureIcon } from "./icon-registry";
import {
  ADMIN_NAV_CATALOG_ENTRIES,
  getEnabledFeatureNavChildren,
  getFeatureNavChildLabel,
  isAdminFeatureHiddenFromRootNav,
  mergePortalFeatureNav,
  resolveFeatureNavChildren,
  resolveFeatureNavItem,
  resolvePortalFeatureOrder,
} from "./feature-nav";
import { humanizeFeatureKey } from "./features";
import type { AdminNavPath } from "./admin-routes";
import { resolveAdminNavChildHref } from "./admin-routes";
import type { AdminFeatures, FeatureNavChildConfig, PortalFeatureNav } from "./types";

export type AdminNavPage = keyof AdminFeatures | string;

export type AdminNavChildItem = {
  key: string;
  name: string;
  icon: LucideIcon;
  routeFeature?: string;
  routeSubtab?: string;
  children?: AdminNavChildItem[];
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

function mapAdminNavChild(
  parentKey: string,
  child: FeatureNavChildConfig,
  adminFeatureRecord: Record<string, boolean>,
): AdminNavChildItem | null {
  if (child.enabled === false) return null;

  if (child.children?.length) {
    const nestedChildren = child.children
      .map((nested) => mapAdminNavChild(parentKey, nested, adminFeatureRecord))
      .filter((item): item is AdminNavChildItem => Boolean(item));
    if (nestedChildren.length === 0) return null;
    return {
      key: child.key,
      name: getFeatureNavChildLabel(parentKey, child.key, child),
      icon: getFeatureIcon(child.icon),
      children: nestedChildren,
    };
  }

  const routeFeature = child.routeFeature;
  if (routeFeature && !adminFeatureRecord[routeFeature]) {
    return null;
  }

  return {
    key: child.key,
    name: getFeatureNavChildLabel(parentKey, child.key, child),
    icon: getFeatureIcon(child.icon),
    ...(routeFeature
      ? {
          routeFeature,
          ...(child.routeSubtab ? { routeSubtab: child.routeSubtab } : {}),
        }
      : {}),
  };
}

function buildAdminNavChildren(
  parentKey: string,
  portalNav: PortalFeatureNav,
  adminFeatureRecord: Record<string, boolean>,
): AdminNavChildItem[] {
  const children = getEnabledFeatureNavChildren("admin", parentKey, portalNav);
  return children
    .map((child) => mapAdminNavChild(parentKey, child, adminFeatureRecord))
    .filter((item): item is AdminNavChildItem => Boolean(item));
}

export function adminNavItemMatchesPath(
  slug: string,
  pathname: string,
  item: AdminNavItem,
): boolean {
  const prefix = `/school/${slug}/admin/${item.key}`;
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    return true;
  }

  const visit = (parentFeature: string, children: AdminNavChildItem[]): boolean => {
    for (const child of children) {
      if (child.children?.length) {
        if (visit(parentFeature, child.children)) return true;
        continue;
      }
      const href = resolveAdminNavChildHref(slug, parentFeature, child);
      if (pathname === href || pathname.startsWith(`${href}/`)) {
        return true;
      }
    }
    return false;
  };

  if (item.children?.length) {
    return visit(item.key, item.children);
  }

  return false;
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

function getFirstAdminNavPathForItem(item: AdminNavItem): AdminNavPath {
  if (!item.children?.length) {
    return { feature: item.key };
  }

  const visit = (
    parentFeature: string,
    children: AdminNavChildItem[],
  ): AdminNavPath | null => {
    for (const child of children) {
      if (child.children?.length) {
        const nested = visit(parentFeature, child.children);
        if (nested) return nested;
        continue;
      }
      if (child.routeFeature) {
        return { feature: child.routeFeature };
      }
      return { feature: parentFeature, subtab: child.key };
    }
    return null;
  };

  const nested = visit(item.key, item.children);
  if (nested) return nested;
  return { feature: item.key, subtab: item.children[0].key };
}

export function getFirstAdminNavPath(
  adminFeatures: AdminFeatures,
  portalNav?: PortalFeatureNav,
): AdminNavPath | null {
  const groups = buildAdminNavGroups(adminFeatures, portalNav);
  for (const group of groups) {
    if (group.items.length > 0) {
      return getFirstAdminNavPathForItem(group.items[0]);
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
    if (isAdminFeatureHiddenFromRootNav("admin", key, mergedNav)) {
      continue;
    }
    const resolved = resolveFeatureNavItem("admin", key, mergedNav);
    const group = resolved.group || mergedNav.groups[0] || "Main";
    const navChildren = buildAdminNavChildren(key, mergedNav, record);
    const items = buckets.get(group) ?? [];
    items.push({
      key,
      name: resolved.label ?? getAdminPageLabel(key, mergedNav),
      icon: getFeatureIcon(resolved.icon),
      ...(navChildren.length > 0 ? { children: navChildren } : {}),
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
