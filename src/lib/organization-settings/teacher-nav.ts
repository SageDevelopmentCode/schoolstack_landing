import type { LucideIcon } from "lucide-react";
import { FEATURE_CATALOG } from "./catalog";
import { getFeatureIcon } from "./icon-registry";
import {
  mergePortalFeatureNav,
  resolveFeatureNavItem,
  resolvePortalFeatureOrder,
} from "./feature-nav";
import { humanizeFeatureKey } from "./features";
import type { TeacherNavPath } from "./teacher-routes";
import { schoolTeacherPath } from "./teacher-routes";
import type { PortalFeatureNav, TeacherFeatures } from "./types";

export type TeacherNavItem = {
  key: string;
  name: string;
  icon: LucideIcon;
  href: string;
};

const CATALOG_PAGE_LABELS = Object.fromEntries(
  FEATURE_CATALOG.filter((entry) => entry.portal === "teacher").map((entry) => [
    entry.key,
    entry.label,
  ]),
) as Record<string, string>;

const PRIMARY_NAV_COUNT = 6;

function toTeacherFeatureRecord(
  teacherFeatures: TeacherFeatures,
): Record<string, boolean> {
  return teacherFeatures as unknown as Record<string, boolean>;
}

export function getTeacherPageLabel(
  key: string,
  portalNav?: PortalFeatureNav,
): string {
  const label = portalNav?.items[key]?.label ?? CATALOG_PAGE_LABELS[key];
  if (label) return label;
  return humanizeFeatureKey(key);
}

export function buildTeacherNavItems(
  slug: string,
  teacherFeatures: TeacherFeatures,
  portalNav?: PortalFeatureNav,
  teacherBasePath?: string,
): TeacherNavItem[] {
  const record = toTeacherFeatureRecord(teacherFeatures);
  const mergedNav = mergePortalFeatureNav("teacher", portalNav);
  const allKeys = Object.keys(record);
  const orderedKeys = resolvePortalFeatureOrder("teacher", allKeys, mergedNav);
  const items: TeacherNavItem[] = [];

  for (const key of orderedKeys) {
    if (!record[key]) continue;
    const resolved = resolveFeatureNavItem("teacher", key, mergedNav);
    items.push({
      key,
      name: resolved.label ?? getTeacherPageLabel(key, mergedNav),
      icon: getFeatureIcon(resolved.icon),
      href: teacherBasePath
        ? `${teacherBasePath}/${key}`
        : schoolTeacherPath(slug, key),
    });
  }

  return items;
}

export function splitTeacherNavForHeader(items: TeacherNavItem[]): {
  primary: TeacherNavItem[];
  more: TeacherNavItem[];
} {
  if (items.length <= PRIMARY_NAV_COUNT) {
    return { primary: items, more: [] };
  }

  return {
    primary: items.slice(0, PRIMARY_NAV_COUNT),
    more: items.slice(PRIMARY_NAV_COUNT),
  };
}

export function getTeacherPortalHomeHref(
  slug: string,
  teacherFeatures: TeacherFeatures,
  portalNav?: PortalFeatureNav,
  teacherBasePath?: string,
): string | null {
  const items = buildTeacherNavItems(
    slug,
    teacherFeatures,
    portalNav,
    teacherBasePath,
  );
  return items[0]?.href ?? null;
}

export function getFirstTeacherNavPath(
  slug: string,
  teacherFeatures: TeacherFeatures,
  portalNav?: PortalFeatureNav,
): TeacherNavPath | null {
  const items = buildTeacherNavItems(slug, teacherFeatures, portalNav);
  if (items.length === 0) return null;
  return { feature: items[0].key };
}

export function isTeacherNavItemActive(
  pathname: string,
  item: TeacherNavItem,
): boolean {
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
