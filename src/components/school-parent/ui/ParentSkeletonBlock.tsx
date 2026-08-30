import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentSkeletonBlockProps = {
  theme: ParentThemeTokens;
  className?: string;
};

export default function ParentSkeletonBlock({
  theme,
  className = "",
}: ParentSkeletonBlockProps) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: theme.primarySoft }}
      aria-hidden
    />
  );
}
