export type ParentFeatureIconStyle = {
  iconBg: string;
  iconColor: string;
};

const PARENT_FEATURE_ICON_STYLES: Record<string, ParentFeatureIconStyle> = {
  home: { iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
  "dollar-sign": { iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  "message-square": { iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  "calendar-days": { iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  "clipboard-list": { iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  megaphone: { iconBg: "bg-sky-100", iconColor: "text-sky-600" },
  users: { iconBg: "bg-rose-100", iconColor: "text-rose-600" },
  heart: { iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  puzzle: { iconBg: "bg-gray-100", iconColor: "text-gray-500" },
};

const DEFAULT_ICON_STYLE: ParentFeatureIconStyle = {
  iconBg: "bg-gray-100",
  iconColor: "text-gray-500",
};

export function getParentFeatureIconStyle(
  iconSlug: string,
): ParentFeatureIconStyle {
  return PARENT_FEATURE_ICON_STYLES[iconSlug] ?? DEFAULT_ICON_STYLE;
}

export function getParentFeatureIconColor(iconSlug: string): string {
  return getParentFeatureIconStyle(iconSlug).iconColor;
}
