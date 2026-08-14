"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdmissionsDateTimePickerSkeleton from "@/components/admissions/AdmissionsDateTimePickerSkeleton";
import type { BookableAvailabilityResult } from "@/lib/admissions/admissions-booking";
import {
  formatDateOnlyLabel,
  todayKeyInTimezone,
  todayMonthYearInTimezone,
} from "@/lib/admissions/admissions-availability";
import { MONTH_NAMES } from "@/lib/demo-scheduler";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type AdmissionsObservationSlotPickerProps = {
  C: AdminThemeTokens;
  applicationId: string;
  actionId: string;
  timezone: string;
  timezoneLabel: string;
  maxVisitDays: number;
  selectedSlotIds: string[];
  onSlotIdsChange: (slotIds: string[]) => void;
};

function monthDateRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDay = new Date(endYear, endMonth + 1, 0).getDate();
  const end = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
  return { start, end };
}

export default function AdmissionsObservationSlotPicker({
  C,
  applicationId,
  actionId,
  timezone,
  timezoneLabel,
  maxVisitDays,
  selectedSlotIds,
  onSlotIdsChange,
}: AdmissionsObservationSlotPickerProps) {
  const initial = todayMonthYearInTimezone(timezone);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [bookableSlots, setBookableSlots] = useState<
    Extract<BookableAvailabilityResult, { mode: "observation_slot" }>["bookableSlots"]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selectedSlotIds), [selectedSlotIds]);
  const atMaxSelection = selectedSlotIds.length >= maxVisitDays;

  const loadAvailability = useCallback(async () => {
    const { start, end } = monthDateRange(viewYear, viewMonth);
    const params = new URLSearchParams({
      actionId,
      start,
      end,
    });

    const response = await fetch(
      `/api/admissions/applications/${applicationId}/post-submit/availability?${params.toString()}`,
    );
    const payload = (await response.json()) as BookableAvailabilityResult & {
      error?: string;
    };

    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to load availability.");
    }

    if (payload.mode !== "observation_slot") {
      throw new Error("Unexpected availability mode.");
    }

    setBookableSlots(payload.bookableSlots);
  }, [actionId, applicationId, viewMonth, viewYear]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);
      try {
        await loadAvailability();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load availability.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [loadAvailability]);

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, typeof bookableSlots>();
    for (const slot of bookableSlots) {
      const existing = grouped.get(slot.date) ?? [];
      existing.push(slot);
      grouped.set(slot.date, existing);
    }
    return grouped;
  }, [bookableSlots]);

  const visibleDates = useMemo(
    () => [...slotsByDate.keys()].sort(),
    [slotsByDate],
  );

  function toggleSlot(slotId: string) {
    if (selectedSet.has(slotId)) {
      onSlotIdsChange(selectedSlotIds.filter((entry) => entry !== slotId));
      return;
    }

    if (atMaxSelection) return;
    onSlotIdsChange([...selectedSlotIds, slotId]);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
  }

  if (loading) {
    return <AdmissionsDateTimePickerSkeleton C={C} />;
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
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: C.textTertiary }}>
              {timezoneLabel}
            </p>
          </div>
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

        <p className="mb-3 text-xs font-medium" style={{ color: C.textSecondary }}>
          {selectedSlotIds.length} of {maxVisitDays} slot{maxVisitDays === 1 ? "" : "s"} selected
        </p>

        {visibleDates.length === 0 ? (
          <p className="py-8 text-center text-xs" style={{ color: C.textTertiary }}>
            No open shadow visit slots this month for your applicant&apos;s grade.
          </p>
        ) : (
          <div className="space-y-4">
            {visibleDates.map((date) => (
              <div key={date}>
                <p className="mb-2 text-xs font-semibold" style={{ color: C.textPrimary }}>
                  {formatDateOnlyLabel(date)}
                </p>
                <div className="space-y-2">
                  {(slotsByDate.get(date) ?? []).map((slot) => {
                    const selected = selectedSet.has(slot.id);
                    const disabled = !selected && atMaxSelection;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleSlot(slot.id)}
                        className="flex w-full items-start justify-between gap-3 rounded-sm border px-3 py-2 text-left transition disabled:opacity-50"
                        style={{
                          borderColor: selected ? C.accent : C.border,
                          backgroundColor: selected ? C.accentLight : "#FFFFFF",
                        }}
                      >
                        <span>
                          <span
                            className="block text-xs font-medium"
                            style={{ color: C.textPrimary }}
                          >
                            {slot.label}
                          </span>
                          {slot.startTime !== "ALL_DAY" ? (
                            <span
                              className="mt-0.5 block text-[11px]"
                              style={{ color: C.textTertiary }}
                            >
                              {slot.endTime
                                ? `${slot.startTime} – ${slot.endTime}`
                                : slot.startTime}
                            </span>
                          ) : null}
                        </span>
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: selected ? C.accentDark : C.textTertiary }}
                        >
                          {selected ? "Selected" : "Select"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs leading-relaxed" style={{ color: C.textTertiary }}>
        Select 1 to {maxVisitDays} open slot{maxVisitDays === 1 ? "" : "s"} for your
        applicant&apos;s grade.
        {atMaxSelection ? " You have reached the maximum for this visit." : null}
      </p>
    </div>
  );
}
