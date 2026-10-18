import ParentSkeletonBlock from "@/components/school-parent/ui/ParentSkeletonBlock";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type DemoSchedulerSkeletonProps = {
  storyTheme: ParentThemeTokens;
};

export function DemoSchedulerSkeleton({ storyTheme }: DemoSchedulerSkeletonProps) {
  const borderColor = storyTheme.line;

  return (
    <div
      className="grid lg:grid-cols-[260px_minmax(0,1fr)] overflow-hidden min-h-[500px] bg-white"
      style={{
        borderRadius: storyTheme.radiusCard,
        boxShadow: storyTheme.shadowCard,
        border: `1px solid ${borderColor}`,
      }}
      role="status"
      aria-busy="true"
      aria-label="Loading available times"
    >
      <div
        className="border-b lg:border-b-0 lg:border-r p-5 lg:p-7"
        style={{ borderColor, backgroundColor: storyTheme.cream }}
      >
        <div className="lg:hidden space-y-2">
          <ParentSkeletonBlock theme={storyTheme} className="h-3 w-20" />
          <ParentSkeletonBlock theme={storyTheme} className="h-5 w-32" />
          <div className="flex gap-3">
            <ParentSkeletonBlock theme={storyTheme} className="h-4 w-20" />
            <ParentSkeletonBlock theme={storyTheme} className="h-4 w-16" />
          </div>
        </div>
        <div className="hidden lg:block space-y-3">
          <ParentSkeletonBlock theme={storyTheme} className="h-3 w-20 opacity-60" />
          <ParentSkeletonBlock theme={storyTheme} className="h-7 w-36 opacity-60" />
          <ParentSkeletonBlock theme={storyTheme} className="h-12 w-full opacity-40" />
          <ParentSkeletonBlock theme={storyTheme} className="h-16 w-full opacity-40" />
        </div>
      </div>

      <div className="flex flex-col min-w-0">
        <div
          className="border-b p-5 flex flex-col sm:flex-row gap-4 justify-between"
          style={{ borderColor }}
        >
          <div className="space-y-2 flex-1">
            <ParentSkeletonBlock theme={storyTheme} className="h-6 w-48" />
            <ParentSkeletonBlock theme={storyTheme} className="h-3 w-56" />
          </div>
          <div className="w-full sm:max-w-[235px] space-y-2">
            <ParentSkeletonBlock theme={storyTheme} className="h-3 w-20" />
            <ParentSkeletonBlock theme={storyTheme} className="h-10 w-full rounded-[10px]" />
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] flex-1">
          <div className="p-5 md:px-7 md:py-6 lg:border-r" style={{ borderColor }}>
            <div className="flex justify-between mb-6">
              <ParentSkeletonBlock theme={storyTheme} className="h-8 w-8 rounded-[9px]" />
              <ParentSkeletonBlock theme={storyTheme} className="h-4 w-28" />
              <ParentSkeletonBlock theme={storyTheme} className="h-8 w-8 rounded-[9px]" />
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 35 }, (_, i) => (
                <ParentSkeletonBlock
                  key={i}
                  theme={storyTheme}
                  className="h-[43px] w-full rounded-[11px]"
                />
              ))}
            </div>
          </div>
          <div className="hidden lg:block p-5 space-y-2" style={{ backgroundColor: "#FCFDFB" }}>
            <ParentSkeletonBlock theme={storyTheme} className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {Array.from({ length: 8 }, (_, i) => (
                <ParentSkeletonBlock key={i} theme={storyTheme} className="h-9 rounded-[10px]" />
              ))}
            </div>
          </div>
        </div>

        <div
          className="border-t px-6 py-5 flex justify-between items-center gap-4"
          style={{ borderColor, backgroundColor: storyTheme.cream }}
        >
          <ParentSkeletonBlock theme={storyTheme} className="h-10 w-48" />
          <ParentSkeletonBlock theme={storyTheme} className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
