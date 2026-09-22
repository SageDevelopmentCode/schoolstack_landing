import ParentSkeletonBlock from "@/components/school-parent/ui/ParentSkeletonBlock";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type CommitteeActivityFeedSkeletonProps = {
  theme: ParentThemeTokens;
  compact?: boolean;
  rowCount?: number;
  showTitle?: boolean;
};

export default function CommitteeActivityFeedSkeleton({
  theme,
  compact = false,
  rowCount,
  showTitle = true,
}: CommitteeActivityFeedSkeletonProps) {
  const rows = rowCount ?? (compact ? 5 : 8);

  return (
    <div aria-busy="true" aria-label="Loading activity">
      {showTitle ? (
        <div className="mb-2 flex items-center justify-between gap-3">
          <ParentSkeletonBlock theme={theme} className="h-5 w-32 rounded-md" />
          <ParentSkeletonBlock theme={theme} className="h-3 w-16 rounded-md" />
        </div>
      ) : null}
      <div
        className={compact ? "max-h-64 divide-y overflow-hidden pr-1" : "divide-y"}
        style={{ borderColor: "#EDF1ED" }}
      >
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5 py-2"
            style={{ borderColor: "#EDF1ED" }}
          >
            <ParentSkeletonBlock theme={theme} className="h-5 w-14 rounded-full" />
            <div className="min-w-0 space-y-1.5">
              <ParentSkeletonBlock
                theme={theme}
                className={`h-3 rounded-md ${index % 3 === 0 ? "w-full" : "w-4/5"}`}
              />
              <ParentSkeletonBlock theme={theme} className="h-2.5 w-1/3 rounded-md" />
            </div>
            <ParentSkeletonBlock theme={theme} className="h-3 w-10 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
