import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SkeletonBlock from "./SkeletonBlock";

type SchoolAdminPaymentsSetupSkeletonProps = {
  C: AdminThemeTokens;
  label?: string;
};

export default function SchoolAdminPaymentsSetupSkeleton({
  C,
  label = "Loading payment setup",
}: SchoolAdminPaymentsSetupSkeletonProps) {
  return (
    <div
      className="space-y-5 px-4 py-5 sm:px-5"
      aria-busy="true"
      aria-label={label}
    >
      <div
        className="rounded-lg border p-5"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <div className="flex items-start gap-4">
          <SkeletonBlock C={C} className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock C={C} className="h-5 w-48" />
            <SkeletonBlock C={C} className="h-4 w-full max-w-md" />
            <SkeletonBlock C={C} className="h-4 w-3/4 max-w-sm" />
          </div>
        </div>

        <div
          className="mt-5 overflow-hidden rounded-lg border"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
              style={{ borderColor: C.border }}
            >
              <SkeletonBlock C={C} className="h-5 w-5 rounded-full" />
              <SkeletonBlock C={C} className="h-4 w-48" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
