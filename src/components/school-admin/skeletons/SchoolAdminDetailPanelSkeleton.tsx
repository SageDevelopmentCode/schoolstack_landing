import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SkeletonBlock from "./SkeletonBlock";

type SchoolAdminDetailPanelSkeletonProps = {
  C: AdminThemeTokens;
  showTabs?: boolean;
  sections?: number;
  compact?: boolean;
  label?: string;
};

export default function SchoolAdminDetailPanelSkeleton({
  C,
  showTabs = true,
  sections = 3,
  compact = false,
  label = "Loading details",
}: SchoolAdminDetailPanelSkeletonProps) {
  return (
    <div
      className={compact ? "space-y-4" : "space-y-5"}
      aria-busy="true"
      aria-label={label}
    >
      <div className="space-y-2">
        <SkeletonBlock C={C} className="h-5 w-48" />
        <SkeletonBlock C={C} className="h-4 w-32" />
      </div>

      {showTabs ? (
        <div className="flex gap-2 border-b pb-2" style={{ borderColor: C.border }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} C={C} className="h-7 w-20 rounded-sm" />
          ))}
        </div>
      ) : null}

      {Array.from({ length: sections }).map((_, index) => (
        <div
          key={index}
          className="space-y-3 rounded-sm border p-4"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <SkeletonBlock C={C} className="h-4 w-28" />
          <SkeletonBlock C={C} className="h-3 w-full" />
          <SkeletonBlock C={C} className="h-3 w-5/6" />
          <SkeletonBlock C={C} className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
