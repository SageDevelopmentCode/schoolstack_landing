"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DetailButton } from "@/components/school-admin/admissions/detail-garden";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { GardenNotice } from "@/components/school-admin/garden/kit";
import { gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import {
  GARDEN_AVAILABILITY_PANEL,
  GardenAvailabilityEmpty,
  GardenAvailabilityFooter,
  GardenAvailabilityHeader,
} from "@/components/school-admin/schedule/garden/availability-garden";
import { SchoolAdminCalendarSkeleton } from "@/components/school-admin/skeletons";
import ScheduleCalendarShell from "@/components/school-admin/schedule/ScheduleCalendarShell";
import ScheduleAvailabilityLegend from "@/components/school-admin/schedule/ScheduleAvailabilityLegend";
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
  formatObservationSlotLabel,
  listOccupiedObservationSlotIds,
  type ObservationSlot,
} from "@/lib/admissions/admissions-observation-slots";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import AdminScheduleManualBookingDialog from "@/components/school-admin/schedule/AdminScheduleManualBookingDialog";
import { useOptionalScheduleVisitsContext } from "@/components/school-admin/schedule/schedule-visits-context";
import { createClient } from "@/utils/supabase/client";

type AdmissionsObservationDayAvailabilityEditorProps = {
  C: AdminThemeTokens;
  organizationId: string;
  readOnly?: boolean;
  timezone?: string;
  compactLayout?: boolean;
  storySurface?: boolean;
  onMonthDayCountChange?: (count: number) => void;
  onLoadingChange?: (loading: boolean) => void;
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
  storySurface = false,
  onMonthDayCountChange,
  onLoadingChange,
}: AdmissionsObservationDayAvailabilityEditorProps) {
  const supabase = useMemo(() => createClient(), []);
  const skin = useAdminGardenSkin();
  const [schedulingMode, setSchedulingMode] = useState<ShadowDaySchedulingMode>("whole_day");
  const [modeLoading, setModeLoading] = useState(true);
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());
  const [bookedDays, setBookedDays] = useState<Set<string>>(new Set());
  const [monthSlots, setMonthSlots] = useState<ObservationSlot[]>([]);
  const [removingSlotId, setRemovingSlotId] = useState<string | null>(null);
  /** Direction of the in-flight day toggle, so the button label doesn't flip mid-save. */
  const [togglingTo, setTogglingTo] = useState<"open" | "close" | null>(null);
  const [occupiedSlotIds, setOccupiedSlotIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingDate, setTogglingDate] = useState<string | null>(null);
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotDraft, setSlotDraft] = useState<ObservationSlotDraft>(() =>
    createDefaultObservationSlotDraft(false),
  );
  const onMonthDayCountChangeRef = useRef(onMonthDayCountChange);
  const [manualBookingOpen, setManualBookingOpen] = useState(false);
  const visitsContext = useOptionalScheduleVisitsContext();

  const includeTime = schedulingMode === "grade_and_time";
  const usesGradeSlots = schedulingMode !== "whole_day";

  const {
    timezone,
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
    onLoadingChange?.(loading || modeLoading);
  }, [loading, modeLoading, onLoadingChange]);

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
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "admissions.observation_day.load_settings",
          error: "",
        }, err);
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
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "admissions.observation_day.load_days",
          error: "",
        }, err);
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
    setTogglingTo(isOpen ? "close" : "open");
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
      if (skin) {
        adminToast.dismiss("observation-day-error");
        adminToast.success(
          isOpen ? `${formatDateOnlyLabel(selectedDate)} closed.` : `${formatDateOnlyLabel(selectedDate)} is open for shadow visits.`,
          {
            id: "observation-day",
            description: `${isOpen ? "Families can't pick this day anymore" : "Families can pick it when they book"}. ${count} open ${
              count === 1 ? "day" : "days"
            } this month.`,
          },
        );
      } else {
        adminToast.success(isOpen ? "Observation day closed" : "Observation day opened");
      }
    } catch (err) {
      const message = formatActionError(err, "Failed to update day.");
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "admissions.observation_day.toggle_day",
        error: "",
      }, err);
      setError(message);
      if (skin) {
        adminToast.error(isOpen ? "Couldn't close this day." : "Couldn't open this day.", {
          id: "observation-day-error",
          description: `${message} It's still ${isOpen ? "open" : "closed"}.`,
          action: { label: "Retry", onClick: () => void actionsRef.current.toggleDay() },
        });
      } else {
        adminToast.error(message);
      }
    } finally {
      setTogglingDate(null);
      setTogglingTo(null);
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
      if (skin) {
        adminToast.dismiss("observation-slot-add-error");
        adminToast.success("Shadow slot added.", {
          id: "observation-slot-add",
          description: `${formatDateOnlyLabel(selectedDate)} · families in those grades can book it now.`,
        });
      } else {
        adminToast.success("Shadow slot added");
      }
    } catch (err) {
      const message = formatActionError(err, "Failed to add slot.");
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "admissions.observation_day.add_slot",
        error: "",
      }, err);
      setError(message);
      if (skin) {
        adminToast.error("Couldn't add the shadow slot.", {
          id: "observation-slot-add-error",
          description: `${message} Your choices are still in the form.`,
          action: { label: "Retry", onClick: () => void actionsRef.current.addSlot() },
        });
      } else {
        adminToast.error(message);
      }
    } finally {
      setSlotSaving(false);
    }
  }

  async function restoreSlot(slot: ObservationSlot) {
    try {
      await createObservationSlot(supabase, organizationId, {
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        label: slot.label,
        gradeValues: slot.gradeValues,
      });
      await loadMonthDays();
      adminToast.dismiss("observation-slot-remove");
      adminToast.success("Shadow slot restored.", {
        id: "observation-slot-restore",
        description: `${formatObservationSlotLabel(slot)} is open for booking again.`,
      });
    } catch (err) {
      adminToast.error("Couldn't restore the shadow slot.", {
        id: "observation-slot-restore-error",
        description: `${formatActionError(err, "Failed to add slot.")} Add it again from the form.`,
      });
    }
  }

  async function handleDeleteSlot(slotId: string) {
    if (readOnly || slotSaving) return;
    const removed = monthSlots.find((slot) => slot.id === slotId) ?? null;

    setSlotSaving(true);
    setRemovingSlotId(slotId);
    setError(null);

    try {
      await deleteObservationSlot(supabase, organizationId, slotId);
      await loadMonthDays();
      if (skin) {
        adminToast.dismiss("observation-slot-remove-error");
        adminToast.success("Shadow slot removed.", {
          id: "observation-slot-remove",
          description: removed ? `${formatObservationSlotLabel(removed)} · families can't book it anymore.` : undefined,
          action: removed ? { label: "Undo", onClick: () => void restoreSlot(removed) } : undefined,
          duration: 8000,
        });
      } else {
        adminToast.success("Shadow slot removed");
      }
    } catch (err) {
      const message = formatActionError(err, "Failed to remove slot.");
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "admissions.observation_day.remove_slot",
        error: "",
      }, err);
      setError(message);
      if (skin) {
        adminToast.error("Couldn't remove the shadow slot.", {
          id: "observation-slot-remove-error",
          description: `${message} It's still open for booking.`,
          action: { label: "Retry", onClick: () => void actionsRef.current.deleteSlot(slotId) },
        });
      } else {
        adminToast.error(message);
      }
    } finally {
      setSlotSaving(false);
      setRemovingSlotId(null);
    }
  }

  const actionsRef = useRef({
    toggleDay: handleToggleDay,
    addSlot: handleAddSlot,
    deleteSlot: handleDeleteSlot,
  });
  useEffect(() => {
    actionsRef.current = { toggleDay: handleToggleDay, addSlot: handleAddSlot, deleteSlot: handleDeleteSlot };
  });

  const displayError = error ?? timezoneError;

  const handleManualBooked = useCallback(() => {
    void loadMonthDays();
    void visitsContext?.refetchVisits();
  }, [loadMonthDays, visitsContext]);

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
        skin ? (
          <GardenNotice tone="alert" role="alert">
            {displayError}
          </GardenNotice>
        ) : (
          <p
            className="rounded-sm px-3 py-2 text-xs"
            style={{ backgroundColor: C.errorBg, color: C.error }}
            role="alert"
            aria-live="polite"
          >
            {displayError}
          </p>
        )
      ) : null}

      {!readOnly ? (
        <div className="flex justify-end">
          <DetailButton
 kind="secondary"
 C={C}
            type="button"
            onClick={() => setManualBookingOpen(true)}
            storyClassName="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Book for a family
          </DetailButton>
        </div>
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
            <ScheduleAvailabilityLegend
              C={C}
              openLabel={usesGradeSlots ? "Open slots" : "Open for shadow visits"}
            />
          }
        />

        <div
          className={
            skin
              ? GARDEN_AVAILABILITY_PANEL
              : storySurface
                ? "flex min-h-[280px] flex-col overflow-hidden rounded-[16px] border bg-white"
                : "flex min-h-[280px] flex-col rounded-sm border"
          }
          style={
            skin
              ? undefined
              : {
                  borderColor: storySurface ? "#E0E7E0" : C.border,
                  backgroundColor: storySurface ? "#FFFFFF" : C.surface,
                }
          }
        >
          {skin ? (
            <GardenAvailabilityHeader
              kicker="Shadow / observation days"
              title={selectedDate ? formatDateOnlyLabel(selectedDate) : "Pick a day"}
              meta={selectedDate ? timezoneLabel : "Select a date to manage availability"}
            />
          ) : (
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
          )}

          <div className="flex-1 overflow-y-auto p-4">
            {!selectedDate ? (
              skin ? (
                <GardenAvailabilityEmpty>Select a future day on the calendar</GardenAvailabilityEmpty>
              ) : (
              <p className="py-6 text-center text-xs" style={{ color: C.textTertiary }}>
                Select a future day on the calendar
              </p>
              )
            ) : selectedDate < today ? (
              skin ? (
                <GardenAvailabilityEmpty>Past dates can&apos;t be edited</GardenAvailabilityEmpty>
              ) : (
              <p className="py-6 text-center text-xs" style={{ color: C.textTertiary }}>
                Past dates can&apos;t be edited
              </p>
              )
            ) : schedulingMode === "whole_day" && skin ? (
              bookedDays.has(selectedDate) ? (
                <GardenNotice tone="warning" title="A family has booked this day.">
                  It can&apos;t be closed until the visit is cancelled.
                </GardenNotice>
              ) : (
                <div className="flex flex-col gap-3">
                  <div
                    className={`rounded-[16px] border-[1.5px] p-3.5 text-[13.5px] font-semibold leading-snug ${
                      openDays.has(selectedDate)
                        ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)] text-[var(--sf-ink)]"
                        : "border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] text-[var(--sf-soft)]"
                    }`}
                    role="status"
                  >
                    {openDays.has(selectedDate)
                      ? "This day is open. Families can book shadow visits that include it."
                      : "This day is closed. Open it to let families book shadow visits."}
                  </div>
                  {!readOnly ? (
                    <button
                      type="button"
                      disabled={togglingDate === selectedDate}
                      aria-busy={togglingDate === selectedDate || undefined}
                      onClick={() => void handleToggleDay()}
                      className={`${openDays.has(selectedDate) ? gBtnOutlineSm : gBtnPopSm} w-full`}
                      data-testid="observation-day-toggle"
                    >
                      {togglingDate === selectedDate ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                      {togglingDate === selectedDate
                        ? togglingTo === "close"
                          ? "Closing…"
                          : "Opening…"
                        : openDays.has(selectedDate)
                          ? "Close this day"
                          : "Open this day"}
                    </button>
                  ) : null}
                </div>
              )
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
                        removing={removingSlotId === slot.id}
                        onDelete={() => void handleDeleteSlot(slot.id)}
                      />
                    ))}
                  </div>
                ) : skin ? (
                  <p className="m-0 text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">
                    {emptyDayPromptForMode(schedulingMode)}
                  </p>
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
            skin ? (
              <GardenAvailabilityFooter>{footerTextForMode(schedulingMode)}</GardenAvailabilityFooter>
            ) : (
            <div
              className="border-t px-4 py-2 text-[11px]"
              style={{ borderColor: C.border, color: C.textTertiary }}
            >
              {footerTextForMode(schedulingMode)}
            </div>
            )
          ) : null}
        </div>
      </div>

      {manualBookingOpen ? (
        <AdminScheduleManualBookingDialog
          C={C}
          open
          onClose={() => setManualBookingOpen(false)}
          context="shadow"
          organizationId={organizationId}
          timezone={timezone}
          initialDate={selectedDate}
          onBooked={handleManualBooked}
        />
      ) : null}
    </div>
  );
}
