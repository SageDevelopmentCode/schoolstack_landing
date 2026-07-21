import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SkeletonBlock from "./SkeletonBlock";

type SchoolAdminSplitPaneSkeletonProps = {
  C: AdminThemeTokens;
  sidebarItems?: number;
  label?: string;
};

export default function SchoolAdminSplitPaneSkeleton({
  C,
  sidebarItems = 5,
  label = "Loading page",
}: SchoolAdminSplitPaneSkeletonProps) {
  return (
    <div
      className="flex h-full min-h-0"
      style={{ backgroundColor: C.surface }}
      aria-busy="true"
      aria-label={label}
    >
      <div
        className="flex h-full min-h-0 w-[240px] flex-shrink-0 flex-col overflow-hidden"
        style={{
          borderRight: `1px solid ${C.border}`,
          backgroundColor: C.surface,
        }}
      >
        <div
          className="flex h-14 flex-shrink-0 items-center justify-between px-3"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <SkeletonBlock C={C} className="h-4 w-20" />
          <SkeletonBlock C={C} className="h-7 w-14 rounded-sm" />
        </div>
        <div className="flex-1 space-y-0 overflow-y-auto">
          {Array.from({ length: sidebarItems }).map((_, index) => (
            <div key={index} className="space-y-1.5 px-3 py-3">
              <SkeletonBlock C={C} className="h-4 w-3/4" />
              <SkeletonBlock C={C} className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div
          className="flex h-14 flex-shrink-0 items-center gap-3 border-b px-5"
          style={{ borderColor: C.border }}
        >
          <SkeletonBlock C={C} className="h-5 w-40" />
          <SkeletonBlock C={C} className="h-7 w-16 rounded-sm" />
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBlock C={C} className="h-3 w-24" />
              <SkeletonBlock C={C} className="h-10 w-full rounded-sm" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <SkeletonBlock C={C} className="h-9 w-24 rounded-sm" />
            <SkeletonBlock C={C} className="h-9 w-20 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
