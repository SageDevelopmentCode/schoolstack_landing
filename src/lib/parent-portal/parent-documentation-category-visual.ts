import type { LucideIcon } from "lucide-react";
import { getFeatureIcon } from "@/lib/organization-settings/icon-registry";
import { getParentFeatureIconStyle } from "@/lib/organization-settings/parent-feature-icon-styles";

const CATEGORY_ICON_SLUGS: Record<string, string> = {
  "getting started": "home",
  billing: "credit-card",
  messages: "message-square",
  calendar: "calendar-days",
  "your children": "heart",
  committees: "users",
  classroom: "clipboard-list",
  "co-op": "puzzle",
};

export type ParentDocumentationCategoryVisual = {
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

export function getParentDocumentationCategoryVisual(
  category: string,
): ParentDocumentationCategoryVisual {
  const iconSlug =
    CATEGORY_ICON_SLUGS[category.trim().toLowerCase()] ?? "puzzle";
  const { iconBg, iconColor } = getParentFeatureIconStyle(iconSlug);

  return {
    Icon: getFeatureIcon(iconSlug),
    iconBg,
    iconColor,
  };
}
