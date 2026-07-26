import SkeletonBlock from "@/components/school-admin/skeletons/SkeletonBlock";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type TuitionSetupWizardSkeletonProps = {
  C: AdminThemeTokens;
  label?: string;
};

const STEP_PILL_WIDTHS = ["w-16", "w-14", "w-20", "w-12", "w-14"] as const;

export default function TuitionSetupWizardSkeleton({
  C,
  label = "Loading rate plan setup",
}: TuitionSetupWizardSkeletonProps) {
  return (
    <div
      className="flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-2xl"
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${C.border}`,
      }}
      aria-busy="true"
      aria-label={label}
    >
      <div className="shrink-0 px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="space-y-2">
          <SkeletonBlock C={C} className="h-3 w-24" />
          <SkeletonBlock C={C} className="h-6 w-64" />
          <SkeletonBlock C={C} className="h-4 w-80 max-w-full" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {STEP_PILL_WIDTHS.map((width, index) => (
            <SkeletonBlock key={index} C={C} className={`h-8 ${width} rounded-md`} />
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-4 px-6 py-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-1.5">
            <SkeletonBlock C={C} className="h-3 w-20" />
            <SkeletonBlock C={C} className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>

      <div
        className="flex shrink-0 items-center justify-between gap-3 px-6 py-4"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <SkeletonBlock C={C} className="h-9 w-16 rounded-md" />
        <SkeletonBlock C={C} className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}
