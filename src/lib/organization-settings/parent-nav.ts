import type { LucideIcon } from "lucide-react";
import { FEATURE_CATALOG } from "./catalog";
import { getFeatureIcon } from "./icon-registry";
import {
  getEnabledFeatureNavChildren,
  getFeatureNavChildLabel,
  mergePortalFeatureNav,
  resolveFeatureNavChildren,
  resolveFeatureNavItem,
  resolvePortalFeatureOrder,
} from "./feature-nav";
import { humanizeFeatureKey } from "./features";
import type { ParentNavPath } from "./parent-routes";
import type { ParentFeatures, PortalFeatureNav } from "./types";

export type ParentNavChildItem = {
  key: string;
  name: string;
  icon: LucideIcon;
  href: string;
};

export type ParentNavItem = {
  key: string;
  name: string;
  icon: LucideIcon;
  href: string;
  children?: ParentNavChildItem[];
};

const CATALOG_PAGE_LABELS = Object.fromEntries(
  FEATURE_CATALOG.filter((entry) => entry.portal === "parent").map((entry) => [
    entry.key,
    entry.label,
  ]),
) as Record<string, string>;

const PRIMARY_NAV_COUNT = 7;

function toParentFeatureRecord(
  parentFeatures: ParentFeatures,
): Record<string, boolean> {
  return parentFeatures as unknown as Record<string, boolean>;
}

export function getParentPageLabel(
  key: string,
  portalNav?: PortalFeatureNav,
): string {
  const label = portalNav?.items[key]?.label ?? CATALOG_PAGE_LABELS[key];
  if (label) return label;
  return humanizeFeatureKey(key);
}

export function getParentSubtabLabel(
  parentKey: string,
  childKey: string,
  portalNav?: PortalFeatureNav,
): string {
  const mergedNav = mergePortalFeatureNav("parent", portalNav);
  const children = resolveFeatureNavChildren("parent", parentKey, mergedNav);
  const child = children.find((item) => item.key === childKey);
  return getFeatureNavChildLabel(parentKey, childKey, child);
}

function resolveParentNavHref(
  slug: string,
  key: string,
  children: ParentNavChildItem[] | undefined,
): string {
  if (children?.length) {
    return children[0].href;
  }
  return `/school/${slug}/parent/${key}`;
}

export function buildParentNavItems(
  slug: string,
  parentFeatures: ParentFeatures,
  portalNav?: PortalFeatureNav,
): ParentNavItem[] {
  const record = toParentFeatureRecord(parentFeatures);
  const mergedNav = mergePortalFeatureNav("parent", portalNav);
  const allKeys = Object.keys(record);
  const orderedKeys = resolvePortalFeatureOrder("parent", allKeys, mergedNav);
  const items: ParentNavItem[] = [];

  for (const key of orderedKeys) {
    if (!record[key]) continue;
    const resolved = resolveFeatureNavItem("parent", key, mergedNav);
    const children = getEnabledFeatureNavChildren("parent", key, mergedNav);
    const childItems =
      children.length > 0
        ? children.map((child) => ({
            key: child.key,
            name: getFeatureNavChildLabel(key, child.key, child),
            icon: getFeatureIcon(child.icon),
            href: `/school/${slug}/parent/${key}/${child.key}`,
          }))
        : undefined;

    items.push({
      key,
      name: resolved.label ?? getParentPageLabel(key, mergedNav),
      icon: getFeatureIcon(resolved.icon),
      href: resolveParentNavHref(slug, key, childItems),
      ...(childItems ? { children: childItems } : {}),
    });
  }

  return items;
}

export function splitParentNavForHeader(items: ParentNavItem[]): {
  primary: ParentNavItem[];
  more: ParentNavItem[];
} {
  if (items.length <= PRIMARY_NAV_COUNT) {
    return { primary: items, more: [] };
  }

  return {
    primary: items.slice(0, PRIMARY_NAV_COUNT),
    more: items.slice(PRIMARY_NAV_COUNT),
  };
}

export function getFirstParentNavPath(
  slug: string,
  parentFeatures: ParentFeatures,
  portalNav?: PortalFeatureNav,
): ParentNavPath | null {
  const items = buildParentNavItems(slug, parentFeatures, portalNav);
  if (items.length === 0) return null;

  const item = items[0];
  if (item.children?.length) {
    return { feature: item.key, subtab: item.children[0].key };
  }
  return { feature: item.key };
}

export function isParentNavItemActive(
  pathname: string,
  item: ParentNavItem,
): boolean {
  if (item.children?.length) {
    return item.children.some((child) => pathname === child.href);
  }
  return pathname === item.href;
}
