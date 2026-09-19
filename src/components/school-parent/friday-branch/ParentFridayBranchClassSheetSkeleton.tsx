import ParentCard from "@/components/school-parent/ui/ParentCard";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentFridayBranchClassSheetSkeletonProps = {
  theme: ParentThemeTokens;
};

export default function ParentFridayBranchClassSheetSkeleton({
  theme,
}: ParentFridayBranchClassSheetSkeletonProps) {
  const lineStyle = { backgroundColor: theme.line };

  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading class details">
      <ParentCard theme={theme} className="p-4">
        <div className="mb-3 h-3 w-24 animate-pulse rounded" style={lineStyle} />
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full" style={lineStyle} />
          <div className="h-6 w-20 animate-pulse rounded-full" style={lineStyle} />
        </div>
        <div className="space-y-3">
          <div>
            <div className="h-2.5 w-16 animate-pulse rounded" style={lineStyle} />
            <div className="mt-2 h-4 w-28 animate-pulse rounded" style={lineStyle} />
          </div>
          <div>
            <div className="h-2.5 w-14 animate-pulse rounded" style={lineStyle} />
            <div className="mt-2 h-4 w-32 animate-pulse rounded" style={lineStyle} />
          </div>
        </div>
      </ParentCard>

      <ParentCard theme={theme} className="p-4">
        <div className="mb-3 h-3 w-28 animate-pulse rounded" style={lineStyle} />
        <div className="mb-4 h-4 w-full max-w-[220px] animate-pulse rounded" style={lineStyle} />
        <div className="space-y-2.5">
          <div className="h-[52px] w-full animate-pulse rounded-2xl" style={lineStyle} />
          <div className="h-[52px] w-full animate-pulse rounded-2xl" style={lineStyle} />
          <div className="h-[52px] w-full animate-pulse rounded-2xl" style={lineStyle} />
        </div>
      </ParentCard>
    </div>
  );
}
