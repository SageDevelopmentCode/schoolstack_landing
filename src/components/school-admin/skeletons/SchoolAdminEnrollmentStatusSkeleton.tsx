import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SkeletonBlock from "./SkeletonBlock";

type SchoolAdminEnrollmentStatusSkeletonProps = {
  C: AdminThemeTokens;
  label?: string;
};

export default function SchoolAdminEnrollmentStatusSkeleton({
  C,
  label = "Loading enrollment status",
}: SchoolAdminEnrollmentStatusSkeletonProps) {
  return (
    <section
      className="space-y-3"
      aria-busy="true"
      aria-label={label}
    >
      <div className="flex items-center justify-between gap-3">
        <SkeletonBlock C={C} className="h-4 w-36" />
        <SkeletonBlock C={C} className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonBlock C={C} className="h-2 w-full rounded-full" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <SkeletonBlock C={C} className="h-5 w-5 rounded-full" />
            <SkeletonBlock C={C} className="h-4 w-40" />
          </div>
        ))}
      </div>
    </section>
  );
}
