import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SkeletonBlock from "./SkeletonBlock";

type SchoolAdminTimelineSkeletonProps = {
  C: AdminThemeTokens;
  entries?: number;
  label?: string;
};

export default function SchoolAdminTimelineSkeleton({
  C,
  entries = 3,
  label = "Loading history",
}: SchoolAdminTimelineSkeletonProps) {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: entries }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <SkeletonBlock C={C} className="h-8 w-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2 pb-4">
            <SkeletonBlock C={C} className="h-4 w-40" />
            <SkeletonBlock C={C} className="h-3 w-24" />
            <SkeletonBlock C={C} className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
