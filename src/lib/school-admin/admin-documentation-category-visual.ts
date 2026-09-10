import type { LucideIcon } from "lucide-react";
import { getFeatureIcon } from "@/lib/organization-settings/icon-registry";
import { getParentFeatureIconStyle } from "@/lib/organization-settings/parent-feature-icon-styles";

const CATEGORY_ICON_SLUGS: Record<string, string> = {
  "getting started": "home",
  "admissions — apply": "clipboard-list",
  "admissions — submissions": "file-text",
  "admissions — enrollment flows": "git-branch",
  payments: "credit-card",
  schedule: "calendar-days",
  tuition: "wallet",
  committees: "users",
};

export type AdminDocumentationCategoryVisual = {
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

export function getAdminDocumentationCategoryVisual(
  category: string,
): AdminDocumentationCategoryVisual {
  const iconSlug =
    CATEGORY_ICON_SLUGS[category.trim().toLowerCase()] ?? "puzzle";
  const { iconBg, iconColor } = getParentFeatureIconStyle(iconSlug);

  return {
    Icon: getFeatureIcon(iconSlug),
    iconBg,
    iconColor,
  };
}
