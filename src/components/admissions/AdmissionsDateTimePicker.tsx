"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdmissionsDateTimePickerSkeleton from "@/components/admissions/AdmissionsDateTimePickerSkeleton";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import {
  ADMISSIONS_TIME_SLOT_GROUPS,
  type AdmissionsTimeSlotPeriod,
  todayKeyInTimezone,
  todayMonthYearInTimezone,
} from "@/lib/admissions/admissions-availability";
import { formatSelectedDate, MONTH_NAMES } from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type AdmissionsDateTimePickerProps = {
  C: AdminThemeTokens;
  applicationId: string;
  actionId: string;
  timezone: string;
  timezoneLabel: string;
  selectedDate: string | null;
  selectedTime: string | null;
  onDateChange: (date: string | null) => void;
  onTimeChange: (time: string | null) => void;
};

function monthDateRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDay = new Date(endYear, endMonth + 1, 0).getDate();
  const end = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
  return { start, end };
}

export default function AdmissionsDateTimePicker({
  C,
  applicationId,
  actionId,
  timezone,
  timezoneLabel,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: AdmissionsDateTimePickerProps) {
  const initial = todayMonthYearInTimezone(timezone);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [availabilitySlots, setAvailabilitySlots] = useState<Record<string, string[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<AdmissionsTimeSlotPeriod>("morning");

  const today = todayKeyInTimezone(timezone);
  const availableDates = useMemo(
    () => new Set(Object.keys(availabilitySlots)),
    [availabilitySlots],
  );

  const calendarColors = useMemo(
    () => ({
      accent: C.accent,
      accentLight: C.accentLight,
      text: C.textPrimary,
      textFaint: C.textTertiary,
    }),
    [C.accent, C.accentLight, C.textPrimary, C.textTertiary],
  );

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { start, end } = monthDateRange(viewYear, viewMonth);
    const params = new URLSearchParams({
      actionId,
      start,
      end,
    });

    try {
      const response = await fetch(
        `/api/admissions/applications/${applicationId}/post-submit/availability?${params.toString()}`,
      );
      const payload = (await response.json()) as {
        availability?: Record<string, string[]>;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load availability.");
      }

      setAvailabilitySlots(payload.availability ?? {});
    } catch (err) {
      setAvailabilitySlots({});
      setError(err instanceof Error ? err.message : "Failed to load availability.");
    } finally {
      setLoading(false);
    }
  }, [actionId, applicationId, viewMonth, viewYear]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  const selectedTimeSlots = selectedDate ? availabilitySlots[selectedDate] ?? [] : [];
  const activePeriodGroup =
    ADMISSIONS_TIME_SLOT_GROUPS.find((group) => group.id === activePeriod) ??
    ADMISSIONS_TIME_SLOT_GROUPS[0];
  const visibleTimeSlots = activePeriodGroup.slots.filter((slot) =>
    selectedTimeSlots.includes(slot),
  );

  function handleDateSelect(date: string) {
    onDateChange(date);
    onTimeChange(null);
    setActivePeriod("morning");
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
    onDateChange(null);
    onTimeChange(null);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
    onDateChange(null);
    onTimeChange(null);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: C.textTertiary }}>
        Times are in {timezoneLabel}.
      </p>

      {error ? (
        <p
          className="rounded-sm px-3 py-2 text-xs"
          style={{ backgroundColor: C.errorBg, color: C.error }}
        >
          {error}
        </p>
      ) : null}

      <div
        className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]"
        style={{ borderColor: C.border }}
      >
        <div
          className="rounded-sm border p-4"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-sm transition-colors"
              style={{ color: C.textSecondary }}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium" style={{ color: C.textPrimary }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-sm transition-colors"
              style={{ color: C.textSecondary }}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <AdmissionsDateTimePickerSkeleton C={C} variant="calendar" />
          ) : (
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              selected={selectedDate}
              onSelect={handleDateSelect}
              availableDates={availableDates}
              minDate={today}
              colors={calendarColors}
            />
          )}
        </div>

        <div
          className="flex min-h-[280px] flex-col rounded-sm border"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          {loading ? (
            <AdmissionsDateTimePickerSkeleton C={C} variant="times" />
          ) : (
            <>
              <div className="border-b px-4 py-3" style={{ borderColor: C.border }}>
                {selectedDate ? (
                  <>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: C.textQuaternary }}
                    >
                      Time slots
                    </p>
                    <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                      {formatSelectedDate(selectedDate)}
                    </p>
                    <p className="mt-0.5 text-[11px]" style={{ color: C.textTertiary }}>
                      {timezoneLabel}
                    </p>
                  </>
                ) : (
                  <p className="text-sm" style={{ color: C.textTertiary }}>
                    Select a date with open times
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {!selectedDate ? (
                  <p className="py-6 text-center text-xs" style={{ color: C.textTertiary }}>
                    Click a highlighted date
                  </p>
                ) : selectedTimeSlots.length === 0 ? (
                  <p className="py-6 text-center text-xs" style={{ color: C.textTertiary }}>
                    No times available for this date.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div
                      className="flex rounded-sm border p-0.5"
                      style={{ borderColor: C.border, backgroundColor: C.bg }}
                      role="tablist"
                      aria-label="Time of day"
                    >
                      {ADMISSIONS_TIME_SLOT_GROUPS.map((group) => {
                        const isActive = activePeriod === group.id;
                        const openCount = group.slots.filter((slot) =>
                          selectedTimeSlots.includes(slot),
                        ).length;

                        return (
                          <button
                            key={group.id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setActivePeriod(group.id)}
                            className="flex flex-1 flex-col items-center rounded-sm px-1 py-1.5 text-[10px] font-medium transition-colors"
                            style={{
                              backgroundColor: isActive ? C.surface : "transparent",
                              color: isActive ? C.accent : C.textTertiary,
                              boxShadow: isActive ? `0 0 0 1px ${C.border}` : "none",
                            }}
                          >
                            <span>{group.label}</span>
                            {openCount > 0 ? (
                              <span
                                className="text-[9px] font-normal"
                                style={{ color: C.textQuaternary }}
                              >
                                {openCount}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-col gap-2">
                      {visibleTimeSlots.length === 0 ? (
                        <p
                          className="py-4 text-center text-xs"
                          style={{ color: C.textTertiary }}
                        >
                          No times in this period.
                        </p>
                      ) : (
                        visibleTimeSlots.map((slot) => {
                          const isSelected = selectedTime === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => onTimeChange(isSelected ? null : slot)}
                              className="h-9 rounded-sm border text-xs font-medium transition-colors"
                              style={{
                                borderColor: isSelected ? C.accent : C.border,
                                backgroundColor: isSelected ? C.accentLight : C.bg,
                                color: isSelected ? C.accent : C.textSecondary,
                              }}
                            >
                              {slot}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
