"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdmissionsDateTimePickerSkeleton from "@/components/admissions/AdmissionsDateTimePickerSkeleton";
import AdmissionsTimePeriodTabBar from "@/components/admissions/AdmissionsTimePeriodTabBar";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import {
  ADMISSIONS_TIME_SLOT_GROUPS,
  pickFirstBookableSlotForDay,
  type AdmissionsTimeSlotPeriod,
  todayKeyInTimezone,
  todayMonthYearInTimezone,
} from "@/lib/admissions/admissions-availability";
import { formatSelectedDate, MONTH_NAMES } from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { reportApplyOperationalError } from "@/lib/operational-errors-client";

type AdmissionsDateTimePickerProps = {
  C: AdminThemeTokens;
  organizationId?: string;
  applicationId?: string;
  actionId?: string;
  availabilityEndpointBuilder?: (start: string, end: string) => string;
  timezone: string;
  timezoneLabel: string;
  selectedDate: string | null;
  selectedTime: string | null;
  onDateChange: (date: string | null) => void;
  onTimeChange: (time: string | null) => void;
  onTimezoneLoaded?: (timezone: string) => void;
  showGroupTourBadges?: boolean;
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
  organizationId,
  applicationId,
  actionId,
  availabilityEndpointBuilder,
  timezone,
  timezoneLabel,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  onTimezoneLoaded,
  showGroupTourBadges = false,
}: AdmissionsDateTimePickerProps) {
  const initial = todayMonthYearInTimezone(timezone);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [availabilitySlots, setAvailabilitySlots] = useState<Record<string, string[]>>(
    {},
  );
  const [slotMeta, setSlotMeta] = useState<
    Record<string, { isGroupTour?: boolean; remaining?: number | null }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<AdmissionsTimeSlotPeriod>("morning");

  const availabilityEndpointBuilderRef = useRef(availabilityEndpointBuilder);
  const onTimezoneLoadedRef = useRef(onTimezoneLoaded);

  useEffect(() => {
    availabilityEndpointBuilderRef.current = availabilityEndpointBuilder;
    onTimezoneLoadedRef.current = onTimezoneLoaded;
  }, [availabilityEndpointBuilder, onTimezoneLoaded]);

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
      start,
      end,
    });
    if (actionId) {
      params.set("actionId", actionId);
    }

    const buildEndpoint = availabilityEndpointBuilderRef.current;
    const endpoint = buildEndpoint
      ? buildEndpoint(start, end)
      : `/api/admissions/applications/${applicationId}/post-submit/availability?${params.toString()}`;

    let responseStatus: number | undefined;
    try {
      const response = await fetch(endpoint);
      responseStatus = response.status;
      const payload = (await response.json()) as {
        mode?: string;
        availability?: Record<string, string[]>;
        slotMeta?: Record<
          string,
          { isGroupTour?: boolean; remaining?: number | null }
        >;
        timezone?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load availability.");
      }

      if (typeof payload.timezone === "string" && payload.timezone.trim()) {
        onTimezoneLoadedRef.current?.(payload.timezone.trim());
      }

      if (payload.mode === "whole_day") {
        setAvailabilitySlots({});
        setSlotMeta({});
      } else {
        setAvailabilitySlots(payload.availability ?? {});
        setSlotMeta(payload.slotMeta ?? {});
      }
    } catch (err) {
      reportApplyOperationalError(organizationId, "admissions.availability.load", err, {
        responseStatus,
        entityType: applicationId ? "application" : undefined,
        entityId: applicationId,
      });
      setAvailabilitySlots({});
      setSlotMeta({});
      setError(err instanceof Error ? err.message : "Failed to load availability.");
    } finally {
      setLoading(false);
    }
  }, [actionId, applicationId, organizationId, viewMonth, viewYear]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadAvailability();
    });
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
    const daySlots = availabilitySlots[date] ?? [];
    const first = pickFirstBookableSlotForDay(daySlots);
    if (first) {
      setActivePeriod(first.period);
      onTimeChange(first.slot);
    } else {
      onTimeChange(null);
      setActivePeriod("morning");
    }
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
      <p className="break-words text-xs" style={{ color: C.textTertiary }}>
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
        className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,240px)]"
        style={{ borderColor: C.border }}
      >
        <div
          className="min-w-0 rounded-sm border p-3 sm:p-4"
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
          className="flex min-h-[280px] w-full min-w-0 flex-col rounded-sm border"
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
                    <AdmissionsTimePeriodTabBar
                      C={C}
                      activePeriod={activePeriod}
                      onPeriodChange={setActivePeriod}
                      openCountForPeriod={(period) => {
                        const group = ADMISSIONS_TIME_SLOT_GROUPS.find(
                          (entry) => entry.id === period,
                        );
                        if (!group) return 0;
                        return group.slots.filter((slot) =>
                          selectedTimeSlots.includes(slot),
                        ).length;
                      }}
                      openCountLabel={(count) => String(count)}
                    />

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
                          const metaKey =
                            selectedDate != null ? `${selectedDate}|${slot}` : "";
                          const meta = metaKey ? slotMeta[metaKey] : undefined;
                          const groupLabel =
                            showGroupTourBadges && meta?.isGroupTour
                              ? meta.remaining != null
                                ? ` · Group · ${meta.remaining} left`
                                : " · Group tour"
                              : "";
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => onTimeChange(isSelected ? null : slot)}
                              className="min-h-9 rounded-sm border px-2 py-1.5 text-xs font-medium transition-colors"
                              style={{
                                borderColor: isSelected ? C.accent : C.border,
                                backgroundColor: isSelected ? C.accentLight : C.bg,
                                color: isSelected ? C.accent : C.textSecondary,
                              }}
                            >
                              {slot}
                              {groupLabel}
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
