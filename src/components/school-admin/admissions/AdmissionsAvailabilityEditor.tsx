"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarGrid } from "@/components/scheduler/CalendarGrid";
import {
  ADMISSIONS_TIME_SLOT_GROUPS,
  type AdmissionsTimeSlotPeriod,
  countAdmissionsAvailabilitySlotsInMonth,
  formatOrganizationTimezoneLabel,
  getOrganizationTimezone,
  listAdmissionsAvailabilitySlots,
  todayKeyInTimezone,
  todayMonthYearInTimezone,
  toggleAdmissionsAvailabilitySlot,
} from "@/lib/admissions/admissions-availability";
import {
  formatSelectedDate,
  MONTH_NAMES,
} from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { createClient } from "@/utils/supabase/client";

type AdmissionsAvailabilityEditorProps = {
  C: AdminThemeTokens;
  organizationId: string;
  readOnly?: boolean;
  timezone?: string;
  onMonthSlotCountChange?: (count: number) => void;
};

export default function AdmissionsAvailabilityEditor({
  C,
  organizationId,
  readOnly = false,
  timezone: timezoneProp,
  onMonthSlotCountChange,
}: AdmissionsAvailabilityEditorProps) {
  const supabase = useMemo(() => createClient(), []);
  const [timezone, setTimezone] = useState(timezoneProp ?? "America/Chicago");
  const initial = todayMonthYearInTimezone(timezone);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [openSlots, setOpenSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<AdmissionsTimeSlotPeriod>("morning");

  const today = todayKeyInTimezone(timezone);
  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);

  useEffect(() => {
    if (timezoneProp) {
      setTimezone(timezoneProp);
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
    setViewYear(next.year);
    setViewMonth(next.month);
    setSelectedDate(null);
  }, [timezone]);

  const loadMonthSlots = useCallback(async () => {
    const start = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
    const endMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const endYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const endDay = new Date(endYear, endMonth + 1, 0).getDate();
    const end = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

    const slots = await listAdmissionsAvailabilitySlots(
      supabase,
      organizationId,
      start,
      end,
    );
    setOpenSlots(slots);
    onMonthSlotCountChange?.(slots.size);
  }, [organizationId, onMonthSlotCountChange, supabase, viewMonth, viewYear]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);
      try {
        await loadMonthSlots();
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
  }, [loadMonthSlots]);

  const availableDates = useMemo(
    () => new Set([...openSlots].map((key) => key.split("|")[0])),
    [openSlots],
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

  function handleSelectDate(date: string | null) {
    setSelectedDate(date);
    if (date) setActivePeriod("morning");
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
    setSelectedDate(null);
    setActivePeriod("morning");
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
    setSelectedDate(null);
    setActivePeriod("morning");
  }

  async function toggleSlot(timeSlot: string) {
    if (!selectedDate || selectedDate < today || readOnly) return;

    const key = `${selectedDate}|${timeSlot}`;
    const isOpen = openSlots.has(key);
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
      onMonthSlotCountChange?.(count);
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

  if (loading) {
    return (
      <p className="py-8 text-center text-sm" style={{ color: C.textTertiary }}>
        Loading availability…
      </p>
    );
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

      <p className="text-xs leading-relaxed" style={{ color: C.textTertiary }}>
        Toggle open 30-minute time slots for each day. All scheduling templates share
        this availability; each template&apos;s duration controls how many consecutive
        slots a family books. Times are in {timezoneLabel}.
      </p>

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

          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            selected={selectedDate}
            onSelect={handleSelectDate}
            availableDates={availableDates}
            minDate={today}
            editable
            colors={calendarColors}
          />
        </div>

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
                Click a date on the calendar
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
                    const isOpen = openSlots.has(`${selectedDate}|${slot}`);
                    const disabled = toggling === slot || readOnly;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleSlot(slot)}
                        className="h-9 rounded-sm border text-xs font-medium transition-colors disabled:opacity-60"
                        style={{
                          borderColor: isOpen ? C.accent : C.border,
                          backgroundColor: isOpen ? C.accentLight : C.bg,
                          color: isOpen ? C.accent : C.textSecondary,
                        }}
                      >
                        {slot}
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
              Click a slot to open or close it. Changes save immediately.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
