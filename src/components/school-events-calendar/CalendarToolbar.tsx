"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

export type CalendarViewMode = "month" | "week";

type CalendarToolbarProps = {
  C: AdminThemeTokens;
  view: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  periodLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  toolbarExtra?: ReactNode;
  compact?: boolean;
};

export default function CalendarToolbar({
  C,
  view,
  onViewChange,
  periodLabel,
  onPrev,
  onNext,
  onToday,
  toolbarExtra,
  compact = false,
}: CalendarToolbarProps) {
  const segmentButtonStyle = (active: boolean) => ({
    backgroundColor: active ? C.surface : "transparent",
    color: active ? C.textPrimary : C.textTertiary,
    boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : undefined,
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onPrev}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            style={{ color: C.textSecondary }}
            aria-label="Previous period"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            style={{ color: C.textSecondary }}
            aria-label="Next period"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <h3
          className={`min-w-0 font-semibold ${compact ? "text-sm sm:min-w-[140px]" : "text-base sm:min-w-[200px]"}`}
          style={{ color: C.textPrimary }}
        >
          {periodLabel}
        </h3>

        <button
          type="button"
          onClick={onToday}
          className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
          style={getAdminButtonStyle(C, "secondary")}
        >
          Today
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex items-center gap-0.5 rounded-lg p-1"
          style={{ backgroundColor: C.accentLight }}
        >
          <button
            type="button"
            onClick={() => onViewChange("month")}
            className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
            style={segmentButtonStyle(view === "month")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Month
          </button>
          <button
            type="button"
            onClick={() => onViewChange("week")}
            className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
            style={segmentButtonStyle(view === "week")}
          >
            Week
          </button>
        </div>
        {toolbarExtra}
      </div>
    </div>
  );
}
