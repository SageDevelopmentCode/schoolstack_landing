"use client";

import {
  dateKey,
  DAY_NAMES,
  getWeekDates,
  isToday,
} from "@/lib/committees/calendar-utils";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationEvent } from "@/lib/school-events/types";
import EventChip from "./EventChip";

const CALENDAR_LINE = "rgba(0, 0, 0, 0.06)";

type WeekGridProps = {
  C: AdminThemeTokens;
  weekAnchor: Date;
  eventsByDate: Map<string, OrganizationEvent[]>;
  selectedDate: string | null;
  selectedEventId: string | null;
  readOnly?: boolean;
  onDayClick?: (date: string) => void;
  onEventClick?: (event: OrganizationEvent) => void;
};

export default function WeekGrid({
  C,
  weekAnchor,
  eventsByDate,
  selectedDate,
  selectedEventId,
  readOnly = false,
  onDayClick,
  onEventClick,
}: WeekGridProps) {
  const weekDates = getWeekDates(weekAnchor);

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[640px] grid-cols-7 gap-px overflow-hidden rounded-2xl shadow-sm"
        style={{ backgroundColor: CALENDAR_LINE }}
      >
        {weekDates.map((day) => {
          const key = dateKey(day);
          const dayEvents = eventsByDate.get(key) ?? [];
          const today = isToday(day);
          const isSelected = selectedDate === key;

          const handleDayClick = () => {
            onDayClick?.(key);
          };

          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={handleDayClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleDayClick();
                }
              }}
              className={`flex min-h-[320px] flex-col p-3 transition-colors sm:min-h-[380px] ${
                onDayClick ? "cursor-pointer hover:bg-black/[0.02]" : ""
              }`}
              style={{
                backgroundColor: isSelected ? C.accentLight : C.surface,
                borderLeft: today ? `3px solid ${C.accent}` : undefined,
              }}
            >
              <div className="mb-3 text-center">
                <p
                  className="text-[10px] font-medium uppercase tracking-wide"
                  style={{ color: C.textTertiary }}
                >
                  {DAY_NAMES[day.getDay()]}
                </p>
                <div className="mt-1 flex justify-center">
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold"
                    style={
                      today
                        ? { backgroundColor: C.accent, color: "#FFFFFF" }
                        : { color: C.textSecondary }
                    }
                  >
                    {day.getDate()}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                {dayEvents.length === 0 ? (
                  <p
                    className="px-1 py-2 text-center text-[11px]"
                    style={{ color: C.textQuaternary }}
                  >
                    {readOnly ? "Nothing scheduled" : "No events"}
                  </p>
                ) : (
                  dayEvents.map((event) => (
                    <div key={event.id}>
                      <EventChip
                        event={event}
                        C={C}
                        selected={selectedEventId === event.id}
                        onClick={() => onEventClick?.(event)}
                      />
                      {event.time && !event.isAllDay ? (
                        <p className="mt-0.5 px-2 text-[10px]" style={{ color: C.textTertiary }}>
                          {event.time}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
