import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type SkeletonBlockProps = {
  C: AdminThemeTokens;
  className?: string;
};

export default function SkeletonBlock({ C, className = "" }: SkeletonBlockProps) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ backgroundColor: C.elevated }}
      aria-hidden
    />
  );
}
