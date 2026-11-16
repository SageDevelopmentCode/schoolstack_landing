"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DetailButton } from "@/components/school-admin/admissions/detail-garden";
import { CalendarPlus, Loader2, Pencil } from "lucide-react";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { GardenNotice, gIconBtn } from "@/components/school-admin/garden/kit";
import {
  GARDEN_AVAILABILITY_PANEL,
  GARDEN_SLOT_BUTTON,
  GardenAvailabilityEmpty,
  GardenAvailabilityFooter,
  GardenAvailabilityHeader,
  gardenSlotClasses,
} from "@/components/school-admin/schedule/garden/availability-garden";
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
  campusTourAvailabilitySlotKeys,
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
import AdminScheduleManualBookingDialog from "@/components/school-admin/schedule/AdminScheduleManualBookingDialog";
import { useOptionalScheduleVisitsContext } from "@/components/school-admin/schedule/schedule-visits-context";
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
  /** When set, render these slots and skip Supabase availability loads. */
  previewSlots?: readonly AdmissionsAvailabilitySlotRecord[];
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

function previewRecordsInRange(
  records: readonly AdmissionsAvailabilitySlotRecord[] | undefined,
  start: string,
  end: string,
): AdmissionsAvailabilitySlotRecord[] {
  if (!records) return [];
  return records.filter((record) => record.date >= start && record.date <= end);
}

function slotsFromPreview(
  records: readonly AdmissionsAvailabilitySlotRecord[] | undefined,
): Set<AdmissionsAvailabilitySlotKey> {
  return new Set(
    (records ?? []).map((record) => availabilitySlotKey(record.date, record.timeSlot)),
  );
}

function recordsFromPreview(
  records: readonly AdmissionsAvailabilitySlotRecord[] | undefined,
): Map<AdmissionsAvailabilitySlotKey, AdmissionsAvailabilitySlotRecord> {
  return new Map(
    (records ?? []).map((record) => [
      availabilitySlotKey(record.date, record.timeSlot),
      record,
    ]),
  );
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
  previewSlots,
}: AdmissionsAvailabilityEditorProps) {
  const skin = useAdminGardenSkin();
  const skinRef = useRef(skin);
  useEffect(() => {
    skinRef.current = skin;
  }, [skin]);
  const supabase = useMemo(() => createClient(), []);
  const [openSlots, setOpenSlots] = useState<Set<AdmissionsAvailabilitySlotKey>>(
    () => slotsFromPreview(previewSlots),
  );
  const [slotRecords, setSlotRecords] = useState<
    Map<AdmissionsAvailabilitySlotKey, AdmissionsAvailabilitySlotRecord>
  >(() => recordsFromPreview(previewSlots));
  const [occupiedSlots, setOccupiedSlots] = useState<Set<AdmissionsAvailabilitySlotKey>>(new Set());
  const [loading, setLoading] = useState(previewSlots == null);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<AdmissionsTimeSlotPeriod>("morning");
  const [slotSettingsTime, setSlotSettingsTime] = useState<string | null>(null);
  const [manualBookingOpen, setManualBookingOpen] = useState(false);
  const visitsContext = useOptionalScheduleVisitsContext();
  const onMonthSlotCountChangeRef = useRef(onMonthSlotCountChange);

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

  const previewMonthData = useMemo(() => {
    if (previewSlots == null) return null;
    const inMonth = previewRecordsInRange(previewSlots, monthRange.start, monthRange.end);
    return {
      openSlots: slotsFromPreview(inMonth),
      slotRecords: recordsFromPreview(inMonth),
      occupiedSlots: new Set<AdmissionsAvailabilitySlotKey>(),
      monthSlotCount: inMonth.length,
    };
  }, [previewSlots, monthRange.end, monthRange.start]);

  const resolvedOpenSlots = previewMonthData?.openSlots ?? openSlots;
  const resolvedSlotRecords = previewMonthData?.slotRecords ?? slotRecords;
  const resolvedOccupiedSlots = previewMonthData?.occupiedSlots ?? occupiedSlots;

  useEffect(() => {
    onMonthSlotCountChangeRef.current = onMonthSlotCountChange;
  }, [onMonthSlotCountChange]);

  useEffect(() => {
    if (previewMonthData == null) return;
    onMonthSlotCountChangeRef.current?.(previewMonthData.monthSlotCount);
  }, [previewMonthData]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const loadMonthData = useCallback(async () => {
    const seeded = previewSlots;
    if (seeded) {
      const inMonth = previewRecordsInRange(seeded, monthRange.start, monthRange.end);
      setOpenSlots(slotsFromPreview(inMonth));
      setSlotRecords(recordsFromPreview(inMonth));
      setOccupiedSlots(new Set());
      onMonthSlotCountChangeRef.current?.(inMonth.length);
      return;
    }

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
  }, [monthRange.end, monthRange.start, organizationId, previewSlots, supabase]);

  useEffect(() => {
    if (previewSlots) {
      return;
    }

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
  }, [loadMonthData, organizationId, previewSlots]);

  useEffect(() => {
    if (!previewSlots?.length) return;
    const nextDate = previewSlots
      .map((record) => record.date)
      .filter(
        (date) => date >= monthRange.start && date <= monthRange.end && date >= today,
      )
      .sort()[0];
    if (!nextDate) return;
    // Run after useScheduleCalendar clears the selection on mount.
    queueMicrotask(() => {
      queueMicrotask(() => {
        setSelectedDate((current) => current ?? nextDate);
      });
    });
  }, [monthRange.end, monthRange.start, previewSlots, setSelectedDate, today]);

  const availableDates = useMemo(
    () => new Set([...resolvedOpenSlots].map((key) => key.split("|")[0])),
    [resolvedOpenSlots],
  );

  const bookedDates = useMemo(
    () => occupiedSlotKeysToBookedDates(resolvedOccupiedSlots),
    [resolvedOccupiedSlots],
  );

  const wholeDayGroupState = wholeDayGroupStateFromSlots(
    resolvedOpenSlots,
    selectedDate,
    resolvedSlotRecords,
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
        if (isOpen) {
          next.delete(key);
        } else {
          for (const openKey of campusTourAvailabilitySlotKeys(selectedDate, timeSlot)) {
            next.add(openKey);
          }
        }
        return next;
      });

      const count = await countAdmissionsAvailabilitySlotsInMonth(
        supabase,
        organizationId,
        viewYear,
        viewMonth,
      );
      onMonthSlotCountChangeRef.current?.(count);
      if (skinRef.current) {
        adminToast.dismiss(`slot-toggle-error-${timeSlot}`);
        adminToast.success(isOpen ? `${timeSlot} closed.` : `${timeSlot} opened.`, {
          id: "slot-toggle",
          description: `${formatSelectedDate(selectedDate)} · ${
            isOpen ? "families can't book it anymore" : "families can book it now"
          }. ${count} open ${count === 1 ? "slot" : "slots"} this month.`,
        });
      } else {
        adminToast.success(isOpen ? "Slot closed" : "Slot opened");
      }
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "admissions.availability.toggle_slot",
        error: "",
      }, err);
      const message = formatActionError(err, "Failed to update slot.");
      setError(message);
      if (skinRef.current) {
        adminToast.error(isOpen ? `Couldn't close ${timeSlot}.` : `Couldn't open ${timeSlot}.`, {
          id: `slot-toggle-error-${timeSlot}`,
          description: `${message} The slot is still ${isOpen ? "open" : "closed"}.`,
          action: { label: "Retry", onClick: () => void toggleSlotRef.current(timeSlot) },
        });
      } else {
        adminToast.error(message);
      }
    } finally {
      setToggling(null);
    }
  }

  const toggleSlotRef = useRef(toggleSlot);
  useEffect(() => {
    toggleSlotRef.current = toggleSlot;
  });

  const canEditSelected = selectedDate !== null && selectedDate >= today && !readOnly;

  const activePeriodGroup =
    ADMISSIONS_TIME_SLOT_GROUPS.find((group) => group.id === activePeriod) ??
    ADMISSIONS_TIME_SLOT_GROUPS[0];

  const openCountForPeriod = useCallback(
    (period: AdmissionsTimeSlotPeriod) => {
      if (!selectedDate) return 0;
      const group = ADMISSIONS_TIME_SLOT_GROUPS.find((entry) => entry.id === period);
      if (!group) return 0;
      return group.slots.filter((slot) =>
        resolvedOpenSlots.has(availabilitySlotKey(selectedDate, slot)),
      ).length;
    },
    [resolvedOpenSlots, selectedDate],
  );

  const displayError = error ?? timezoneError;

  const handleManualBooked = useCallback(() => {
    void loadMonthData();
    void visitsContext?.refetchVisits();
  }, [loadMonthData, visitsContext]);

  if (loading) {
    return <SchoolAdminCalendarSkeleton C={C} compactLayout={compactLayout} label="Loading availability" />;
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

      {!readOnly && previewSlots == null ? (
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
              kicker="Time slots"
              title={selectedDate ? formatSelectedDate(selectedDate) : "Pick a day"}
              meta={selectedDate ? `${timezoneLabel} · ${resolvedOpenSlots.size > 0 ? `${[...resolvedOpenSlots].filter((k) => k.startsWith(selectedDate)).length} open` : "none open"}` : "Select a date to manage slots"}
            />
          ) : (
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
          )}

          <div className="flex-1 overflow-y-auto p-3">
            {!selectedDate ? (
              skin ? (
                <GardenAvailabilityEmpty>Select a date on the calendar</GardenAvailabilityEmpty>
              ) : (
              <p className="py-6 text-center text-xs" style={{ color: C.textTertiary }}>
                Select a date on the calendar
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
                    const isOpen = resolvedOpenSlots.has(slotKey);
                    const isBooked = resolvedOccupiedSlots.has(slotKey);
                    const record = resolvedSlotRecords.get(slotKey);
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

                    if (skin) {
                      const tone = gardenSlotClasses({ open: isOpen, booked: isBooked, group: isGroup });
                      const busy = toggling === slot;
                      const stateLabel = isBooked ? "Booked" : isOpen ? (isGroup ? "Group" : "Open") : "Closed";
                      return (
                        <div key={slot} className={`flex h-10 overflow-hidden rounded-[12px] border-[1.5px] transition-colors ${tone.row}`}>
                          <button
                            type="button"
                            disabled={disabled}
                            aria-pressed={isOpen}
                            aria-busy={busy || undefined}
                            aria-label={`${slot}, ${stateLabel.toLowerCase()}.${
                              isBooked && isOpen ? " Booked slots can't be closed." : isOpen ? " Close this slot." : " Open this slot."
                            }`}
                            onClick={() => toggleSlot(slot)}
                            className={`${GARDEN_SLOT_BUTTON} ${tone.text} ${readOnly ? "" : "cursor-pointer"}`}
                          >
                            <span className="tabular-nums">{slot}</span>
                            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.08em]">
                              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
                              {busy ? (isOpen ? "Closing…" : "Opening…") : stateLabel}
                            </span>
                          </button>
                          {isOpen && !readOnly ? (
                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => setSlotSettingsTime(slot)}
                              className={`${gIconBtn} !h-auto !w-10 !rounded-none !border-0 !border-l-[1.5px] !border-inherit !bg-transparent ${tone.text}`}
                              aria-label={`Tour settings for ${slot}`}
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden />
                            </button>
                          ) : null}
                        </div>
                      );
                    }

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
                    record={resolvedSlotRecords.get(
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
            skin ? (
              <GardenAvailabilityFooter>
                Click a slot to open or close it. Use the edit icon on open slots for 1:1 or group
                tour settings. Booked slots can&apos;t be closed.
              </GardenAvailabilityFooter>
            ) : (
            <div
              className="border-t px-4 py-2 text-[11px]"
              style={{ borderColor: C.border, color: C.textTertiary }}
            >
              Click a slot to open or close it. Use the edit icon on open slots for 1:1 or group
              tour settings. Booked slots can&apos;t be closed.
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
          context="tours"
          organizationId={organizationId}
          timezone={timezone}
          initialDate={selectedDate}
          onBooked={handleManualBooked}
        />
      ) : null}
    </div>
  );
}
