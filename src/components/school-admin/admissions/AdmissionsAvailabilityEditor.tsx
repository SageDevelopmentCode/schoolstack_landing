"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { SchoolAdminCalendarSkeleton } from "@/components/school-admin/skeletons";
import ScheduleCalendarShell from "@/components/school-admin/schedule/ScheduleCalendarShell";
import ScheduleAvailabilityLegend from "@/components/school-admin/schedule/ScheduleAvailabilityLegend";
import { useScheduleCalendar } from "@/components/school-admin/schedule/useScheduleCalendar";
import {
  ADMISSIONS_TIME_SLOT_GROUPS,
  type AdmissionsAvailabilitySlotKey,
  type AdmissionsAvailabilitySlotRecord,
  type AdmissionsTimeSlotPeriod,
  availabilitySlotKey,
  countAdmissionsAvailabilitySlotsInMonth,
  listAdmissionsAvailabilitySlotRecords,
  listAdmissionsAvailabilitySlots,
  toggleAdmissionsAvailabilitySlot,
} from "@/lib/admissions/admissions-availability";
import AdmissionsTimePeriodTabBar from "@/components/admissions/AdmissionsTimePeriodTabBar";
import AdmissionsGroupTourDayControls from "@/components/school-admin/admissions/AdmissionsGroupTourControls";
import AdmissionsSlotTourSettingsModal from "@/components/school-admin/admissions/AdmissionsSlotTourSettingsModal";
import {
  listOccupiedSlotKeysForDateRange,
  occupiedSlotKeysToBookedDates,
} from "@/lib/admissions/admin-scheduled-visits";
import { formatSelectedDate } from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { createClient } from "@/utils/supabase/client";

type AdmissionsAvailabilityEditorProps = {
  C: AdminThemeTokens;
  organizationId: string;
  readOnly?: boolean;
  timezone?: string;
  compactLayout?: boolean;
  storySurface?: boolean;
  onMonthSlotCountChange?: (count: number) => void;
  onLoadingChange?: (loading: boolean) => void;
};

function wholeDayGroupStateFromSlots(
  openSlots: Set<AdmissionsAvailabilitySlotKey>,
  selectedDate: string | null,
  slotRecords: Map<AdmissionsAvailabilitySlotKey, AdmissionsAvailabilitySlotRecord>,
): { active: boolean; capacity: number | null } {
  if (!selectedDate) {
    return { active: false, capacity: null };
  }

  for (const key of openSlots) {
    const [slotDate] = key.split("|");
    if (slotDate !== selectedDate) continue;
    const record = slotRecords.get(key);
    if (
      record?.tourBookingMode === "group" &&
      record.groupDayKey === selectedDate
    ) {
      return { active: true, capacity: record.groupCapacity };
    }
  }

  return { active: false, capacity: null };
}

export default function AdmissionsAvailabilityEditor({
  C,
  organizationId,
  readOnly = false,
  timezone: timezoneProp,
  compactLayout = false,
  storySurface = false,
  onMonthSlotCountChange,
  onLoadingChange,
}: AdmissionsAvailabilityEditorProps) {
  const supabase = useMemo(() => createClient(), []);
  const [openSlots, setOpenSlots] = useState<Set<AdmissionsAvailabilitySlotKey>>(new Set());
  const [slotRecords, setSlotRecords] = useState<
    Map<AdmissionsAvailabilitySlotKey, AdmissionsAvailabilitySlotRecord>
  >(new Map());
  const [occupiedSlots, setOccupiedSlots] = useState<Set<AdmissionsAvailabilitySlotKey>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<AdmissionsTimeSlotPeriod>("morning");
  const [slotSettingsTime, setSlotSettingsTime] = useState<string | null>(null);
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

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const loadMonthData = useCallback(async () => {
    const [slots, records, occupied] = await Promise.all([
      listAdmissionsAvailabilitySlots(
        supabase,
        organizationId,
        monthRange.start,
        monthRange.end,
      ),
      listAdmissionsAvailabilitySlotRecords(
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
    setSlotRecords(
      new Map(records.map((record) => [availabilitySlotKey(record.date, record.timeSlot), record])),
    );
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
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "admissions.availability.load",
          error: "",
        }, err);
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

  const wholeDayGroupState = wholeDayGroupStateFromSlots(
    openSlots,
    selectedDate,
    slotRecords,
  );

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setActivePeriod("morning");
    setSlotSettingsTime(null);
  }

  async function toggleSlot(timeSlot: string) {
    if (!selectedDate || selectedDate < today || readOnly) return;

    const key = availabilitySlotKey(selectedDate, timeSlot);
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
      adminToast.success(isOpen ? "Slot closed" : "Slot opened");
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "admissions.availability.toggle_slot",
        error: "",
      }, err);
      const message = formatActionError(err, "Failed to update slot.");
      setError(message);
      adminToast.error(message);
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
      return group.slots.filter((slot) => openSlots.has(availabilitySlotKey(selectedDate, slot))).length;
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
          legend={<ScheduleAvailabilityLegend C={C} openLabel="Open slots" showGroupTour />}
        />

        <div
          className={
            storySurface
              ? "flex min-h-[280px] flex-col overflow-hidden rounded-[16px] border bg-white"
              : "flex min-h-[280px] flex-col rounded-sm border"
          }
          style={{
            borderColor: storySurface ? "#E0E7E0" : C.border,
            backgroundColor: storySurface ? "#FFFFFF" : C.surface,
          }}
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
                <AdmissionsGroupTourDayControls
                  C={C}
                  organizationId={organizationId}
                  date={selectedDate}
                  isWholeDayActive={wholeDayGroupState.active}
                  wholeDayCapacity={wholeDayGroupState.capacity}
                  readOnly={readOnly}
                  storySurface={storySurface}
                  onUpdated={() => void loadMonthData()}
                />

                <AdmissionsTimePeriodTabBar
                  C={C}
                  activePeriod={activePeriod}
                  onPeriodChange={setActivePeriod}
                  openCountForPeriod={openCountForPeriod}
                />

                <div className="flex flex-col gap-2" role="tabpanel">
                  {activePeriodGroup.slots.map((slot) => {
                    const slotKey = availabilitySlotKey(selectedDate, slot);
                    const isOpen = openSlots.has(slotKey);
                    const isBooked = occupiedSlots.has(slotKey);
                    const record = slotRecords.get(slotKey);
                    const isGroup = record?.tourBookingMode === "group";
                    const disabled = toggling === slot || readOnly || (isBooked && isOpen);
                    const rowBorderColor = isBooked
                      ? C.warning
                      : isGroup
                        ? C.accent
                        : isOpen
                          ? C.accent
                          : C.border;
                    const rowBackgroundColor = isBooked
                      ? C.warningBg
                      : isOpen
                        ? C.accentLight
                        : C.bg;
                    const rowTextColor = isBooked ? C.warning : isOpen ? C.accent : C.textSecondary;

                    return (
                      <div
                        key={slot}
                        className="flex h-9 overflow-hidden rounded-sm border"
                        style={{
                          borderColor: rowBorderColor,
                          borderStyle: isGroup && isOpen ? "dashed" : "solid",
                        }}
                      >
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => toggleSlot(slot)}
                          className="min-w-0 flex-1 px-2 text-xs font-medium transition-colors disabled:opacity-60"
                          style={{
                            backgroundColor: rowBackgroundColor,
                            color: rowTextColor,
                          }}
                        >
                          {slot}
                          {isBooked ? " · Booked" : isOpen ? (isGroup ? " · Group" : " · Open") : ""}
                        </button>
                        {isOpen && !readOnly ? (
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => setSlotSettingsTime(slot)}
                            className="flex shrink-0 items-center border-l px-2.5 transition-colors disabled:opacity-60"
                            style={{
                              borderColor: rowBorderColor,
                              backgroundColor: rowBackgroundColor,
                              color: rowTextColor,
                            }}
                            aria-label={`Tour settings for ${slot}`}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {selectedDate && slotSettingsTime ? (
                  <AdmissionsSlotTourSettingsModal
                    open={slotSettingsTime != null}
                    onClose={() => setSlotSettingsTime(null)}
                    C={C}
                    storySurface={storySurface}
                    organizationId={organizationId}
                    date={selectedDate}
                    timeSlot={slotSettingsTime}
                    record={slotRecords.get(
                      availabilitySlotKey(selectedDate, slotSettingsTime),
                    )}
                    isWholeDayActive={wholeDayGroupState.active}
                    wholeDayCapacity={wholeDayGroupState.capacity}
                    onUpdated={() => void loadMonthData()}
                  />
                ) : null}

              </div>
            )}
          </div>

          {canEditSelected ? (
            <div
              className="border-t px-4 py-2 text-[11px]"
              style={{ borderColor: C.border, color: C.textTertiary }}
            >
              Click a slot to open or close it. Use the edit icon on open slots for 1:1 or group
              tour settings. Booked slots can&apos;t be closed.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
