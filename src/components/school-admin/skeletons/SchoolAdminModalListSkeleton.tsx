import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SkeletonBlock from "./SkeletonBlock";

type SchoolAdminModalListSkeletonProps = {
  C: AdminThemeTokens;
  groups?: number;
  itemsPerGroup?: number;
  label?: string;
};

export default function SchoolAdminModalListSkeleton({
  C,
  groups = 2,
  itemsPerGroup = 2,
  label = "Loading options",
}: SchoolAdminModalListSkeletonProps) {
  return (
    <div
      className="space-y-5"
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: groups }).map((_, groupIndex) => (
        <div key={groupIndex} className="space-y-2">
          <SkeletonBlock C={C} className="h-3 w-24" />
          <div className="space-y-2">
            {Array.from({ length: itemsPerGroup }).map((_, itemIndex) => (
              <div
                key={itemIndex}
                className="flex items-center gap-3 rounded-lg border p-3"
                style={{ borderColor: C.border, backgroundColor: C.surface }}
              >
                <SkeletonBlock C={C} className="h-5 w-5 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <SkeletonBlock C={C} className="h-4 w-40" />
                  <SkeletonBlock C={C} className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
