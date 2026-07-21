import { DAY_NAMES } from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import SkeletonBlock from "./SkeletonBlock";

export function CalendarGridSkeleton({ C }: { C: AdminThemeTokens }) {
  return (
    <div aria-busy="true" aria-label="Loading calendar">
      <div className="mb-2 grid grid-cols-7">
        {DAY_NAMES.map((day) => (
          <div key={day} className="flex justify-center py-1">
            <SkeletonBlock C={C} className="h-3 w-5" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: 42 }).map((_, index) => (
          <div key={index} className="flex justify-center">
            <SkeletonBlock C={C} className="h-10 w-10 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimeSlotsSkeleton({ C }: { C: AdminThemeTokens }) {
  return (
    <div
      className="flex min-h-[280px] flex-1 flex-col"
      aria-busy="true"
      aria-label="Loading time slots"
    >
      <div className="border-b px-4 py-3" style={{ borderColor: C.border }}>
        <SkeletonBlock C={C} className="h-4 w-40" />
        <SkeletonBlock C={C} className="mt-2 h-3 w-28" />
      </div>

      <div className="flex-1 space-y-3 p-3">
        <div
          className="flex rounded-sm border p-0.5"
          style={{ borderColor: C.border, backgroundColor: C.bg }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} C={C} className="mx-0.5 h-10 flex-1 rounded-sm" />
          ))}
        </div>

        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBlock key={index} C={C} className="h-9 w-full rounded-sm" />
        ))}
      </div>
    </div>
  );
}

type SchoolAdminCalendarSkeletonProps = {
  C: AdminThemeTokens;
  compactLayout?: boolean;
  variant?: "calendar" | "times" | "full";
  label?: string;
};

export default function SchoolAdminCalendarSkeleton({
  C,
  compactLayout = false,
  variant = "full",
  label = "Loading availability",
}: SchoolAdminCalendarSkeletonProps) {
  if (variant === "calendar") {
    return <CalendarGridSkeleton C={C} />;
  }

  if (variant === "times") {
    return <TimeSlotsSkeleton C={C} />;
  }

  return (
    <div
      className={
        compactLayout
          ? "grid w-full gap-4 lg:grid-cols-[3fr_2fr]"
          : "grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]"
      }
      aria-busy="true"
      aria-label={label}
    >
      <div
        className="rounded-sm border p-4"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <div className="mb-4 flex items-center justify-between">
          <SkeletonBlock C={C} className="h-8 w-8 rounded-sm" />
          <SkeletonBlock C={C} className="h-4 w-24" />
          <SkeletonBlock C={C} className="h-8 w-8 rounded-sm" />
        </div>
        <CalendarGridSkeleton C={C} />
      </div>

      <div
        className="flex flex-col rounded-sm border"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <TimeSlotsSkeleton C={C} />
      </div>
    </div>
  );
}
