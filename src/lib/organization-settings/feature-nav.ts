import { FEATURE_CATALOG } from "./catalog";
import { DEFAULT_FEATURE_ICON_SLUG } from "./icon-registry";
import type {
  FeatureNavChildConfig,
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
  { key: "my_school", label: "My School", group: "Main", icon: "school" },
  { key: "committees", label: "Committees", group: "Main", icon: "heart" },
  { key: "finances", label: "Finances", group: "Tools", icon: "dollar-sign" },
  { key: "marketing", label: "Marketing", group: "Tools", icon: "megaphone" },
];

const DEFAULT_FEATURE_CHILDREN: Record<string, FeatureNavChildConfig[]> = {
  my_school: [
    { key: "students", label: "My Students", icon: "users" },
    { key: "programs", label: "Programs", icon: "book-open" },
    { key: "staff", label: "Staff", icon: "user-check" },
    { key: "classrooms", label: "Classrooms", icon: "home" },
    { key: "tuition", label: "Tuition", icon: "dollar-sign" },
  ],
  admissions: [
    { key: "programs", label: "Programs", icon: "book-open" },
    { key: "flows", label: "Enrollment Flows", icon: "git-branch" },
    { key: "submissions", label: "Submissions", icon: "clipboard-list" },
  ],
  finances: [
    { key: "overview", label: "Overview", icon: "layout-dashboard" },
    { key: "expenses", label: "Expenses", icon: "credit-card" },
    { key: "revenue", label: "Revenue", icon: "trending-up" },
    { key: "insights", label: "Insights", icon: "lightbulb" },
    { key: "transactions", label: "Transactions", icon: "list-filter" },
    { key: "payroll", label: "Payroll", icon: "wallet" },
  ],
};

const DEFAULT_CHILD_LABELS: Record<string, Record<string, string>> = {
  my_school: Object.fromEntries(
    DEFAULT_FEATURE_CHILDREN.my_school.map((child) => [child.key, child.label!]),
  ),
  admissions: Object.fromEntries(
    DEFAULT_FEATURE_CHILDREN.admissions.map((child) => [child.key, child.label!]),
  ),
  finances: Object.fromEntries(
    DEFAULT_FEATURE_CHILDREN.finances.map((child) => [child.key, child.label!]),
  ),
};

/** Stale catalog defaults to replace when still present in saved feature_nav. */
const LEGACY_NAV_ITEM_DEFAULTS: Record<
  string,
  { label?: string; icon?: string }
> = {
  my_school: { label: "Teacher View", icon: "eye" },
};

function applyLegacyNavItemOverrides(
  key: string,
  storedItem: FeatureNavItemConfig | undefined,
  defaultItem: FeatureNavItemConfig | undefined,
  merged: FeatureNavItemConfig,
): FeatureNavItemConfig {
  const legacy = LEGACY_NAV_ITEM_DEFAULTS[key];
  if (!legacy || !storedItem) {
    return merged;
  }

  const hadLegacyLabel =
    legacy.label !== undefined && storedItem.label === legacy.label;
  let label = merged.label;
  let icon = merged.icon;

  if (hadLegacyLabel) {
    label = defaultItem?.label ?? label;
    if (legacy.icon !== undefined && storedItem.icon === legacy.icon) {
      icon = defaultItem?.icon ?? icon;
    }
  }

  return { ...merged, label, icon };
}

export function getDefaultFeatureChildren(parentKey: string): FeatureNavChildConfig[] {
  const defaults = DEFAULT_FEATURE_CHILDREN[parentKey];
  if (!defaults) return [];
  return defaults.map((child) => ({ ...child }));
}

export function hasDefaultFeatureChildren(parentKey: string): boolean {
  return Boolean(DEFAULT_FEATURE_CHILDREN[parentKey]?.length);
}

function mergeFeatureNavChildren(
  parentKey: string,
  stored?: FeatureNavChildConfig[],
): FeatureNavChildConfig[] | undefined {
  const defaults = getDefaultFeatureChildren(parentKey);
  if (defaults.length === 0) {
    return stored?.length ? stored.map((child) => ({ ...child })) : undefined;
  }

  if (!stored?.length) {
    return defaults;
  }

  const defaultByKey = new Map(defaults.map((child) => [child.key, child]));
  const result: FeatureNavChildConfig[] = [];

  for (const child of stored) {
    const fallback = defaultByKey.get(child.key);
    result.push({
      key: child.key,
      label: child.label ?? fallback?.label,
      icon: child.icon ?? fallback?.icon ?? DEFAULT_FEATURE_ICON_SLUG,
    });
    defaultByKey.delete(child.key);
  }

  for (const child of defaultByKey.values()) {
    result.push({ ...child });
  }

  return result;
}

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
    const children = mergeFeatureNavChildren(entry.key);
    items[entry.key] = {
      group: entry.group,
      label: entry.label,
      icon: entry.icon,
      ...(children ? { children } : {}),
    };
  }

  return {
    groups,
    items,
    order: entries.map((entry) => entry.key),
  };
}

export function getDefaultPortalFeatureOrder(
  portal: Portal,
  keys: string[],
): string[] {
  const catalogOrder = getCatalogEntriesForPortal(portal).map(
    (entry) => entry.key,
  );
  const catalogKeys = new Set(catalogOrder);
  const catalogInKeys = catalogOrder.filter((key) => keys.includes(key));
  const custom = keys
    .filter((key) => !catalogKeys.has(key))
    .sort((a, b) => a.localeCompare(b));
  return [...catalogInKeys, ...custom];
}

export function resolvePortalFeatureOrder(
  portal: Portal,
  keys: string[],
  nav: PortalFeatureNav,
): string[] {
  const keySet = new Set(keys);
  const defaultOrder = getDefaultPortalFeatureOrder(portal, keys);

  if (!nav.order?.length) {
    return defaultOrder;
  }

  const result: string[] = [];
  for (const key of nav.order) {
    if (keySet.has(key) && !result.includes(key)) {
      result.push(key);
    }
  }
  for (const key of defaultOrder) {
    if (!result.includes(key)) {
      result.push(key);
    }
  }
  return result;
}

export function setPortalFeatureOrder(
  nav: PortalFeatureNav,
  order: string[],
): PortalFeatureNav {
  return { ...nav, order: [...order] };
}

export function appendFeatureToOrder(
  nav: PortalFeatureNav,
  key: string,
): PortalFeatureNav {
  const order = nav.order ?? [];
  if (order.includes(key)) {
    return nav;
  }
  return { ...nav, order: [...order, key] };
}

export function removeFeatureFromOrder(
  nav: PortalFeatureNav,
  key: string,
): PortalFeatureNav {
  if (!nav.order?.length) {
    return nav;
  }
  return { ...nav, order: nav.order.filter((item) => item !== key) };
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
    const children = mergeFeatureNavChildren(key, storedItem?.children ?? defaultItem?.children);
    items[key] = applyLegacyNavItemOverrides(key, storedItem, defaultItem, {
      group: storedItem?.group ?? defaultItem?.group ?? groups[0] ?? "Main",
      label: storedItem?.label ?? defaultItem?.label,
      icon: storedItem?.icon ?? defaultItem?.icon ?? DEFAULT_FEATURE_ICON_SLUG,
      ...(children ? { children } : {}),
    });
  }

  return {
    groups,
    items,
    ...(stored.order?.length ? { order: [...stored.order] } : {}),
  };
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
    ...(patch.children !== undefined
      ? { children: patch.children.map((child) => ({ ...child })) }
      : existing.children
        ? { children: existing.children.map((child) => ({ ...child })) }
        : {}),
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
  return removeFeatureFromOrder({ ...nav, items }, key);
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

  const children = mergeFeatureNavChildren(
    key,
    stored?.children ?? defaults.items[key]?.children,
  );

  return applyLegacyNavItemOverrides(
    key,
    stored,
    defaults.items[key],
    {
      group: stored?.group ?? catalogEntry?.group ?? defaults.groups[0] ?? "Main",
      label: stored?.label ?? catalogEntry?.label,
      icon:
        stored?.icon ??
        catalogEntry?.icon ??
        defaults.items[key]?.icon ??
        DEFAULT_FEATURE_ICON_SLUG,
      ...(children ? { children } : {}),
    },
  );
}

export function resolveFeatureNavChildren(
  portal: Portal,
  parentKey: string,
  portalNav: PortalFeatureNav | undefined,
): FeatureNavChildConfig[] {
  const item = resolveFeatureNavItem(portal, parentKey, portalNav);
  return item.children ?? [];
}

export function getFeatureNavChildLabel(
  parentKey: string,
  childKey: string,
  child?: FeatureNavChildConfig,
): string {
  if (child?.label) return child.label;
  return DEFAULT_CHILD_LABELS[parentKey]?.[childKey] ?? childKey
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function setFeatureNavChildren(
  nav: PortalFeatureNav,
  parentKey: string,
  children: FeatureNavChildConfig[],
): PortalFeatureNav {
  const existing = nav.items[parentKey] ?? {
    group: nav.groups[0] ?? "Main",
    icon: DEFAULT_FEATURE_ICON_SLUG,
  };

  return setFeatureNavItem(nav, parentKey, {
    ...existing,
    children: children.map((child) => ({ ...child })),
  });
}

export { ADMIN_NAV_CATALOG_ENTRIES, DEFAULT_FEATURE_CHILDREN };
