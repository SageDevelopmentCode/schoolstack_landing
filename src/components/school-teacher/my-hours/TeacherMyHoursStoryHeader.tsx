"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import {
  formatCompactNavDate,
} from "@/lib/school-teacher/my-hours/format-duration";
import type { MyHoursView } from "@/lib/school-teacher/my-hours/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const VIEW_ITEMS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
] as const;

type TeacherMyHoursStoryHeaderProps = {
  theme: ParentThemeTokens;
  focusDate: Date;
  view: MyHoursView;
  onViewChange: (view: MyHoursView) => void;
  onPreviousDate: () => void;
  onNextDate: () => void;
};

export default function TeacherMyHoursStoryHeader({
  theme,
  focusDate,
  view,
  onViewChange,
  onPreviousDate,
  onNextDate,
}: TeacherMyHoursStoryHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <ParentDisplayHeading theme={theme}>My Hours</ParentDisplayHeading>
        <p className="mt-1 text-sm" style={{ color: theme.muted }}>
          Clock in and out to track your daily work time.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div
          className="inline-flex w-fit items-center gap-1 rounded-lg border px-1 py-1"
          style={{ borderColor: theme.line, backgroundColor: theme.white }}
        >
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-opacity hover:opacity-70"
            onClick={onPreviousDate}
            aria-label="Previous date"
          >
            <ChevronLeft className="h-4 w-4" style={{ color: theme.ink }} />
          </button>
          <span
            className="min-w-[7.5rem] px-2 text-center text-sm font-semibold tabular-nums"
            style={{ color: theme.ink }}
          >
            {formatCompactNavDate(focusDate)}
          </span>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-opacity hover:opacity-70"
            onClick={onNextDate}
            aria-label="Next date"
          >
            <ChevronRight className="h-4 w-4" style={{ color: theme.ink }} />
          </button>
        </div>

        <ParentStoryPillNav
          theme={theme}
          ariaLabel="Hours view"
          activeKey={view}
          onChange={(key) => onViewChange(key as MyHoursView)}
          data-testid="teacher-my-hours-view-nav"
          items={VIEW_ITEMS.map((item) => ({
            key: item.key,
            label: item.label,
          }))}
        />
      </div>
    </div>
  );
}
