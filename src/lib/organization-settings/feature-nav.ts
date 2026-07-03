import { FEATURE_CATALOG } from "./catalog";
import { DEFAULT_FEATURE_ICON_SLUG } from "./icon-registry";
import type {
  FeatureNavConfig,
  FeatureNavItemConfig,
  OrganizationFeatures,
  Portal,
  PortalFeatureNav,
} from "./types";

export type PortalNavCatalogEntry = {
  key: string;
  label: string;
  group: string;
  icon: string;
};

const ADMIN_NAV_CATALOG_ENTRIES: PortalNavCatalogEntry[] = [
  { key: "dashboard", label: "Dashboard", group: "Main", icon: "layout-dashboard" },
  { key: "admissions", label: "Admissions", group: "Main", icon: "graduation-cap" },
  { key: "my_school", label: "Teacher View", group: "Main", icon: "eye" },
  { key: "committees", label: "Committees", group: "Main", icon: "heart" },
  { key: "finances", label: "Finances", group: "Tools", icon: "dollar-sign" },
  { key: "marketing", label: "Marketing", group: "Tools", icon: "megaphone" },
];

const TEACHER_ICON_DEFAULTS: Record<string, string> = {
  dashboard: "layout-dashboard",
  my_students: "users",
  my_hours: "clock",
  messages: "message-square",
  calendar: "calendar-days",
  attendance: "clipboard-list",
  feed: "megaphone",
  payroll: "wallet",
  forms_documents: "file-text",
};

const PARENT_ICON_DEFAULTS: Record<string, string> = {
  portal: "home",
  enrollment_checklist: "clipboard-list",
  billing: "dollar-sign",
  messages: "message-square",
  calendar: "calendar-days",
  attendance: "clipboard-list",
  feed: "megaphone",
  children: "users",
  committees: "heart",
};

function getCatalogEntriesForPortal(portal: Portal): PortalNavCatalogEntry[] {
  if (portal === "admin") {
    return ADMIN_NAV_CATALOG_ENTRIES;
  }

  return FEATURE_CATALOG.filter((def) => def.portal === portal).map((def) => ({
    key: def.key,
    label: def.label,
    group: "Main",
    icon:
      portal === "teacher"
        ? (TEACHER_ICON_DEFAULTS[def.key] ?? DEFAULT_FEATURE_ICON_SLUG)
        : (PARENT_ICON_DEFAULTS[def.key] ?? DEFAULT_FEATURE_ICON_SLUG),
  }));
}

export function getDefaultPortalNav(portal: Portal): PortalFeatureNav {
  const entries = getCatalogEntriesForPortal(portal);
  const groups: string[] = [];

  for (const entry of entries) {
    if (!groups.includes(entry.group)) {
      groups.push(entry.group);
    }
  }

  const items: Record<string, FeatureNavItemConfig> = {};
  for (const entry of entries) {
    items[entry.key] = {
      group: entry.group,
      label: entry.label,
      icon: entry.icon,
    };
  }

  return { groups, items };
}

export function getPortalNavCatalog(portal: Portal): PortalNavCatalogEntry[] {
  return getCatalogEntriesForPortal(portal);
}

export function mergePortalFeatureNav(
  portal: Portal,
  stored: PortalFeatureNav | undefined,
): PortalFeatureNav {
  const defaults = getDefaultPortalNav(portal);
  if (!stored) return defaults;

  const groups = stored.groups.length > 0 ? [...stored.groups] : [...defaults.groups];
  for (const group of defaults.groups) {
    if (!groups.includes(group)) {
      groups.push(group);
    }
  }

  const items: Record<string, FeatureNavItemConfig> = {
    ...defaults.items,
    ...stored.items,
  };

  for (const key of Object.keys(items)) {
    const storedItem = stored.items[key];
    const defaultItem = defaults.items[key];
    items[key] = {
      group: storedItem?.group ?? defaultItem?.group ?? groups[0] ?? "Main",
      label: storedItem?.label ?? defaultItem?.label,
      icon: storedItem?.icon ?? defaultItem?.icon ?? DEFAULT_FEATURE_ICON_SLUG,
    };
  }

  return { groups, items };
}

export function ensurePortalNav(
  features: OrganizationFeatures,
  portal: Portal,
): PortalFeatureNav {
  const stored = features.feature_nav?.[portal];
  return mergePortalFeatureNav(portal, stored);
}

export function getFeatureNavConfig(
  features: OrganizationFeatures,
): FeatureNavConfig {
  return features.feature_nav ?? {};
}

export function setFeatureNavConfig(
  features: OrganizationFeatures,
  config: FeatureNavConfig,
): OrganizationFeatures {
  return { ...features, feature_nav: config };
}

export function updatePortalNav(
  features: OrganizationFeatures,
  portal: Portal,
  nav: PortalFeatureNav,
): OrganizationFeatures {
  return {
    ...features,
    feature_nav: {
      ...getFeatureNavConfig(features),
      [portal]: nav,
    },
  };
}

export function addPortalGroup(
  nav: PortalFeatureNav,
  groupName: string,
): PortalFeatureNav {
  const trimmed = groupName.trim();
  if (!trimmed || nav.groups.includes(trimmed)) {
    return nav;
  }
  return { ...nav, groups: [...nav.groups, trimmed] };
}

export function removePortalGroup(
  nav: PortalFeatureNav,
  groupName: string,
): PortalFeatureNav {
  const fallbackGroup = nav.groups.find((group) => group !== groupName) ?? "Main";
  const items = { ...nav.items };

  for (const [key, item] of Object.entries(items)) {
    if (item.group === groupName) {
      items[key] = { ...item, group: fallbackGroup };
    }
  }

  return {
    groups: nav.groups.filter((group) => group !== groupName),
    items,
  };
}

export function setFeatureNavItem(
  nav: PortalFeatureNav,
  key: string,
  patch: Partial<FeatureNavItemConfig>,
): PortalFeatureNav {
  const existing = nav.items[key] ?? {
    group: nav.groups[0] ?? "Main",
    icon: DEFAULT_FEATURE_ICON_SLUG,
  };

  const nextItem: FeatureNavItemConfig = {
    ...existing,
    ...patch,
    group: patch.group ?? existing.group,
  };

  const groups = nav.groups.includes(nextItem.group)
    ? nav.groups
    : [...nav.groups, nextItem.group];

  return {
    groups,
    items: { ...nav.items, [key]: nextItem },
  };
}

export function removeFeatureNavItem(
  nav: PortalFeatureNav,
  key: string,
): PortalFeatureNav {
  const items = { ...nav.items };
  delete items[key];
  return { ...nav, items };
}

export function countFeaturesInGroup(
  nav: PortalFeatureNav,
  groupName: string,
): number {
  return Object.values(nav.items).filter((item) => item.group === groupName)
    .length;
}

export function resolveFeatureNavItem(
  portal: Portal,
  key: string,
  portalNav: PortalFeatureNav | undefined,
): FeatureNavItemConfig {
  const defaults = getDefaultPortalNav(portal);
  const catalogEntry = getCatalogEntriesForPortal(portal).find(
    (entry) => entry.key === key,
  );
  const stored = portalNav?.items[key];

  return {
    group: stored?.group ?? catalogEntry?.group ?? defaults.groups[0] ?? "Main",
    label: stored?.label ?? catalogEntry?.label,
    icon:
      stored?.icon ??
      catalogEntry?.icon ??
      defaults.items[key]?.icon ??
      DEFAULT_FEATURE_ICON_SLUG,
  };
}

export { ADMIN_NAV_CATALOG_ENTRIES };
