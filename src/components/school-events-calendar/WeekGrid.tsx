"use client";

import { useMemo } from "react";
import {
  dateKey,
  DAY_NAMES,
  getWeekDates,
  isToday,
} from "@/lib/committees/calendar-utils";
import {
  formatEventTimeRange,
  formatHourLabel,
  getCurrentTimeTop,
  getEventTimeRange,
  HOUR_HEIGHT_PX,
  minutesToHeight,
  minutesToTop,
  WEEK_END_HOUR,
  WEEK_GRID_TOTAL_HEIGHT,
  WEEK_START_HOUR,
} from "@/lib/school-events/calendar-time";
import { getEventDisplayStyle } from "@/lib/school-events/event-labels";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationEvent } from "@/lib/school-events/types";

const CALENDAR_LINE = "rgba(0, 0, 0, 0.06)";
const GUTTER_WIDTH = 52;

type WeekGridProps = {
  C: AdminThemeTokens;
  weekAnchor: Date;
  eventsByDate: Map<string, OrganizationEvent[]>;
  selectedDate: string | null;
  selectedEventId: string | null;
  onDayClick?: (date: string) => void;
  onEventClick?: (event: OrganizationEvent) => void;
};

function TimedEventBlock({
  event,
  C,
  selected,
  onClick,
}: {
  event: OrganizationEvent;
  C: AdminThemeTokens;
  selected: boolean;
  onClick: () => void;
}) {
  const range = getEventTimeRange(event);
  if (!range) return null;

  const top = minutesToTop(range.startMinutes);
  const height = Math.max(minutesToHeight(range.startMinutes, range.endMinutes), 22);
  const colors = getEventDisplayStyle(event);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute left-0.5 right-0.5 overflow-hidden rounded text-left transition-opacity hover:opacity-90"
      style={{
        top,
        height,
        backgroundColor: colors.bg,
        borderLeft: `3px solid ${colors.text}`,
        outline: selected ? `1px solid ${C.accent}` : undefined,
        zIndex: 5,
      }}
    >
      <div className="px-1.5 py-0.5">
        <p className="truncate text-[10px] font-semibold leading-tight" style={{ color: colors.text }}>
          {event.title}
        </p>
        <p className="truncate text-[9px] opacity-80" style={{ color: colors.text }}>
          {formatEventTimeRange(event)}
        </p>
      </div>
    </button>
  );
}

export default function WeekGrid({
  C,
  weekAnchor,
  eventsByDate,
  selectedDate,
  selectedEventId,
  onDayClick,
  onEventClick,
}: WeekGridProps) {
  const weekDates = getWeekDates(weekAnchor);
  const hasToday = weekDates.some((d) => isToday(d));
  const nowTop = hasToday ? getCurrentTimeTop() : -1;

  const allDayByDate = useMemo(() => {
    const map = new Map<string, OrganizationEvent[]>();
    for (const day of weekDates) {
      const key = dateKey(day);
      const events = (eventsByDate.get(key) ?? []).filter((e) => e.isAllDay);
      if (events.length > 0) map.set(key, events);
    }
    return map;
  }, [eventsByDate, weekDates]);

  const hasAnyAllDay = allDayByDate.size > 0;
  const hourCount = WEEK_END_HOUR - WEEK_START_HOUR;

  return (
    <div
      className="overflow-hidden rounded-2xl shadow-sm"
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${CALENDAR_LINE}`,
      }}
    >
      <div className="overflow-x-auto">
        <div style={{ minWidth: 720 }}>
          {/* Day headers */}
          <div
            className="grid border-b"
            style={{
              gridTemplateColumns: `${GUTTER_WIDTH}px repeat(7, 1fr)`,
              borderColor: CALENDAR_LINE,
            }}
          >
            <div />
            {weekDates.map((day) => {
              const key = dateKey(day);
              const today = isToday(day);
              const isSelected = selectedDate === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onDayClick?.(key)}
                  className="cursor-pointer py-3 text-center transition-colors hover:bg-black/[0.02]"
                  style={{
                    backgroundColor: isSelected ? C.accentLight : undefined,
                    borderLeft: `1px solid ${CALENDAR_LINE}`,
                  }}
                >
                  <p
                    className="text-[10px] font-medium uppercase tracking-wide"
                    style={{ color: C.textTertiary }}
                  >
                    {DAY_NAMES[day.getDay()]}
                  </p>
                  <div className="mt-1 flex justify-center">
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
                      style={
                        today
                          ? { backgroundColor: C.accent, color: "#FFFFFF" }
                          : { color: C.textSecondary }
                      }
                    >
                      {day.getDate()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* All-day strip */}
          {hasAnyAllDay ? (
            <div
              className="grid border-b"
              style={{
                gridTemplateColumns: `${GUTTER_WIDTH}px repeat(7, 1fr)`,
                borderColor: CALENDAR_LINE,
              }}
            >
              <div
                className="flex items-center justify-end pr-2"
                style={{ borderRight: `1px solid ${CALENDAR_LINE}`, minHeight: 32 }}
              >
                <span
                  className="text-[9px] font-semibold uppercase tracking-widest"
                  style={{ color: C.textQuaternary }}
                >
                  All day
                </span>
              </div>
              {weekDates.map((day) => {
                const key = dateKey(day);
                const allDayEvents = allDayByDate.get(key) ?? [];
                const today = isToday(day);
                return (
                  <div
                    key={key}
                    className="flex flex-col gap-0.5 p-1"
                    style={{
                      borderLeft: `1px solid ${CALENDAR_LINE}`,
                      backgroundColor: today ? `${C.accent}08` : undefined,
                      minHeight: 32,
                    }}
                  >
                    {allDayEvents.map((event) => {
                      const colors = getEventDisplayStyle(event);
                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => onEventClick?.(event)}
                          className="w-full cursor-pointer truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium hover:brightness-95"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            borderLeft: `2px solid ${colors.text}`,
                          }}
                        >
                          {event.title}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Time grid */}
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `${GUTTER_WIDTH}px repeat(7, 1fr)`,
              height: WEEK_GRID_TOTAL_HEIGHT,
            }}
          >
              {/* Hour labels */}
              <div
                className="relative"
                style={{ borderRight: `1px solid ${CALENDAR_LINE}` }}
              >
                {Array.from({ length: hourCount }, (_, i) => {
                  const hour = WEEK_START_HOUR + i;
                  return (
                    <div
                      key={hour}
                      className="flex items-start justify-end pr-2 pt-0.5"
                      style={{ height: HOUR_HEIGHT_PX }}
                    >
                      <span className="text-[10px] font-medium" style={{ color: C.textQuaternary }}>
                        {formatHourLabel(hour)}
                      </span>
                    </div>
                  );
                })}
                {/* Now dot in gutter */}
                {nowTop >= 0 ? (
                  <div
                    className="absolute right-0 z-20"
                    style={{
                      top: nowTop - 4,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                      transform: "translateX(50%)",
                    }}
                  />
                ) : null}
              </div>

              {/* Day columns */}
              {weekDates.map((day, colIdx) => {
                const key = dateKey(day);
                const timedEvents = (eventsByDate.get(key) ?? []).filter((e) => !e.isAllDay);
                const today = isToday(day);

                return (
                  <div
                    key={key}
                    className="relative"
                    role="button"
                    tabIndex={0}
                    onClick={() => onDayClick?.(key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onDayClick?.(key);
                      }
                    }}
                    style={{
                      borderLeft: `1px solid ${CALENDAR_LINE}`,
                      backgroundColor: today ? `${C.accent}06` : undefined,
                      cursor: onDayClick ? "pointer" : undefined,
                    }}
                  >
                    {/* Hour lines */}
                    {Array.from({ length: hourCount }, (_, i) => (
                      <div
                        key={i}
                        className="pointer-events-none absolute left-0 right-0"
                        style={{
                          top: i * HOUR_HEIGHT_PX,
                          borderTop: `1px solid ${CALENDAR_LINE}`,
                        }}
                      />
                    ))}
                    {/* Half-hour lines */}
                    {Array.from({ length: hourCount }, (_, i) => (
                      <div
                        key={`half-${i}`}
                        className="pointer-events-none absolute left-0 right-0 opacity-40"
                        style={{
                          top: i * HOUR_HEIGHT_PX + HOUR_HEIGHT_PX / 2,
                          borderTop: `1px dashed ${CALENDAR_LINE}`,
                        }}
                      />
                    ))}

                    {/* Timed events */}
                    {timedEvents.map((event) => (
                      <TimedEventBlock
                        key={event.id}
                        event={event}
                        C={C}
                        selected={selectedEventId === event.id}
                        onClick={() => onEventClick?.(event)}
                      />
                    ))}
                  </div>
                );
              })}

              {/* Current time line spanning all day columns */}
              {nowTop >= 0 ? (
                <div
                  className="pointer-events-none absolute z-10"
                  style={{
                    top: nowTop,
                    left: GUTTER_WIDTH,
                    right: 0,
                    height: 2,
                    backgroundColor: "#ef4444",
                  }}
                />
              ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
