import { CATALOG_ADDITIONAL_KEYS, FEATURE_CATALOG } from "./catalog";
import { DEFAULT_FEATURE_ICON_SLUG } from "./icon-registry";
import {
  removeFeatureNavItem,
  setFeatureNavItem,
  updatePortalNav,
} from "./feature-nav";
import type {
  FeatureNavItemConfig,
  OrganizationFeatures,
  FeaturePortal,
  Portal,
} from "./types";

const FEATURE_KEY_PATTERN = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;

const PORTAL_CATALOG_KEYS: Record<FeaturePortal, Set<string>> = {
  admin: new Set(
    FEATURE_CATALOG.filter((f) => f.portal === "admin").map((f) => f.key),
  ),
  teacher: new Set(
    FEATURE_CATALOG.filter((f) => f.portal === "teacher").map((f) => f.key),
  ),
  parent: new Set(
    FEATURE_CATALOG.filter((f) => f.portal === "parent").map((f) => f.key),
  ),
  additional: CATALOG_ADDITIONAL_KEYS,
};

export type CustomFeatureMeta = {
  label: string;
  icon: string;
  group: string;
};

export function humanizeFeatureKey(key: string): string {
  return key
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeFeatureKey(raw: string): string {
  return raw.trim().replace(/\s+/g, "_").toLowerCase();
}

export function isValidFeatureKey(key: string): boolean {
  return FEATURE_KEY_PATTERN.test(key);
}

export function getPortalFeatureRecord(
  features: OrganizationFeatures,
  portal: FeaturePortal,
): Record<string, boolean> {
  if (portal === "additional") {
    const result: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(features)) {
      if (typeof value === "boolean") {
        result[key] = value;
      }
    }
    return result;
  }

  const portalFeatures = features[portal];
  if (
    portalFeatures &&
    typeof portalFeatures === "object" &&
    !Array.isArray(portalFeatures)
  ) {
    return portalFeatures as Record<string, boolean>;
  }

  return {};
}

export function extractCustomPortalFeatureKeys(
  portal: FeaturePortal,
  features: OrganizationFeatures,
): string[] {
  const catalogKeys = PORTAL_CATALOG_KEYS[portal];

  if (portal === "additional") {
    return Object.keys(features).filter(
      (key) =>
        typeof features[key] === "boolean" && !catalogKeys.has(key),
    );
  }

  const portalFeatures = getPortalFeatureRecord(features, portal);
  return Object.keys(portalFeatures).filter(
    (key) => !catalogKeys.has(key) && typeof portalFeatures[key] === "boolean",
  );
}

export function canAddPortalFeatureKey(
  portal: FeaturePortal,
  features: OrganizationFeatures,
  rawKey: string,
): boolean {
  const key = normalizeFeatureKey(rawKey);
  if (!key || !isValidFeatureKey(key)) return false;

  const catalogKeys = PORTAL_CATALOG_KEYS[portal];
  if (catalogKeys.has(key)) return false;

  if (portal === "additional") {
    return typeof features[key] !== "boolean";
  }

  const portalFeatures = getPortalFeatureRecord(features, portal);
  return typeof portalFeatures[key] !== "boolean";
}

export function addCustomPortalFeature(
  features: OrganizationFeatures,
  portal: FeaturePortal,
  rawKey: string,
  meta?: CustomFeatureMeta,
): OrganizationFeatures {
  const key = normalizeFeatureKey(rawKey);
  if (!canAddPortalFeatureKey(portal, features, key)) {
    return features;
  }

  let next = features;

  if (portal === "additional") {
    next = { ...features, [key]: false };
  } else {
    const portalFeatures = {
      ...getPortalFeatureRecord(features, portal),
      [key]: false,
    };
    next = { ...features, [portal]: portalFeatures } as OrganizationFeatures;
  }

  if (portal !== "additional" && meta) {
    const portalNav = next.feature_nav?.[portal as Portal];
    const nav = portalNav ?? { groups: [meta.group], items: {} };
    const updatedNav = setFeatureNavItem(nav, key, {
      group: meta.group,
      label: meta.label,
      icon: meta.icon || DEFAULT_FEATURE_ICON_SLUG,
    });
    next = updatePortalNav(next, portal as Portal, updatedNav);
  }

  return next;
}

export function removeCustomPortalFeature(
  features: OrganizationFeatures,
  portal: FeaturePortal,
  key: string,
): OrganizationFeatures {
  let next = features;

  if (portal === "additional") {
    const updated = { ...features };
    delete updated[key];
    next = updated;
  } else {
    const portalFeatures = { ...getPortalFeatureRecord(features, portal) };
    delete portalFeatures[key];
    next = { ...features, [portal]: portalFeatures } as OrganizationFeatures;

    const portalNav = next.feature_nav?.[portal as Portal];
    if (portalNav) {
      next = updatePortalNav(
        next,
        portal as Portal,
        removeFeatureNavItem(portalNav, key),
      );
    }
  }

  return next;
}

export function updateFeatureNavItemForPortal(
  features: OrganizationFeatures,
  portal: Portal,
  key: string,
  patch: Partial<FeatureNavItemConfig>,
): OrganizationFeatures {
  const portalNav = features.feature_nav?.[portal] ?? {
    groups: patch.group ? [patch.group] : ["Main"],
    items: {},
  };
  const updatedNav = setFeatureNavItem(portalNav, key, patch);
  return updatePortalNav(features, portal, updatedNav);
}

export function getEnabledFeatureKeys(
  portalFeatures: Record<string, boolean>,
  catalogKeys: Set<string>,
): string[] {
  return Object.keys(portalFeatures)
    .filter((key) => portalFeatures[key])
    .sort((a, b) => {
      const aCatalog = catalogKeys.has(a);
      const bCatalog = catalogKeys.has(b);
      if (aCatalog && !bCatalog) return -1;
      if (!aCatalog && bCatalog) return 1;
      return a.localeCompare(b);
    });
}
