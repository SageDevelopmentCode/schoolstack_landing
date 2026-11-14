"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, CalendarDays, Check, Loader2 } from "lucide-react";
import AdmissionsDatePicker from "@/components/admissions/AdmissionsDatePicker";
import AdmissionsDateTimePicker from "@/components/admissions/AdmissionsDateTimePicker";
import AdmissionsObservationSlotPicker from "@/components/admissions/AdmissionsObservationSlotPicker";
import AdmissionsDateTimePickerSkeleton from "@/components/admissions/AdmissionsDateTimePickerSkeleton";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import { PortalIsland } from "@/components/school-parent/garden/ParentGardenFrame";
import { gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import {
  formatOrganizationTimezoneLabel,
  formatScheduledVisitWhenLabel,
} from "@/lib/admissions/admissions-availability";
import type { BookableAvailabilityResult } from "@/lib/admissions/admissions-booking";
import type { ShadowDaySchedulingMode } from "@/lib/admissions/admissions-org-settings";
import { isWholeDayPostSubmitAction } from "@/lib/admissions/application-form-schema";
import type { ApplicationPostSubmitTask } from "@/lib/admissions/parent-portal-access";
import { POST_SUBMIT_ACTION_TEMPLATES, resolvedPostSubmitMaxVisitDays } from "@/lib/admissions/post-submit-templates";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { reportApplyOperationalError } from "@/lib/operational-errors-client";
import { parentToast } from "@/lib/school-parent/parent-toast";

type PostSubmitBookingModalProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  organizationId?: string;
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

function shortDay(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/** Tiny "1 Pick → 2 Confirm" progress row for the dialog. */
function BookingSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0" aria-label="Booking steps">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              aria-hidden="true"
              className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] text-[10px] font-extrabold ${
                done
                  ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white"
                  : active
                    ? "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)] text-[var(--sf-clay-deep)]"
                    : "border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)]/45"
              }`}
            >
              {done ? <Check className="h-3 w-3" strokeWidth={3.2} /> : i + 1}
            </span>
            <span
              className={`text-[12px] font-extrabold ${
                active ? "text-[var(--sf-ink)]" : done ? "text-[var(--sf-ink)]/70" : "text-[var(--sf-ink)]/45"
              }`}
            >
              {label}
              <span className="sr-only">{done ? " (done)" : active ? " (current)" : ""}</span>
            </span>
            {i < steps.length - 1 ? (
              <span aria-hidden="true" className="h-[2px] w-5 rounded-full bg-[var(--sf-ink)]/12" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export default function PostSubmitBookingModal({
  C,
  theme,
  organizationId,
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
  const TaskIcon = POST_SUBMIT_ACTION_TEMPLATES[task.type]?.Icon ?? CalendarDays;

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
      queueMicrotask(() =>
        setShadowAvailabilityMode(
          shadowDaySchedulingMode && shadowDaySchedulingMode !== "whole_day"
            ? "observation_slot"
            : "whole_day",
        ),
      );
      return;
    }

    let cancelled = false;

    async function loadShadowMode() {
      setModeLoading(true);
      setError(null);
      let responseStatus: number | undefined;
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
        responseStatus = response.status;
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
        reportApplyOperationalError(organizationId, "admissions.availability.load", err, {
          responseStatus,
          entityType: "application",
          entityId: applicationId,
        });
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
  }, [applicationId, isWholeDay, open, organizationId, previewMode, shadowDaySchedulingMode, task.actionId, timezone]);

  const slotMode = isWholeDay && shadowAvailabilityMode === "observation_slot";

  const canConfirm = isWholeDay
    ? slotMode
      ? selectedSlotIds.length > 0
      : selectedDates.length > 0
    : Boolean(selectedDate && selectedTime);

  const confirmLabel = isWholeDay
    ? slotMode
      ? "Confirm slots"
      : "Confirm days"
    : "Confirm time";

  /** What the family has picked so far, in plain words. */
  const selectionSummary: string | null = isWholeDay
    ? slotMode
      ? selectedSlotIds.length > 0
        ? `${plural(selectedSlotIds.length, "visit slot")} selected`
        : null
      : selectedDates.length > 0
        ? [...selectedDates].sort().map(shortDay).join(" · ")
        : null
    : selectedDate && selectedTime
      ? formatScheduledVisitWhenLabel({
          schedulingMode: "time_slot",
          scheduledDate: selectedDate,
          startTimeSlot: selectedTime,
          durationMinutes: task.durationMinutes,
        })
      : selectedDate
        ? `${shortDay(selectedDate)} · now pick a time`
        : null;

  const steps = isWholeDay
    ? [slotMode ? "Pick visit slots" : "Pick your days", "Confirm"]
    : ["Pick a date", "Pick a time", "Confirm"];
  const currentStep = isWholeDay
    ? canConfirm
      ? 1
      : 0
    : !selectedDate
      ? 0
      : !selectedTime
        ? 1
        : 2;

  const hint = isWholeDay
    ? slotMode
      ? "Choose the visit slots that work for your family."
      : maxVisitDays > 1
        ? `Choose up to ${plural(maxVisitDays, "day")} that work for your family.`
        : "Choose the day that works for your family."
    : "Choose a date, then a time that works for your family.";

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
      parentToast.info("Preview only — nothing was booked", {
        description: "Families see a confirmation here once their visit is scheduled.",
      });
      onBooked();
      onClose();
      setSubmitting(false);
      return;
    }

    const bookedSummary = selectionSummary;
    let responseStatus: number | undefined;
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
      responseStatus = response.status;

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to schedule visit.");
      }

      parentToast.dismiss(`post-submit-booking-error:${task.actionId}`);
      parentToast.success(`${task.title} booked`, {
        description: bookedSummary
          ? `${bookedSummary}. It now shows as done in your required actions.`
          : "It now shows as done in your required actions.",
      });
      onBooked();
      onClose();
    } catch (err) {
      reportApplyOperationalError(organizationId, "admissions.post_submit.schedule", err, {
        responseStatus,
        entityType: "application",
        entityId: applicationId,
      });
      const message = err instanceof Error ? err.message : "Failed to schedule visit.";
      setError(message);
      parentToast.error("We couldn't book that time", {
        id: `post-submit-booking-error:${task.actionId}`,
        description: `${message} Pick another option and try again.`,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GDialog
      theme={theme}
      open={open}
      onClose={onClose}
      size="xl"
      closeDisabled={submitting}
      icon={<TaskIcon />}
      title={task.title}
      description={task.instructions}
      data-testid="post-submit-booking-dialog"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={submitting} className={gBtnOutlineSm}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm || submitting || modeLoading}
            aria-busy={submitting || undefined}
            onClick={() => void handleConfirm()}
            className={gBtnPopSm}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CalendarCheck className="h-4 w-4" aria-hidden />}
            {submitting ? "Scheduling…" : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-[14px] bg-[var(--sf-paper)] px-3.5 py-2.5">
          <BookingSteps steps={steps} current={currentStep} />
        </div>
        <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">{hint}</p>

        <PortalIsland>
          {isWholeDay ? (
            modeLoading ? (
              <AdmissionsDateTimePickerSkeleton C={C} />
            ) : slotMode ? (
              <AdmissionsObservationSlotPicker
                C={C}
                organizationId={organizationId}
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
                organizationId={organizationId}
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
              organizationId={organizationId}
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
        </PortalIsland>

        <div
          aria-live="polite"
          className={`flex items-center gap-3 rounded-[14px] border-[1.5px] px-3.5 py-3 transition-colors ${
            canConfirm
              ? "border-[var(--sf-forest)]/25 bg-[var(--sf-mint)]"
              : "border-dashed border-[var(--sf-ink)]/15 bg-white"
          }`}
        >
          <CalendarCheck
            className={`h-5 w-5 shrink-0 ${canConfirm ? "text-[var(--sf-forest)]" : "text-[var(--sf-ink)]/35"}`}
            aria-hidden
          />
          <p className="m-0 min-w-0 text-[14px] font-bold text-[var(--sf-ink)]/80">
            {selectionSummary ? (
              <>
                <span className="sr-only">Selected: </span>
                {selectionSummary}
              </>
            ) : (
              <span className="font-semibold text-[var(--sf-soft)]">Nothing selected yet</span>
            )}
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="m-0 rounded-[14px] border-[1.5px] border-[#b42318]/25 bg-[#fdecea] px-3.5 py-2.5 text-[13px] font-bold text-[#8a1c12]"
          >
            {error}
          </p>
        ) : null}
      </div>
    </GDialog>
  );
}
