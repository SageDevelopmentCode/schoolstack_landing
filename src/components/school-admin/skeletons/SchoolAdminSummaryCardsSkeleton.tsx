import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SkeletonBlock from "./SkeletonBlock";

type SchoolAdminSummaryCardsSkeletonProps = {
  C: AdminThemeTokens;
  count?: number;
  label?: string;
};

export default function SchoolAdminSummaryCardsSkeleton({
  C,
  count = 4,
  label = "Loading summary",
}: SchoolAdminSummaryCardsSkeletonProps) {
  return (
    <div
      className="grid grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-4 sm:px-5"
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-sm p-3"
          style={{
            backgroundColor: C.elevated,
            border: `1px solid ${C.border}`,
          }}
        >
          <SkeletonBlock C={C} className="mb-2 h-3 w-20" />
          <SkeletonBlock C={C} className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}
