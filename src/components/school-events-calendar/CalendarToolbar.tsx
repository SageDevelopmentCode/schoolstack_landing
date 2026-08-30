"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

export type CalendarViewMode = "month" | "week";
export type CalendarToolbarVariant = "default" | "parent-story";

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
  variant?: CalendarToolbarVariant;
  theme?: ParentThemeTokens;
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
  variant = "default",
  theme,
}: CalendarToolbarProps) {
  const isStory = variant === "parent-story" && theme != null;

  const segmentButtonStyle = (active: boolean) => {
    if (isStory) {
      return {
        backgroundColor: active ? theme.white : "transparent",
        color: active ? theme.primary : theme.muted,
        boxShadow: active ? theme.shadowPill : undefined,
      };
    }
    return {
      backgroundColor: active ? C.surface : "transparent",
      color: active ? C.textPrimary : C.textTertiary,
      boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : undefined,
    };
  };

  const navButtonColor = isStory ? theme.muted : C.textSecondary;
  const periodColor = isStory ? theme.ink : C.textPrimary;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onPrev}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            style={{ color: navButtonColor }}
            aria-label="Previous period"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            style={{ color: navButtonColor }}
            aria-label="Next period"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <h3
          className={`min-w-0 font-semibold ${compact ? "text-sm sm:min-w-[140px]" : "text-base sm:min-w-[200px]"}`}
          style={{
            color: periodColor,
            fontFamily: isStory ? theme.fontDisplay : undefined,
          }}
        >
          {periodLabel}
        </h3>

        <button
          type="button"
          onClick={onToday}
          className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
          style={
            isStory
              ? {
                  backgroundColor: theme.primarySoft,
                  color: theme.primary,
                  border: `1px solid ${theme.line}`,
                }
              : getAdminButtonStyle(C, "secondary")
          }
        >
          Today
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex items-center gap-0.5 rounded-lg p-1"
          style={{
            backgroundColor: isStory ? theme.primarySoft : C.accentLight,
          }}
        >
          <button
            type="button"
            onClick={() => onViewChange("week")}
            className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
            style={segmentButtonStyle(view === "week")}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => onViewChange("month")}
            className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
            style={segmentButtonStyle(view === "month")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Month
          </button>
        </div>
        {toolbarExtra}
      </div>
    </div>
  );
}
