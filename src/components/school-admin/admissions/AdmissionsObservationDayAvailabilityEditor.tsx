"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SchoolAdminCalendarSkeleton } from "@/components/school-admin/skeletons";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import {
  countObservationDaysInMonth,
  listObservationDayAvailability,
  listOccupiedObservationDays,
  toggleObservationDay,
} from "@/lib/admissions/admissions-observation-availability";
import {
  formatDateOnlyLabel,
  formatOrganizationTimezoneLabel,
  getOrganizationTimezone,
  todayKeyInTimezone,
  todayMonthYearInTimezone,
} from "@/lib/admissions/admissions-availability";
import { MONTH_NAMES } from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { createClient } from "@/utils/supabase/client";

type AdmissionsObservationDayAvailabilityEditorProps = {
  C: AdminThemeTokens;
  organizationId: string;
  readOnly?: boolean;
  timezone?: string;
  compactLayout?: boolean;
  onMonthDayCountChange?: (count: number) => void;
};

export default function AdmissionsObservationDayAvailabilityEditor({
  C,
  organizationId,
  readOnly = false,
  timezone: timezoneProp,
  compactLayout = false,
  onMonthDayCountChange,
}: AdmissionsObservationDayAvailabilityEditorProps) {
  const supabase = useMemo(() => createClient(), []);
  const [timezone, setTimezone] = useState(timezoneProp ?? "America/Chicago");
  const initial = todayMonthYearInTimezone(timezone);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());
  const [bookedDays, setBookedDays] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingDate, setTogglingDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = todayKeyInTimezone(timezone);
  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);
  const onMonthDayCountChangeRef = useRef(onMonthDayCountChange);

  useEffect(() => {
    onMonthDayCountChangeRef.current = onMonthDayCountChange;
  }, [onMonthDayCountChange]);

  useEffect(() => {
    if (timezoneProp) {
      queueMicrotask(() => setTimezone(timezoneProp));
      return;
    }

    let cancelled = false;
    void getOrganizationTimezone(supabase, organizationId)
      .then((value) => {
        if (!cancelled) setTimezone(value);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load timezone.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [organizationId, supabase, timezoneProp]);

  useEffect(() => {
    const next = todayMonthYearInTimezone(timezone);
    queueMicrotask(() => {
      setViewYear(next.year);
      setViewMonth(next.month);
      setSelectedDate(null);
    });
  }, [timezone]);

  const monthRange = useMemo(() => {
    const start = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
    const endMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const endYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const endDay = new Date(endYear, endMonth + 1, 0).getDate();
    const end = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
    return { start, end };
  }, [viewMonth, viewYear]);

  const loadMonthDays = useCallback(async () => {
    const [open, booked] = await Promise.all([
      listObservationDayAvailability(
        supabase,
        organizationId,
        monthRange.start,
        monthRange.end,
      ),
      listOccupiedObservationDays(
        supabase,
        organizationId,
        monthRange.start,
        monthRange.end,
      ),
    ]);

    setOpenDays(open);
    setBookedDays(booked);
    onMonthDayCountChangeRef.current?.(open.size);
  }, [monthRange.end, monthRange.start, organizationId, supabase]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);
      try {
        await loadMonthDays();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load observation days.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [loadMonthDays]);

  const calendarColors = useMemo(
    () => ({
      accent: C.accent,
      accentLight: C.accentLight,
      text: C.textPrimary,
      textFaint: C.textTertiary,
    }),
    [C.accent, C.accentLight, C.textPrimary, C.textTertiary],
  );

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
    setSelectedDate(null);
  }

  async function handleSelectDate(date: string) {
    setSelectedDate(date);

    if (date < today || readOnly || togglingDate) return;

    const isOpen = openDays.has(date);
    const isBooked = bookedDays.has(date);

    if (isBooked) {
      setError("This day already has a shadow visit booked and can't be changed.");
      return;
    }

    setTogglingDate(date);
    setError(null);

    try {
      await toggleObservationDay(supabase, organizationId, date, !isOpen);

      setOpenDays((prev) => {
        const next = new Set(prev);
        if (isOpen) next.delete(date);
        else next.add(date);
        return next;
      });

      const count = await countObservationDaysInMonth(
        supabase,
        organizationId,
        viewYear,
        viewMonth,
      );
      onMonthDayCountChangeRef.current?.(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update day.");
    } finally {
      setTogglingDate(null);
    }
  }

  if (loading) {
    return <SchoolAdminCalendarSkeleton C={C} compactLayout={compactLayout} label="Loading observation days" />;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p
          className="rounded-sm px-3 py-2 text-xs"
          style={{ backgroundColor: C.errorBg, color: C.error }}
        >
          {error}
        </p>
      ) : null}

      <div
        className={
          compactLayout
            ? "grid w-full gap-4 lg:grid-cols-[3fr_2fr]"
            : "grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]"
        }
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

          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            selected={selectedDate}
            onSelect={(date) => void handleSelectDate(date)}
            availableDates={openDays}
            minDate={today}
            editable
            colors={calendarColors}
          />

          <div className="mt-4 flex flex-wrap gap-3 text-[11px]" style={{ color: C.textTertiary }}>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded"
                style={{ backgroundColor: C.accentLight, border: `1px solid ${C.accent}` }}
              />
              Open for shadow visits
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded"
                style={{ backgroundColor: C.warningBg, border: `1px solid ${C.warning}` }}
              />
              Booked
            </span>
          </div>
        </div>

        <div
          className="flex min-h-[280px] flex-col rounded-sm border"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <div className="border-b px-4 py-3" style={{ borderColor: C.border }}>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: C.textQuaternary }}
            >
              Shadow / observation days
            </p>
            {selectedDate ? (
              <>
                <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                  {formatDateOnlyLabel(selectedDate)}
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: C.textTertiary }}>
                  {timezoneLabel}
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: C.textTertiary }}>
                Click a day to open or close it
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!selectedDate ? (
              <p className="py-6 text-center text-xs" style={{ color: C.textTertiary }}>
                Select a future day on the calendar
              </p>
            ) : selectedDate < today ? (
              <p className="py-6 text-center text-xs" style={{ color: C.textTertiary }}>
                Past dates can&apos;t be edited
              </p>
            ) : bookedDays.has(selectedDate) ? (
              <p className="text-xs leading-relaxed" style={{ color: C.warning }}>
                A family has booked this day for a shadow visit. It can&apos;t be closed
                until the visit is cancelled.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>
                  {openDays.has(selectedDate)
                    ? "This day is open. Families can book shadow visits that include it."
                    : "This day is closed. Click it again on the calendar to open it for shadow visits."}
                </p>
                {!readOnly ? (
                  <button
                    type="button"
                    disabled={togglingDate === selectedDate}
                    onClick={() => void handleSelectDate(selectedDate)}
                    className="w-full rounded-sm border px-3 py-2 text-xs font-medium disabled:opacity-60"
                    style={{
                      borderColor: openDays.has(selectedDate) ? C.border : C.accent,
                      backgroundColor: openDays.has(selectedDate) ? C.bg : C.accentLight,
                      color: openDays.has(selectedDate) ? C.textSecondary : C.accent,
                    }}
                  >
                    {openDays.has(selectedDate) ? "Close this day" : "Open this day"}
                  </button>
                ) : null}
              </div>
            )}
          </div>

          {!readOnly ? (
            <div
              className="border-t px-4 py-2 text-[11px]"
              style={{ borderColor: C.border, color: C.textTertiary }}
            >
              Open whole school days for student shadow visits. Families book consecutive
              days based on your form settings.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
