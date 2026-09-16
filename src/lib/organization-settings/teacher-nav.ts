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
  iconSlug: string;
  href: string;
};

const CATALOG_PAGE_LABELS = Object.fromEntries(
  FEATURE_CATALOG.filter((entry) => entry.portal === "teacher").map((entry) => [
    entry.key,
    entry.label,
  ]),
) as Record<string, string>;

const PRIMARY_NAV_COUNT = 6;
const FORMS_DOCUMENTS_PRIMARY_INDEX = 3;
const MY_HOURS_MORE_INDEX = 6;

export function normalizeTeacherNavOrder(keys: string[]): string[] {
  const without = keys.filter(
    (key) => key !== "forms_documents" && key !== "my_hours",
  );
  const hasForms = keys.includes("forms_documents");
  const hasHours = keys.includes("my_hours");
  const result = [...without];

  if (hasForms) {
    result.splice(Math.min(FORMS_DOCUMENTS_PRIMARY_INDEX, result.length), 0, "forms_documents");
  }
  if (hasHours) {
    result.splice(Math.min(MY_HOURS_MORE_INDEX, result.length), 0, "my_hours");
  }

  return result;
}

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
  const orderedKeys = normalizeTeacherNavOrder(
    resolvePortalFeatureOrder("teacher", allKeys, mergedNav),
  );
  const items: TeacherNavItem[] = [];

  for (const key of orderedKeys) {
    if (!record[key]) continue;
    const resolved = resolveFeatureNavItem("teacher", key, mergedNav);
    const iconSlug = resolved.icon ?? "puzzle";
    items.push({
      key,
      name: resolved.label ?? getTeacherPageLabel(key, mergedNav),
      icon: getFeatureIcon(iconSlug),
      iconSlug,
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
