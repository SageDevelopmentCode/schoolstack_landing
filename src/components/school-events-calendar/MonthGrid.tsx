"use client";

import {
  dateKey,
  DAY_NAMES,
  getExtendedMonthGrid,
  isToday,
} from "@/lib/committees/calendar-utils";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationEvent } from "@/lib/school-events/types";
import EventChip from "./EventChip";

const CALENDAR_LINE = "rgba(0, 0, 0, 0.06)";

function DayNumber({
  day,
  C,
  muted,
}: {
  day: Date;
  C: AdminThemeTokens;
  muted?: boolean;
}) {
  const today = isToday(day);

  return (
    <div className="mb-1.5 flex justify-end">
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold"
        style={
          today
            ? { backgroundColor: C.accent, color: "#FFFFFF" }
            : {
                color: muted ? C.textQuaternary : C.textSecondary,
              }
        }
      >
        {day.getDate()}
      </span>
    </div>
  );
}

type MonthGridProps = {
  C: AdminThemeTokens;
  year: number;
  month: number;
  eventsByDate: Map<string, OrganizationEvent[]>;
  selectedDate: string | null;
  selectedEventId: string | null;
  compact?: boolean;
  onDayClick?: (date: string) => void;
  onEventClick?: (event: OrganizationEvent) => void;
};

export default function MonthGrid({
  C,
  year,
  month,
  eventsByDate,
  selectedDate,
  selectedEventId,
  compact = false,
  onDayClick,
  onEventClick,
}: MonthGridProps) {
  const cells = getExtendedMonthGrid(year, month);
  const minHeight = compact ? "min-h-[72px] sm:min-h-[88px]" : "min-h-[100px]";

  return (
    <div
      className="overflow-hidden rounded-2xl shadow-sm"
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${CALENDAR_LINE}`,
        boxShadow: compact ? C.shadowCard : undefined,
      }}
    >
      <div className="grid grid-cols-7 border-b" style={{ borderColor: CALENDAR_LINE }}>
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="py-2.5 text-center text-xs font-medium tracking-wide sm:py-3"
            style={{ color: C.textTertiary }}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          const key = dateKey(cell.date);
          const dayEvents = eventsByDate.get(key) ?? [];
          const isSelected = selectedDate === key;
          const col = idx % 7;
          const row = Math.floor(idx / 7);
          const isLastCol = col === 6;
          const isLastRow = row === 5;
          const cellBorder = {
            borderRight: isLastCol ? undefined : `1px solid ${CALENDAR_LINE}`,
            borderBottom: isLastRow ? undefined : `1px solid ${CALENDAR_LINE}`,
          };

          const handleDayClick = () => {
            onDayClick?.(key);
          };

          return (
            <div
              key={key}
              role={onDayClick ? "button" : undefined}
              tabIndex={onDayClick ? 0 : undefined}
              onClick={onDayClick ? handleDayClick : undefined}
              onKeyDown={
                onDayClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleDayClick();
                      }
                    }
                  : undefined
              }
              className={`flex ${minHeight} flex-col p-2 transition-colors sm:p-3 ${
                onDayClick ? "cursor-pointer hover:bg-black/[0.02]" : ""
              }`}
              style={{
                backgroundColor: isSelected ? C.accentLight : C.surface,
                opacity: cell.inCurrentMonth ? 1 : 0.45,
                ...cellBorder,
              }}
            >
              <DayNumber day={cell.date} C={C} muted={!cell.inCurrentMonth} />
              <div className="flex min-h-0 flex-1 flex-col gap-0.5 sm:gap-1">
                {dayEvents.slice(0, compact ? 2 : 3).map((event) => (
                  <EventChip
                    key={event.id}
                    event={event}
                    C={C}
                    selected={selectedEventId === event.id}
                    compact={compact}
                    onClick={() => onEventClick?.(event)}
                  />
                ))}
                {dayEvents.length > (compact ? 2 : 3) ? (
                  <span className="px-1.5 text-[10px] sm:text-[11px]" style={{ color: C.textTertiary }}>
                    +{dayEvents.length - (compact ? 2 : 3)} more
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
