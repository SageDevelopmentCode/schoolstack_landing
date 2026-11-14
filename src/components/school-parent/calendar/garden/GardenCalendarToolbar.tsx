"use client";

import { CalendarDays, ChevronLeft, ChevronRight, LayoutGrid, Loader2, Undo2 } from "lucide-react";
import type { CalendarViewMode } from "@/components/school-events-calendar/CalendarToolbar";
import { GKicker, GTabBar, G_FOCUS, gBtnOutlineSm } from "@/components/school-parent/garden/ui";

const NAV_BTN = `flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/50 active:translate-y-0 ${G_FOCUS}`;

/**
 * Calendar card header: ‹ › + the period as the card's h2, a Today / Back to
 * today button, the Week | Month tab bar and a live "Loading events…" status.
 */
export default function GardenCalendarToolbar({
  view,
  periodLabel,
  isCurrentPeriod,
  loading,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  headingId,
  summary,
}: {
  view: CalendarViewMode;
  periodLabel: string;
  isCurrentPeriod: boolean;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarViewMode) => void;
  headingId: string;
  /** Live one-liner under the period, e.g. "2 events this week · tap a day or event for details." */
  summary?: string;
}) {
  const unit = view === "month" ? "month" : "week";
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onPrev}
            className={NAV_BTN}
            aria-label={`Previous ${unit}`}
            data-testid="parent-calendar-prev"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className={NAV_BTN}
            aria-label={`Next ${unit}`}
            data-testid="parent-calendar-next"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-w-0">
          <GKicker>{isCurrentPeriod ? `This ${unit}` : view === "month" ? "Month" : "Week of"}</GKicker>
          <div className="flex min-w-0 items-center gap-2">
            <h2
              id={headingId}
              aria-live="polite"
              className="sf-display m-0 mt-0.5 text-[1.25rem] leading-[1.1] text-[var(--sf-ink)] sm:truncate sm:text-[1.4rem]"
            >
              {periodLabel}
            </h2>
            <span
              role="status"
              className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--sf-accent-wash)] px-2 py-0.5 text-[11px] font-extrabold text-[var(--sf-clay-deep)] transition-opacity duration-200 ${
                loading ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  Loading events…
                </>
              ) : null}
            </span>
          </div>
          {summary ? (
            <p aria-live="polite" className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)] sm:truncate">
              {summary}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onToday}
          data-testid="parent-calendar-today"
          className={`${gBtnOutlineSm} !py-2 ${
            isCurrentPeriod ? "" : "!border-[var(--sf-clay)] !bg-[var(--sf-accent-wash)] !text-[var(--sf-clay-deep)]"
          }`}
        >
          {isCurrentPeriod ? (
            <>
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Today
            </>
          ) : (
            <>
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              Back to today
            </>
          )}
        </button>
        <GTabBar
          ariaLabel="Calendar view"
          activeKey={view}
          onChange={(key) => onViewChange(key as CalendarViewMode)}
          data-testid="parent-calendar-view-tabs"
          items={[
            { key: "week", label: "Week", testId: "parent-calendar-view-week" },
            {
              key: "month",
              label: "Month",
              icon: <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />,
              testId: "parent-calendar-view-month",
            },
          ]}
        />
      </div>
    </div>
  );
}
