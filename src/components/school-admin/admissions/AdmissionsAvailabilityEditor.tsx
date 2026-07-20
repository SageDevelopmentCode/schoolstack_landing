"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SchoolAdminCalendarSkeleton } from "@/components/school-admin/skeletons";
import ScheduleCalendarShell from "@/components/school-admin/schedule/ScheduleCalendarShell";
import { useScheduleCalendar } from "@/components/school-admin/schedule/useScheduleCalendar";
import {
  ADMISSIONS_TIME_SLOT_GROUPS,
  type AdmissionsTimeSlotPeriod,
  countAdmissionsAvailabilitySlotsInMonth,
  listAdmissionsAvailabilitySlots,
  toggleAdmissionsAvailabilitySlot,
} from "@/lib/admissions/admissions-availability";
import {
  listOccupiedSlotKeysForDateRange,
  occupiedSlotKeysToBookedDates,
} from "@/lib/admissions/admin-scheduled-visits";
import { formatSelectedDate } from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { createClient } from "@/utils/supabase/client";

type AdmissionsAvailabilityEditorProps = {
  C: AdminThemeTokens;
  organizationId: string;
  readOnly?: boolean;
  timezone?: string;
  compactLayout?: boolean;
  onMonthSlotCountChange?: (count: number) => void;
};

export default function AdmissionsAvailabilityEditor({
  C,
  organizationId,
  readOnly = false,
  timezone: timezoneProp,
  compactLayout = false,
  onMonthSlotCountChange,
}: AdmissionsAvailabilityEditorProps) {
  const supabase = useMemo(() => createClient(), []);
  const [openSlots, setOpenSlots] = useState<Set<string>>(new Set());
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<AdmissionsTimeSlotPeriod>("morning");
  const onMonthSlotCountChangeRef = useRef(onMonthSlotCountChange);

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
    onMonthSlotCountChangeRef.current = onMonthSlotCountChange;
  }, [onMonthSlotCountChange]);

  const loadMonthData = useCallback(async () => {
    const [slots, occupied] = await Promise.all([
      listAdmissionsAvailabilitySlots(
        supabase,
        organizationId,
        monthRange.start,
        monthRange.end,
      ),
      listOccupiedSlotKeysForDateRange(
        supabase,
        organizationId,
        monthRange.start,
        monthRange.end,
      ),
    ]);
    setOpenSlots(slots);
    setOccupiedSlots(occupied);
    onMonthSlotCountChangeRef.current?.(slots.size);
  }, [monthRange.end, monthRange.start, organizationId, supabase]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);
      try {
        await loadMonthData();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load availability.",
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
  }, [loadMonthData]);

  const availableDates = useMemo(
    () => new Set([...openSlots].map((key) => key.split("|")[0])),
    [openSlots],
  );

  const bookedDates = useMemo(
    () => occupiedSlotKeysToBookedDates(occupiedSlots),
    [occupiedSlots],
  );

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setActivePeriod("morning");
  }

  async function toggleSlot(timeSlot: string) {
    if (!selectedDate || selectedDate < today || readOnly) return;

    const key = `${selectedDate}|${timeSlot}`;
    const isOpen = openSlots.has(key);
    const isBooked = occupiedSlots.has(key);

    if (isBooked && isOpen) {
      setError("This slot is booked and can't be closed.");
      return;
    }

    setToggling(timeSlot);
    setError(null);

    try {
      await toggleAdmissionsAvailabilitySlot(
        supabase,
        organizationId,
        selectedDate,
        timeSlot,
        !isOpen,
      );

      setOpenSlots((prev) => {
        const next = new Set(prev);
        if (isOpen) next.delete(key);
        else next.add(key);
        return next;
      });

      const count = await countAdmissionsAvailabilitySlotsInMonth(
        supabase,
        organizationId,
        viewYear,
        viewMonth,
      );
      onMonthSlotCountChangeRef.current?.(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update slot.");
    } finally {
      setToggling(null);
    }
  }

  const canEditSelected = selectedDate !== null && selectedDate >= today && !readOnly;

  const activePeriodGroup =
    ADMISSIONS_TIME_SLOT_GROUPS.find((group) => group.id === activePeriod) ??
    ADMISSIONS_TIME_SLOT_GROUPS[0];

  const openCountForPeriod = useCallback(
    (period: AdmissionsTimeSlotPeriod) => {
      if (!selectedDate) return 0;
      const group = ADMISSIONS_TIME_SLOT_GROUPS.find((entry) => entry.id === period);
      if (!group) return 0;
      return group.slots.filter((slot) => openSlots.has(`${selectedDate}|${slot}`)).length;
    },
    [openSlots, selectedDate],
  );

  const displayError = error ?? timezoneError;

  if (loading) {
    return <SchoolAdminCalendarSkeleton C={C} compactLayout={compactLayout} label="Loading availability" />;
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
          availableDates={availableDates}
          bookedDates={bookedDates}
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
                Open slots
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded"
                  style={{ backgroundColor: C.warningBg, border: `1px solid ${C.warning}` }}
                />
                Has bookings
              </span>
            </div>
          }
        />

        <div
          className="flex min-h-[280px] flex-col rounded-sm border"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
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
                Select a date to manage slots
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {!selectedDate ? (
              <p className="py-6 text-center text-xs" style={{ color: C.textTertiary }}>
                Select a date on the calendar
              </p>
            ) : selectedDate < today ? (
              <p className="py-6 text-center text-xs" style={{ color: C.textTertiary }}>
                Past dates can&apos;t be edited
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
                    const openCount = openCountForPeriod(group.id);

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
                          <span className="text-[9px] font-normal" style={{ color: C.textQuaternary }}>
                            {openCount} open
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-2" role="tabpanel">
                  {activePeriodGroup.slots.map((slot) => {
                    const slotKey = `${selectedDate}|${slot}`;
                    const isOpen = openSlots.has(slotKey);
                    const isBooked = occupiedSlots.has(slotKey);
                    const disabled = toggling === slot || readOnly || (isBooked && isOpen);

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleSlot(slot)}
                        className="h-9 rounded-sm border text-xs font-medium transition-colors disabled:opacity-60"
                        style={{
                          borderColor: isBooked ? C.warning : isOpen ? C.accent : C.border,
                          backgroundColor: isBooked
                            ? C.warningBg
                            : isOpen
                              ? C.accentLight
                              : C.bg,
                          color: isBooked ? C.warning : isOpen ? C.accent : C.textSecondary,
                        }}
                      >
                        {slot}
                        {isBooked ? " · Booked" : isOpen ? " · Open" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {canEditSelected ? (
            <div
              className="border-t px-4 py-2 text-[11px]"
              style={{ borderColor: C.border, color: C.textTertiary }}
            >
              Click a slot to open or close it. Booked slots can&apos;t be closed.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
