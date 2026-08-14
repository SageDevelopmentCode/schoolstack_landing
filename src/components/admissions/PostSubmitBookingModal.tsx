"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import AdmissionsDatePicker from "@/components/admissions/AdmissionsDatePicker";
import AdmissionsDateTimePicker from "@/components/admissions/AdmissionsDateTimePicker";
import AdmissionsObservationSlotPicker from "@/components/admissions/AdmissionsObservationSlotPicker";
import AdmissionsDateTimePickerSkeleton from "@/components/admissions/AdmissionsDateTimePickerSkeleton";
import { formatOrganizationTimezoneLabel } from "@/lib/admissions/admissions-availability";
import type { BookableAvailabilityResult } from "@/lib/admissions/admissions-booking";
import type { ShadowDaySchedulingMode } from "@/lib/admissions/admissions-org-settings";
import { isWholeDayPostSubmitAction } from "@/lib/admissions/application-form-schema";
import type { ApplicationPostSubmitTask } from "@/lib/admissions/parent-portal-access";
import { resolvedPostSubmitMaxVisitDays } from "@/lib/admissions/post-submit-templates";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type PostSubmitBookingModalProps = {
  C: AdminThemeTokens;
  applicationId: string;
  task: ApplicationPostSubmitTask;
  timezone: string;
  open: boolean;
  onClose: () => void;
  onBooked: () => void;
  previewMode?: boolean;
  shadowDaySchedulingMode?: ShadowDaySchedulingMode;
};

function currentMonthRange(timezone: string): { start: string; end: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
  return { start, end };
}

export default function PostSubmitBookingModal({
  C,
  applicationId,
  task,
  timezone,
  open,
  onClose,
  onBooked,
  previewMode = false,
  shadowDaySchedulingMode,
}: PostSubmitBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [shadowAvailabilityMode, setShadowAvailabilityMode] = useState<
    "whole_day" | "observation_slot" | null
  >(null);
  const [modeLoading, setModeLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);
  const isWholeDay = isWholeDayPostSubmitAction(task.type);
  const maxVisitDays = resolvedPostSubmitMaxVisitDays({
    id: task.actionId,
    type: task.type,
    enabled: true,
    maxVisitDays: task.maxVisitDays,
  });

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        setSelectedDate(null);
        setSelectedDates([]);
        setSelectedSlotIds([]);
        setSelectedTime(null);
        setShadowAvailabilityMode(null);
        setSubmitting(false);
        setError(null);
      });
      return;
    }

    if (!isWholeDay) return;

    if (previewMode) {
      setShadowAvailabilityMode(
        shadowDaySchedulingMode && shadowDaySchedulingMode !== "whole_day"
          ? "observation_slot"
          : "whole_day",
      );
      return;
    }

    let cancelled = false;

    async function loadShadowMode() {
      setModeLoading(true);
      setError(null);
      try {
        const { start, end } = currentMonthRange(timezone);
        const params = new URLSearchParams({
          actionId: task.actionId,
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
        if (!cancelled) {
          setShadowAvailabilityMode(
            payload.mode === "observation_slot" ? "observation_slot" : "whole_day",
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load availability.");
        }
      } finally {
        if (!cancelled) setModeLoading(false);
      }
    }

    void loadShadowMode();
    return () => {
      cancelled = true;
    };
  }, [applicationId, isWholeDay, open, previewMode, shadowDaySchedulingMode, task.actionId, timezone]);

  async function handleConfirm() {
    if (isWholeDay) {
      if (shadowAvailabilityMode === "observation_slot") {
        if (selectedSlotIds.length === 0) return;
      } else if (selectedDates.length === 0) {
        return;
      }
    } else if (!selectedDate || !selectedTime) {
      return;
    }

    setSubmitting(true);
    setError(null);

    if (previewMode) {
      onBooked();
      onClose();
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/admissions/applications/${applicationId}/post-submit/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isWholeDay
              ? shadowAvailabilityMode === "observation_slot"
                ? {
                    actionId: task.actionId,
                    slotIds: selectedSlotIds,
                  }
                : {
                    actionId: task.actionId,
                    scheduledDates: selectedDates,
                  }
              : {
                  actionId: task.actionId,
                  scheduledDate: selectedDate,
                  startTimeSlot: selectedTime,
                },
          ),
        },
      );

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to schedule visit.");
      }

      onBooked();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule visit.");
    } finally {
      setSubmitting(false);
    }
  }

  const canConfirm = isWholeDay
    ? shadowAvailabilityMode === "observation_slot"
      ? selectedSlotIds.length > 0
      : selectedDates.length > 0
    : Boolean(selectedDate && selectedTime);

  const confirmLabel = isWholeDay
    ? shadowAvailabilityMode === "observation_slot"
      ? "Confirm slots"
      : "Confirm days"
    : "Confirm time";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-safe sm:items-center"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border p-5 shadow-xl sm:p-6"
            style={{
              borderColor: C.border,
              backgroundColor: "#FFFFFF",
              color: C.textPrimary,
            }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-submit-booking-title"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="post-submit-booking-title"
                  className="text-lg font-semibold"
                  style={{ color: C.accentDark }}
                >
                  {task.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                  {task.instructions}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm p-1"
                style={{ color: C.textTertiary }}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isWholeDay ? (
              modeLoading ? (
                <AdmissionsDateTimePickerSkeleton C={C} />
              ) : shadowAvailabilityMode === "observation_slot" ? (
                <AdmissionsObservationSlotPicker
                  C={C}
                  applicationId={applicationId}
                  actionId={task.actionId}
                  timezone={timezone}
                  timezoneLabel={timezoneLabel}
                  maxVisitDays={maxVisitDays}
                  selectedSlotIds={selectedSlotIds}
                  onSlotIdsChange={setSelectedSlotIds}
                />
              ) : (
                <AdmissionsDatePicker
                  C={C}
                  applicationId={applicationId}
                  actionId={task.actionId}
                  timezone={timezone}
                  timezoneLabel={timezoneLabel}
                  maxVisitDays={maxVisitDays}
                  selectedDates={selectedDates}
                  onDatesChange={setSelectedDates}
                />
              )
            ) : (
              <AdmissionsDateTimePicker
                C={C}
                applicationId={applicationId}
                actionId={task.actionId}
                timezone={timezone}
                timezoneLabel={timezoneLabel}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateChange={setSelectedDate}
                onTimeChange={setSelectedTime}
              />
            )}

            {error ? (
              <p
                className="mt-4 rounded-sm px-3 py-2 text-xs"
                style={{ backgroundColor: C.errorBg, color: C.error }}
              >
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border px-4 py-2.5 text-sm font-medium"
                style={{ borderColor: C.border, color: C.textSecondary }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canConfirm || submitting || modeLoading}
                onClick={() => void handleConfirm()}
                className="rounded-md px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-60"
                style={{ backgroundColor: C.accent }}
              >
                {submitting ? "Scheduling…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
