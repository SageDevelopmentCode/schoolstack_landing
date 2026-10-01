import ParentSkeletonBlock from "@/components/school-parent/ui/ParentSkeletonBlock";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type DemoSchedulerSkeletonProps = {
  storyTheme: ParentThemeTokens;
};

export function DemoSchedulerSkeleton({ storyTheme }: DemoSchedulerSkeletonProps) {
  const borderColor = storyTheme.line;

  return (
    <div
      className="flex flex-col md:flex-row md:min-h-[500px]"
      role="status"
      aria-busy="true"
      aria-label="Loading available times"
    >
      <div
        className="flex md:hidden w-full border-b p-4 flex-col gap-3"
        style={{ borderColor }}
      >
        <ParentSkeletonBlock theme={storyTheme} className="h-3 w-20" />
        <ParentSkeletonBlock theme={storyTheme} className="h-5 w-28" />
        <div className="flex gap-3">
          <ParentSkeletonBlock theme={storyTheme} className="h-4 w-16" />
          <ParentSkeletonBlock theme={storyTheme} className="h-4 w-20" />
        </div>
      </div>

      <div
        className="hidden md:flex w-[140px] flex-shrink-0 border-r p-5 flex-col gap-5"
        style={{ borderColor }}
      >
        <div className="flex flex-col gap-2">
          <ParentSkeletonBlock theme={storyTheme} className="h-3 w-20" />
          <ParentSkeletonBlock theme={storyTheme} className="h-5 w-24" />
        </div>
        <div className="flex flex-col gap-2">
          <ParentSkeletonBlock theme={storyTheme} className="h-3.5 w-14" />
          <ParentSkeletonBlock theme={storyTheme} className="h-3.5 w-20" />
        </div>
        <div className="mt-auto pt-4 border-t" style={{ borderColor }}>
          <ParentSkeletonBlock theme={storyTheme} className="h-3 w-24" />
        </div>
      </div>

      <div className="flex-1 p-4 md:p-5 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <ParentSkeletonBlock theme={storyTheme} className="h-8 w-8 rounded-lg" />
          <ParentSkeletonBlock theme={storyTheme} className="h-4 w-28" />
          <ParentSkeletonBlock theme={storyTheme} className="h-8 w-8 rounded-lg" />
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 35 }, (_, i) => (
            <ParentSkeletonBlock
              key={i}
              theme={storyTheme}
              className="aspect-square w-full rounded-lg"
            />
          ))}
        </div>
      </div>

      <div
        className="hidden md:flex w-[158px] flex-shrink-0 border-l p-4 flex-col gap-2"
        style={{ borderColor }}
      >
        <ParentSkeletonBlock theme={storyTheme} className="h-3 w-24 mb-1" />
        <ParentSkeletonBlock theme={storyTheme} className="h-3.5 w-32 mb-3" />
        {Array.from({ length: 8 }, (_, i) => (
          <ParentSkeletonBlock key={i} theme={storyTheme} className="h-9 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
