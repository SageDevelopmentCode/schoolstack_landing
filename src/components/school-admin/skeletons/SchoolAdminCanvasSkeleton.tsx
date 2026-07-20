import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SkeletonBlock from "./SkeletonBlock";

type SchoolAdminCanvasSkeletonProps = {
  C: AdminThemeTokens;
  label?: string;
};

export default function SchoolAdminCanvasSkeleton({
  C,
  label = "Loading editor",
}: SchoolAdminCanvasSkeletonProps) {
  return (
    <div
      className="flex h-full flex-1 flex-col overflow-hidden"
      style={{ backgroundColor: C.surface }}
      aria-busy="true"
      aria-label={label}
    >
      <div
        className="flex flex-shrink-0 flex-wrap items-center gap-3 border-b px-5 py-3"
        style={{ borderColor: C.border }}
      >
        <SkeletonBlock C={C} className="h-5 w-48" />
        <SkeletonBlock C={C} className="h-7 w-20 rounded-sm" />
        <div className="ml-auto flex gap-2">
          <SkeletonBlock C={C} className="h-8 w-16 rounded-sm" />
          <SkeletonBlock C={C} className="h-8 w-20 rounded-sm" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div
          className="w-56 flex-shrink-0 space-y-2 border-r p-4"
          style={{ borderColor: C.border }}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock key={index} C={C} className="h-8 w-full rounded-sm" />
          ))}
        </div>
        <div className="min-w-0 flex-1 space-y-4 p-5">
          <SkeletonBlock C={C} className="h-6 w-40" />
          <SkeletonBlock C={C} className="h-24 w-full rounded-sm" />
          <SkeletonBlock C={C} className="h-24 w-full rounded-sm" />
          <SkeletonBlock C={C} className="h-16 w-full rounded-sm" />
        </div>
      </div>
    </div>
  );
}
