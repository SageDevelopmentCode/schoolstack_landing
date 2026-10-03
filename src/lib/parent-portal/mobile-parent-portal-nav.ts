import { FEATURE_CATALOG } from "@/lib/organization-settings/catalog";
import {
  mergePortalFeatureNav,
  resolvePortalFeatureOrder,
  resolveFeatureNavItem,
} from "@/lib/organization-settings/feature-nav";
import { humanizeFeatureKey } from "@/lib/organization-settings/features";
import type { ParentPortalContextOption } from "@/lib/organization-settings/resolve-program-parent-features";
import type { ParentFeatures, PortalFeatureNav } from "@/lib/organization-settings/types";

const PRIMARY_NAV_COUNT = 7;
const MOBILE_PRIMARY_TAB_SLOTS = 4;

const PARENT_MORE_NAV_KEYS = new Set([
  "attendance",
  "enrollment_checklist",
  "classroom_signups",
  "forms_documents",
  "friday_branch",
]);

const CATALOG_PAGE_LABELS = Object.fromEntries(
  FEATURE_CATALOG.filter((entry) => entry.portal === "parent").map((entry) => [
    entry.key,
    entry.label,
  ]),
) as Record<string, string>;

const PARENT_FEATURE_TO_MOBILE_SEGMENT: Record<string, string> = {
  portal: "home",
  billing: "billing",
  messages: "messages",
  calendar: "calendar",
  curriculum: "curriculum",
  supply_list: "supply-list",
  teaching_schedule: "teaching-schedule",
};

/** More menu rows keyed by parent feature flag. */
export const MOBILE_MORE_MENU_FEATURE_KEYS = [
  "attendance",
  "children",
  "committees",
  "classroom_signups",
  "forms_documents",
  "friday_branch",
  "notifications",
] as const;

export type MobileMoreMenuFeatureKey = (typeof MOBILE_MORE_MENU_FEATURE_KEYS)[number];

export type MobileParentTabId =
  | "home"
  | "billing"
  | "messages"
  | "calendar"
  | "curriculum"
  | "supply-list"
  | "teaching-schedule"
  | "more";

export type MobileParentTabDefinition = {
  tabId: MobileParentTabId;
  featureKey: string;
  label: string;
  pathSegment: string;
  iconOutline: string;
  iconFilled: string;
};

export type MobilePortalContextDetection =
  | { mode: "main" }
  | { mode: "program"; portalSlug: string };

export type MobileParentNavItemKey = {
  key: string;
  label: string;
};

const TAB_ICON_BY_FEATURE: Record<
  string,
  { iconOutline: string; iconFilled: string }
> = {
  portal: { iconOutline: "home-outline", iconFilled: "home" },
  billing: { iconOutline: "card-outline", iconFilled: "card" },
  messages: { iconOutline: "chatbubble-outline", iconFilled: "chatbubble" },
  calendar: { iconOutline: "calendar-outline", iconFilled: "calendar" },
  curriculum: { iconOutline: "book-outline", iconFilled: "book" },
  supply_list: { iconOutline: "list-outline", iconFilled: "list" },
  teaching_schedule: { iconOutline: "time-outline", iconFilled: "time" },
};

const MORE_TAB: MobileParentTabDefinition = {
  tabId: "more",
  featureKey: "more",
  label: "More",
  pathSegment: "more",
  iconOutline: "ellipsis-horizontal-outline",
  iconFilled: "ellipsis-horizontal",
};

const MAIN_DEFAULT_TAB_FEATURES = [
  "portal",
  "billing",
  "messages",
  "calendar",
] as const;

function toParentFeatureRecord(
  parentFeatures: ParentFeatures,
): Record<string, boolean> {
  return parentFeatures as unknown as Record<string, boolean>;
}

function getParentPageLabel(key: string, portalNav?: PortalFeatureNav): string {
  const label = portalNav?.items[key]?.label ?? CATALOG_PAGE_LABELS[key];
  if (label) return label;
  return humanizeFeatureKey(key);
}

export function buildMobileParentNavItemKeys(
  parentFeatures: ParentFeatures,
  portalNav?: PortalFeatureNav,
): MobileParentNavItemKey[] {
  const record = toParentFeatureRecord(parentFeatures);
  const mergedNav = mergePortalFeatureNav("parent", portalNav);
  const allKeys = Object.keys(record);
  const orderedKeys = resolvePortalFeatureOrder("parent", allKeys, mergedNav);
  const items: MobileParentNavItemKey[] = [];

  for (const key of orderedKeys) {
    if (!record[key]) continue;
    const resolved = resolveFeatureNavItem("parent", key, mergedNav);
    items.push({
      key,
      label: resolved.label ?? getParentPageLabel(key, mergedNav),
    });
  }

  return items;
}

export function splitMobileParentNavForTabBar(
  items: MobileParentNavItemKey[],
  options?: { coopMode?: boolean },
): {
  primary: MobileParentNavItemKey[];
  more: MobileParentNavItemKey[];
} {
  const moreKeys = new Set(PARENT_MORE_NAV_KEYS);
  if (options?.coopMode) {
    moreKeys.add("committees");
    moreKeys.add("children");
  }

  const primaryKeys = new Set(
    items
      .filter((item) => !moreKeys.has(item.key))
      .slice(0, PRIMARY_NAV_COUNT)
      .map((item) => item.key),
  );

  if (options?.coopMode) {
    const teachingSchedule = items.find((item) => item.key === "teaching_schedule");
    if (teachingSchedule) {
      primaryKeys.add("teaching_schedule");
    }
  }

  return {
    primary: items.filter((item) => primaryKeys.has(item.key)),
    more: items.filter((item) => !primaryKeys.has(item.key)),
  };
}

function featureKeyToTabDefinition(item: MobileParentNavItemKey): MobileParentTabDefinition | null {
  const pathSegment = PARENT_FEATURE_TO_MOBILE_SEGMENT[item.key];
  if (!pathSegment) return null;

  const icons = TAB_ICON_BY_FEATURE[item.key] ?? TAB_ICON_BY_FEATURE.portal;
  return {
    tabId: pathSegment as MobileParentTabId,
    featureKey: item.key,
    label: item.key === "portal" ? "Home" : item.label,
    pathSegment,
    iconOutline: icons.iconOutline,
    iconFilled: icons.iconFilled,
  };
}

function resolveMainPortalTabBar(parentFeatures: ParentFeatures): MobileParentTabDefinition[] {
  const record = toParentFeatureRecord(parentFeatures);
  const tabs: MobileParentTabDefinition[] = [];

  for (const featureKey of MAIN_DEFAULT_TAB_FEATURES) {
    if (featureKey !== "portal" && !record[featureKey]) {
      continue;
    }
    const label =
      featureKey === "portal"
        ? "Home"
        : getParentPageLabel(featureKey);
    const pathSegment = PARENT_FEATURE_TO_MOBILE_SEGMENT[featureKey]!;
    const icons = TAB_ICON_BY_FEATURE[featureKey]!;
    tabs.push({
      tabId: pathSegment as MobileParentTabId,
      featureKey,
      label,
      pathSegment,
      iconOutline: icons.iconOutline,
      iconFilled: icons.iconFilled,
    });
  }

  tabs.push(MORE_TAB);
  return tabs;
}

export function resolveMobileParentTabBar(input: {
  mode: "main" | "program";
  parentFeatures: ParentFeatures;
  portalNav?: PortalFeatureNav;
  coopMode?: boolean;
}): MobileParentTabDefinition[] {
  if (input.mode === "main") {
    return resolveMainPortalTabBar(input.parentFeatures);
  }

  const items = buildMobileParentNavItemKeys(input.parentFeatures, input.portalNav);
  const { primary } = splitMobileParentNavForTabBar(items, {
    coopMode: input.coopMode,
  });

  let tabItems = primary
    .map((item) => featureKeyToTabDefinition(item))
    .filter((tab): tab is MobileParentTabDefinition => tab != null);

  if (input.coopMode) {
    const teachingSchedule = tabItems.find(
      (tab) => tab.featureKey === "teaching_schedule",
    );
    const withoutTeaching = tabItems.filter(
      (tab) => tab.featureKey !== "teaching_schedule",
    );
    if (teachingSchedule) {
      tabItems = [...withoutTeaching.slice(0, MOBILE_PRIMARY_TAB_SLOTS - 1), teachingSchedule];
    } else {
      tabItems = tabItems.slice(0, MOBILE_PRIMARY_TAB_SLOTS);
    }
  } else {
    tabItems = tabItems.slice(0, MOBILE_PRIMARY_TAB_SLOTS);
  }

  return [...tabItems, MORE_TAB];
}

export function resolveMobileMoreMenuFeatureKeys(input: {
  mode?: "main" | "program";
  parentFeatures: ParentFeatures;
  portalNav?: PortalFeatureNav;
  coopMode?: boolean;
}): MobileMoreMenuFeatureKey[] {
  const record = toParentFeatureRecord(input.parentFeatures);

  return MOBILE_MORE_MENU_FEATURE_KEYS.filter((key) => {
    if (key === "notifications") return true;
    return Boolean(record[key]);
  });
}

export function detectMobilePortalContextFromPathname(
  pathname: string,
): MobilePortalContextDetection {
  const programMatch = pathname.match(/\/parent\/[^/]+\/p\/([^/]+)/);
  if (programMatch?.[1]) {
    return { mode: "program", portalSlug: programMatch[1] };
  }
  return { mode: "main" };
}

export function resolveMobilePortalEntryPath(
  slug: string,
  context: Pick<ParentPortalContextOption, "id" | "portalSlug">,
): string {
  if (context.id === "main") {
    return `/parent/${slug}/home`;
  }
  const portalSlug = context.portalSlug?.trim();
  if (!portalSlug) {
    return `/parent/${slug}/home`;
  }
  return `/parent/${slug}/p/${encodeURIComponent(portalSlug)}/home`;
}

export function parentFeatureKeyToMobilePathSegment(featureKey: string): string | null {
  return PARENT_FEATURE_TO_MOBILE_SEGMENT[featureKey] ?? null;
}

export function mobilePathSegmentToParentTabId(
  segment: string,
): MobileParentTabId | null {
  if (segment === "more") return "more";
  const entries = Object.entries(PARENT_FEATURE_TO_MOBILE_SEGMENT);
  for (const [key, path] of entries) {
    if (path === segment) {
      return path as MobileParentTabId;
    }
  }
  return null;
}
