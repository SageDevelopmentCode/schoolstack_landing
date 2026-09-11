import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentSkeletonBlock from "@/components/school-parent/ui/ParentSkeletonBlock";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type SkeletonThemeProps = {
  theme: ParentThemeTokens;
};

function AttentionRowSkeleton({ theme }: SkeletonThemeProps) {
  return (
    <div className="flex items-start gap-3 py-1">
      <ParentSkeletonBlock theme={theme} className="h-[38px] w-[38px] shrink-0 rounded-[13px]" />
      <div className="min-w-0 flex-1 space-y-2">
        <ParentSkeletonBlock theme={theme} className="h-3.5 w-[55%]" />
        <ParentSkeletonBlock theme={theme} className="h-3 w-[80%]" />
      </div>
    </div>
  );
}

export function ParentHomeStartHereSkeleton({ theme }: SkeletonThemeProps) {
  return (
    <div aria-busy="true" aria-label="Loading start here">
      <ParentSkeletonBlock theme={theme} className="mb-4 h-5 w-40" />
      <div className="space-y-3">
        <AttentionRowSkeleton theme={theme} />
        <AttentionRowSkeleton theme={theme} />
        <AttentionRowSkeleton theme={theme} />
      </div>
    </div>
  );
}

function ChildCardSkeleton({ theme }: SkeletonThemeProps) {
  return (
    <ParentCard theme={theme} className="relative flex h-full flex-col !p-6">
      <div className="mb-4 flex items-start gap-3">
        <ParentSkeletonBlock theme={theme} className="h-[88px] w-[88px] shrink-0 rounded-[18px]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <ParentSkeletonBlock theme={theme} className="h-5 w-28" />
            <ParentSkeletonBlock theme={theme} className="h-5 w-20 rounded-full" />
          </div>
          <ParentSkeletonBlock theme={theme} className="h-3 w-full max-w-[180px]" />
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-2 pt-2">
        <ParentSkeletonBlock theme={theme} className="h-10 w-full rounded-lg" />
        <ParentSkeletonBlock theme={theme} className="h-4 w-36" />
      </div>
    </ParentCard>
  );
}

export function ParentHomeChildCardsSkeleton({ theme }: SkeletonThemeProps) {
  return (
    <div
      className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Loading children"
    >
      <ChildCardSkeleton theme={theme} />
      <ChildCardSkeleton theme={theme} />
    </div>
  );
}

function CoopFamilyCardSkeleton({ theme }: SkeletonThemeProps) {
  return (
    <ParentCard theme={theme}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <ParentSkeletonBlock theme={theme} className="h-2.5 w-16" />
          <ParentSkeletonBlock theme={theme} className="h-5 w-36" />
        </div>
        <ParentSkeletonBlock theme={theme} className="h-5 w-20 rounded-full" />
      </div>
      <ul className="mt-4 space-y-2.5">
        {Array.from({ length: 2 }, (_, index) => (
          <li key={index} className="flex items-center gap-2.5">
            <ParentSkeletonBlock theme={theme} className="h-10 w-10 shrink-0 rounded-xl" />
            <ParentSkeletonBlock theme={theme} className="h-3.5 w-full max-w-[160px]" />
          </li>
        ))}
      </ul>
    </ParentCard>
  );
}

export function ParentHomeCoopFamiliesSkeleton({ theme }: SkeletonThemeProps) {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Loading co-op families"
    >
      <CoopFamilyCardSkeleton theme={theme} />
      <CoopFamilyCardSkeleton theme={theme} />
    </div>
  );
}
