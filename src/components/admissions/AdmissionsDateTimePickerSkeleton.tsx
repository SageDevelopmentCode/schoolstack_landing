import { DAY_NAMES } from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type AdmissionsDateTimePickerSkeletonProps = {
  C: AdminThemeTokens;
  variant?: "calendar" | "times" | "full";
};

function SkeletonBar({
  C,
  className = "",
}: {
  C: AdminThemeTokens;
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ backgroundColor: C.elevated }}
      aria-hidden
    />
  );
}

function CalendarSkeleton({ C }: { C: AdminThemeTokens }) {
  return (
    <div aria-busy="true" aria-label="Loading available dates">
      <div className="mb-2 grid grid-cols-7">
        {DAY_NAMES.map((day) => (
          <div key={day} className="flex justify-center py-1">
            <SkeletonBar C={C} className="h-3 w-5" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: 42 }).map((_, index) => (
          <div key={index} className="flex justify-center">
            <SkeletonBar C={C} className="h-10 w-10 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TimesSkeleton({ C }: { C: AdminThemeTokens }) {
  return (
    <div
      className="flex min-h-[280px] flex-1 flex-col"
      aria-busy="true"
      aria-label="Loading available times"
    >
      <div className="border-b px-4 py-3" style={{ borderColor: C.border }}>
        <SkeletonBar C={C} className="h-4 w-40" />
        <SkeletonBar C={C} className="mt-2 h-3 w-28" />
      </div>

      <div className="flex-1 space-y-3 p-3">
        <div
          className="flex rounded-sm border p-0.5"
          style={{ borderColor: C.border, backgroundColor: C.bg }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBar key={index} C={C} className="mx-0.5 h-10 flex-1 rounded-sm" />
          ))}
        </div>

        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBar key={index} C={C} className="h-9 w-full rounded-sm" />
        ))}
      </div>
    </div>
  );
}

export default function AdmissionsDateTimePickerSkeleton({
  C,
  variant = "full",
}: AdmissionsDateTimePickerSkeletonProps) {
  if (variant === "calendar") {
    return <CalendarSkeleton C={C} />;
  }

  if (variant === "times") {
    return <TimesSkeleton C={C} />;
  }

  return (
    <div
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]"
      aria-busy="true"
      aria-label="Loading available dates"
    >
      <div
        className="rounded-sm border p-4"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <div className="mb-4 flex items-center justify-between">
          <SkeletonBar C={C} className="h-8 w-8 rounded-sm" />
          <SkeletonBar C={C} className="h-4 w-24" />
          <SkeletonBar C={C} className="h-8 w-8 rounded-sm" />
        </div>
        <CalendarSkeleton C={C} />
      </div>

      <div
        className="flex flex-col rounded-sm border"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <TimesSkeleton C={C} />
      </div>
    </div>
  );
}
