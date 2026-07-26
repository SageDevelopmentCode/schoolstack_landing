import {
  mergePortalFeatureNav,
  resolveFeatureNavItem,
  resolvePortalFeatureOrder,
} from "./feature-nav";
import { getParentPageLabel } from "./parent-nav";
import { schoolParentPath } from "./parent-routes";
import type { OrganizationFeatures } from "./types";

export type ParentQuickAction = {
  key: string;
  label: string;
  href: string;
  iconSlug: string;
  enabled: boolean;
};

export function buildParentQuickActions(
  slug: string,
  features: OrganizationFeatures,
): ParentQuickAction[] {
  const parentFeatures = features.parent;
  if (!parentFeatures || typeof parentFeatures !== "object") {
    return [];
  }

  const record = parentFeatures as Record<string, boolean>;
  const enabledKeys = Object.keys(record).filter((key) => record[key]);
  const portalNav = mergePortalFeatureNav("parent", features.feature_nav?.parent);
  const orderedKeys = resolvePortalFeatureOrder(
    "parent",
    enabledKeys,
    portalNav,
  ).filter((key) => key !== "portal");

  return orderedKeys.map((key) => {
    const navItem = resolveFeatureNavItem("parent", key, portalNav);
    const iconSlug = navItem.icon ?? "puzzle";

    return {
      key,
      label: getParentPageLabel(key, portalNav),
      href: schoolParentPath(slug, key),
      iconSlug,
      enabled: true,
    };
  });
}
