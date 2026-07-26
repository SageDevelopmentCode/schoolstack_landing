"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SchoolAdminCalendarSkeleton } from "@/components/school-admin/skeletons";
import ScheduleCalendarShell from "@/components/school-admin/schedule/ScheduleCalendarShell";
import { useScheduleCalendar } from "@/components/school-admin/schedule/useScheduleCalendar";
import {
  countObservationDaysInMonth,
  listObservationDayAvailability,
  listOccupiedObservationDays,
  toggleObservationDay,
} from "@/lib/admissions/admissions-observation-availability";
import { formatDateOnlyLabel } from "@/lib/admissions/admissions-availability";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
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
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());
  const [bookedDays, setBookedDays] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingDate, setTogglingDate] = useState<string | null>(null);
  const onMonthDayCountChangeRef = useRef(onMonthDayCountChange);

  const {
    today,
    timezoneLabel,
    timezoneError,
    viewYear,
    viewMonth,
    selectedDate,
    setSelectedDate,
    prevMonth,
    nextMonth,
    monthRange,
    calendarColors,
  } = useScheduleCalendar({
    organizationId,
    supabase,
    timezoneProp,
    C,
  });

  useEffect(() => {
    onMonthDayCountChangeRef.current = onMonthDayCountChange;
  }, [onMonthDayCountChange]);

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

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setError(null);
  }

  async function handleToggleDay() {
    if (!selectedDate || selectedDate < today || readOnly || togglingDate) return;

    const isOpen = openDays.has(selectedDate);
    const isBooked = bookedDays.has(selectedDate);

    if (isBooked) {
      setError("This day already has a shadow visit booked and can't be changed.");
      return;
    }

    setTogglingDate(selectedDate);
    setError(null);

    try {
      await toggleObservationDay(supabase, organizationId, selectedDate, !isOpen);

      setOpenDays((prev) => {
        const next = new Set(prev);
        if (isOpen) next.delete(selectedDate);
        else next.add(selectedDate);
        return next;
      });

      const count = await countObservationDaysInMonth(
        supabase,
        organizationId,
        viewYear,
        viewMonth,
      );
      onMonthDayCountChangeRef.current?.(count);
      adminToast.success(isOpen ? "Observation day closed" : "Observation day opened");
    } catch (err) {
      const message = formatActionError(err, "Failed to update day.");
      setError(message);
      adminToast.error(message);
    } finally {
      setTogglingDate(null);
    }
  }

  const displayError = error ?? timezoneError;

  if (loading) {
    return (
      <SchoolAdminCalendarSkeleton
        C={C}
        compactLayout={compactLayout}
        label="Loading observation days"
      />
    );
  }

  return (
    <div className="space-y-4">
      {displayError ? (
        <p
          className="rounded-sm px-3 py-2 text-xs"
          style={{ backgroundColor: C.errorBg, color: C.error }}
          role="alert"
          aria-live="polite"
        >
          {displayError}
        </p>
      ) : null}

      <div
        className={
          compactLayout
            ? "grid w-full gap-4 lg:grid-cols-[3fr_2fr]"
            : "grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]"
        }
      >
        <ScheduleCalendarShell
          C={C}
          viewYear={viewYear}
          viewMonth={viewMonth}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          availableDates={openDays}
          bookedDates={bookedDays}
          minDate={today}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          calendarColors={calendarColors}
          legend={
            <div className="flex flex-wrap gap-3 text-[11px]" style={{ color: C.textTertiary }}>
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
          }
        />

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
                Select a date to manage availability
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
                    : "This day is closed. Open it to let families book shadow visits."}
                </p>
                {!readOnly ? (
                  <button
                    type="button"
                    disabled={togglingDate === selectedDate}
                    onClick={() => void handleToggleDay()}
                    className="w-full rounded-sm px-3 py-2 text-xs font-medium transition enabled:hover:opacity-90 disabled:opacity-60"
                    style={getAdminButtonStyle(
                      C,
                      openDays.has(selectedDate) ? "neutral" : "primary",
                    )}
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
              Open whole school days for student shadow visits. Families book days based on
              your form settings.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
