import type { LucideIcon } from "lucide-react";
import { getFeatureIcon } from "@/lib/organization-settings/icon-registry";
import { getParentFeatureIconStyle } from "@/lib/organization-settings/parent-feature-icon-styles";

const CATEGORY_ICON_SLUGS: Record<string, string> = {
  "getting started": "home",
  "your students": "users",
  messages: "message-square",
  calendar: "calendar-days",
  "classroom signups": "clipboard-list",
};

export type TeacherDocumentationCategoryVisual = {
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

export function getTeacherDocumentationCategoryVisual(
  category: string,
): TeacherDocumentationCategoryVisual {
  const iconSlug =
    CATEGORY_ICON_SLUGS[category.trim().toLowerCase()] ?? "puzzle";
  const { iconBg, iconColor } = getParentFeatureIconStyle(iconSlug);

  return {
    Icon: getFeatureIcon(iconSlug),
    iconBg,
    iconColor,
  };
}
