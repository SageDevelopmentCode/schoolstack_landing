import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SkeletonBlock from "./SkeletonBlock";

type SchoolAdminTableSkeletonProps = {
  C: AdminThemeTokens;
  rows?: number;
  columns?: number;
  showFilters?: boolean;
  filterChips?: number;
  compact?: boolean;
  label?: string;
};

export default function SchoolAdminTableSkeleton({
  C,
  rows = 6,
  columns = 5,
  showFilters = true,
  filterChips = 4,
  compact = false,
  label = "Loading table",
}: SchoolAdminTableSkeletonProps) {
  return (
    <div
      className="flex h-full min-h-0 flex-col"
      aria-busy="true"
      aria-label={label}
    >
      {showFilters ? (
        <div
          className="flex flex-shrink-0 flex-wrap items-center gap-2 px-4 py-3 sm:px-5"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <SkeletonBlock C={C} className="h-3 w-12" />
          {Array.from({ length: filterChips }).map((_, index) => (
            <SkeletonBlock key={index} C={C} className="h-7 w-16 rounded-full" />
          ))}
        </div>
      ) : null}

      <div className="flex-1 overflow-hidden" style={{ backgroundColor: C.surface }}>
        <div className="px-3 py-2.5 sm:px-4" style={{ borderBottom: `2px solid ${C.border}` }}>
          <div className="flex gap-3">
            {Array.from({ length: columns }).map((_, index) => (
              <SkeletonBlock
                key={index}
                C={C}
                className={`h-5 ${compact ? "w-16" : "w-20"} rounded-full`}
              />
            ))}
          </div>
        </div>
        <div>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center gap-3 px-3 py-3 sm:px-4"
              style={
                rowIndex < rows - 1
                  ? { borderBottom: `1px solid ${C.border}` }
                  : undefined
              }
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <SkeletonBlock
                  key={colIndex}
                  C={C}
                  className={`h-4 ${colIndex === 0 ? "w-28" : colIndex === columns - 1 ? "w-16" : "w-20"}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
