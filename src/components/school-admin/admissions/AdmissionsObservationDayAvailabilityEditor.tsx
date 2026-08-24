"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SchoolAdminCalendarSkeleton } from "@/components/school-admin/skeletons";
import ScheduleCalendarShell from "@/components/school-admin/schedule/ScheduleCalendarShell";
import { useScheduleCalendar } from "@/components/school-admin/schedule/useScheduleCalendar";
import {
  createDefaultObservationSlotDraft,
  ObservationSlotForm,
  ObservationSlotRow,
  type ObservationSlotDraft,
} from "@/components/school-admin/admissions/ObservationSlotEditorParts";
import {
  getAdmissionsOrgSettings,
  resolveShadowDaySchedulingMode,
  type ShadowDaySchedulingMode,
} from "@/lib/admissions/admissions-org-settings";
import { formatDateOnlyLabel } from "@/lib/admissions/admissions-availability";
import {
  countObservationDaysInMonth,
  listObservationDayAvailability,
  listOccupiedObservationDays,
  toggleObservationDay,
} from "@/lib/admissions/admissions-observation-availability";
import {
  ALL_DAY_TIME_SLOT,
  createObservationSlot,
  deleteObservationSlot,
  listObservationSlotsForDateRange,
  listOccupiedObservationSlotIds,
  type ObservationSlot,
} from "@/lib/admissions/admissions-observation-slots";
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

function footerTextForMode(mode: ShadowDaySchedulingMode): string {
  switch (mode) {
    case "grade_targeted":
      return "Add which grades can shadow on each day. Families only see slots for their applicant's grade.";
    case "grade_and_time":
      return "Add grade and time windows for each day. Families book the window that matches their applicant's grade.";
    default:
      return "Open whole school days for student shadow visits. Families book days based on your form settings.";
  }
}

function emptyDayPromptForMode(mode: ShadowDaySchedulingMode): string {
  switch (mode) {
    case "grade_targeted":
      return "No grade slots yet for this day. Add which grades can shadow below.";
    case "grade_and_time":
      return "No time slots yet for this day. Add a grade and time window below.";
    default:
      return "No slots yet for this day.";
  }
}

export default function AdmissionsObservationDayAvailabilityEditor({
  C,
  organizationId,
  readOnly = false,
  timezone: timezoneProp,
  compactLayout = false,
  onMonthDayCountChange,
}: AdmissionsObservationDayAvailabilityEditorProps) {
  const supabase = useMemo(() => createClient(), []);
  const [schedulingMode, setSchedulingMode] = useState<ShadowDaySchedulingMode>("whole_day");
  const [modeLoading, setModeLoading] = useState(true);
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());
  const [bookedDays, setBookedDays] = useState<Set<string>>(new Set());
  const [monthSlots, setMonthSlots] = useState<ObservationSlot[]>([]);
  const [occupiedSlotIds, setOccupiedSlotIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingDate, setTogglingDate] = useState<string | null>(null);
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotDraft, setSlotDraft] = useState<ObservationSlotDraft>(() =>
    createDefaultObservationSlotDraft(false),
  );
  const onMonthDayCountChangeRef = useRef(onMonthDayCountChange);

  const includeTime = schedulingMode === "grade_and_time";
  const usesGradeSlots = schedulingMode !== "whole_day";

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

  useEffect(() => {
    queueMicrotask(() =>
      setSlotDraft(createDefaultObservationSlotDraft(includeTime)),
    );
  }, [includeTime, selectedDate]);

  const loadSchedulingMode = useCallback(async () => {
    const settings = await getAdmissionsOrgSettings(supabase, organizationId);
    setSchedulingMode(resolveShadowDaySchedulingMode(settings));
  }, [organizationId, supabase]);

  const loadMonthDays = useCallback(async () => {
    if (schedulingMode === "whole_day") {
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
      setMonthSlots([]);
      setOccupiedSlotIds(new Set());
      onMonthDayCountChangeRef.current?.(open.size);
      return;
    }

    const [slots, occupied] = await Promise.all([
      listObservationSlotsForDateRange(
        supabase,
        organizationId,
        monthRange.start,
        monthRange.end,
      ),
      listOccupiedObservationSlotIds(
        supabase,
        organizationId,
        monthRange.start,
        monthRange.end,
      ),
    ]);

    const openDates = new Set(slots.map((slot) => slot.date));
    const bookedDates = new Set(
      slots
        .filter((slot) => occupied.has(slot.id))
        .map((slot) => slot.date),
    );

    setMonthSlots(slots);
    setOccupiedSlotIds(occupied);
    setOpenDays(openDates);
    setBookedDays(bookedDates);
    onMonthDayCountChangeRef.current?.(slots.length);
  }, [monthRange.end, monthRange.start, organizationId, schedulingMode, supabase]);

  useEffect(() => {
    let cancelled = false;

    async function initMode() {
      setModeLoading(true);
      try {
        await loadSchedulingMode();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load settings.");
        }
      } finally {
        if (!cancelled) setModeLoading(false);
      }
    }

    void initMode();
    return () => {
      cancelled = true;
    };
  }, [loadSchedulingMode]);

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

    if (!modeLoading) {
      void init();
    }

    return () => {
      cancelled = true;
    };
  }, [loadMonthDays, modeLoading]);

  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    return monthSlots
      .filter((slot) => slot.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [monthSlots, selectedDate]);

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

  async function handleAddSlot() {
    if (!selectedDate || selectedDate < today || readOnly || slotSaving) return;

    setSlotSaving(true);
    setError(null);

    try {
      await createObservationSlot(supabase, organizationId, {
        date: selectedDate,
        startTime: includeTime ? slotDraft.startTime.trim() : ALL_DAY_TIME_SLOT,
        endTime: includeTime ? slotDraft.endTime?.trim() ?? null : null,
        label: slotDraft.label.trim() || null,
        gradeValues: slotDraft.gradeValues,
      });
      setSlotDraft(createDefaultObservationSlotDraft(includeTime));
      await loadMonthDays();
      adminToast.success("Shadow slot added");
    } catch (err) {
      const message = formatActionError(err, "Failed to add slot.");
      setError(message);
      adminToast.error(message);
    } finally {
      setSlotSaving(false);
    }
  }

  async function handleDeleteSlot(slotId: string) {
    if (readOnly || slotSaving) return;

    setSlotSaving(true);
    setError(null);

    try {
      await deleteObservationSlot(supabase, organizationId, slotId);
      await loadMonthDays();
      adminToast.success("Shadow slot removed");
    } catch (err) {
      const message = formatActionError(err, "Failed to remove slot.");
      setError(message);
      adminToast.error(message);
    } finally {
      setSlotSaving(false);
    }
  }

  const displayError = error ?? timezoneError;

  if (loading || modeLoading) {
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
            : "grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"
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
                {usesGradeSlots ? "Open slots" : "Open for shadow visits"}
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
            ) : schedulingMode === "whole_day" ? (
              bookedDays.has(selectedDate) ? (
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
              )
            ) : (
              <div className="space-y-3">
                {selectedDateSlots.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDateSlots.map((slot) => (
                      <ObservationSlotRow
                        key={slot.id}
                        C={C}
                        slot={slot}
                        booked={occupiedSlotIds.has(slot.id)}
                        readOnly={readOnly}
                        onDelete={() => void handleDeleteSlot(slot.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed" style={{ color: C.textTertiary }}>
                    {emptyDayPromptForMode(schedulingMode)}
                  </p>
                )}

                {!readOnly ? (
                  <ObservationSlotForm
                    C={C}
                    includeTime={includeTime}
                    draft={slotDraft}
                    onDraftChange={setSlotDraft}
                    onSubmit={() => void handleAddSlot()}
                    submitting={slotSaving}
                  />
                ) : null}
              </div>
            )}
          </div>

          {!readOnly ? (
            <div
              className="border-t px-4 py-2 text-[11px]"
              style={{ borderColor: C.border, color: C.textTertiary }}
            >
              {footerTextForMode(schedulingMode)}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
