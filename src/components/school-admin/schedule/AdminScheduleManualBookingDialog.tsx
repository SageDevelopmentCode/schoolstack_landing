"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, UserPlus, X } from "lucide-react";
import AdminManualGuestRegistrantForm from "@/components/school-admin/schedule/AdminManualGuestRegistrantForm";
import { extractGuestContactEmail } from "@/lib/admissions/admin-manual-guest-contact";
import type { PublicTourFieldDefinition } from "@/lib/admissions/public-tour-settings";
import {
  PUBLIC_TOUR_POST_SUBMIT_ACTION_ID,
} from "@/lib/admissions/public-tour-settings";
import { validatePublicTourAnswers } from "@/lib/admissions/public-tour-validation";
import AdmissionsDatePicker from "@/components/admissions/AdmissionsDatePicker";
import AdmissionsDateTimePicker from "@/components/admissions/AdmissionsDateTimePicker";
import AdmissionsDateTimePickerSkeleton from "@/components/admissions/AdmissionsDateTimePickerSkeleton";
import AdmissionsObservationSlotPicker from "@/components/admissions/AdmissionsObservationSlotPicker";
import type {
  AdminManualBookingApplicationTarget,
  AdminManualBookingContext,
  AdminManualBookingFamilyTarget,
  AdminManualBookingPendingStep,
} from "@/lib/admissions/admin-manual-visit-booking";
import type { BookableAvailabilityResult } from "@/lib/admissions/admissions-booking";
import { formatOrganizationTimezoneLabel } from "@/lib/admissions/admissions-availability";
import { isWholeDayPostSubmitAction } from "@/lib/admissions/application-form-schema";
import { PRE_APPLICATION_CAMPUS_TOUR_ACTION_ID } from "@/lib/organization-settings/apply-auth-entry";
import {
  POST_SUBMIT_ACTION_TEMPLATES,
  resolvedPostSubmitMaxVisitDays,
} from "@/lib/admissions/post-submit-templates";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type AdminScheduleManualBookingDialogProps = {
  C: AdminThemeTokens;
  open: boolean;
  onClose: () => void;
  context: AdminManualBookingContext;
  organizationId: string;
  timezone: string;
  initialDate?: string | null;
  onBooked: () => void;
};

type BookingTarget =
  | {
      kind: "application";
      application: AdminManualBookingApplicationTarget;
      step: AdminManualBookingPendingStep;
    }
  | {
      kind: "family";
      family: AdminManualBookingFamilyTarget;
    }
  | {
      kind: "guest";
      answers: Record<string, unknown>;
      fields: PublicTourFieldDefinition[];
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

export default function AdminScheduleManualBookingDialog({
  C,
  open,
  onClose,
  context,
  organizationId,
  timezone,
  initialDate,
  onBooked,
}: AdminScheduleManualBookingDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [applications, setApplications] = useState<AdminManualBookingApplicationTarget[]>(
    [],
  );
  const [families, setFamilies] = useState<AdminManualBookingFamilyTarget[]>([]);
  const [target, setTarget] = useState<BookingTarget | null>(null);
  const [pendingStepChoice, setPendingStepChoice] =
    useState<AdminManualBookingApplicationTarget | null>(null);

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
  const [guestSchedulingReady, setGuestSchedulingReady] = useState(false);
  const [guestFieldsLoading, setGuestFieldsLoading] = useState(false);
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(false);

  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);

  const resetSchedulingState = useCallback(() => {
    setSelectedDate(initialDate ?? null);
    setSelectedDates(initialDate ? [initialDate] : []);
    setSelectedSlotIds([]);
    setSelectedTime(null);
    setShadowAvailabilityMode(null);
    setError(null);
  }, [initialDate]);

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setApplications([]);
    setFamilies([]);
    setTarget(null);
    setPendingStepChoice(null);
    setSubmitting(false);
    setError(null);
    setGuestSchedulingReady(false);
    setSendConfirmationEmail(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      return;
    }

    let cancelled = false;
    const handle = window.setTimeout(() => {
      void (async () => {
        setSearching(true);
        try {
          const params = new URLSearchParams({
            organizationId,
            context,
            q: trimmed,
            limit: "25",
          });
          const response = await fetch(
            `/api/school-admin/admissions/visits/booking-targets?${params.toString()}`,
          );
          const payload = (await response.json()) as {
            applications?: AdminManualBookingApplicationTarget[];
            families?: AdminManualBookingFamilyTarget[];
            error?: string;
          };
          if (!response.ok) {
            throw new Error(payload.error ?? "Search failed.");
          }
          if (!cancelled) {
            setApplications(payload.applications ?? []);
            setFamilies(payload.families ?? []);
          }
        } catch (err) {
          if (!cancelled) {
            setError(formatActionError(err, "Failed to search families."));
          }
        } finally {
          if (!cancelled) setSearching(false);
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [context, open, organizationId, searchQuery]);

  const showSearchResults = searchQuery.trim().length >= 2;
  const visibleApplications = showSearchResults ? applications : [];
  const visibleFamilies = showSearchResults ? families : [];

  const activeStep = target?.kind === "application" ? target.step : null;
  const isWholeDay = activeStep
    ? isWholeDayPostSubmitAction(activeStep.type)
    : false;
  const isGuestTour = target?.kind === "guest";
  const isFamilyCampusTour = target?.kind === "family" || isGuestTour;
  const isCampusTourTimeSlot =
    isFamilyCampusTour || (activeStep != null && !isWholeDay);

  const maxVisitDays = useMemo(() => {
    if (!activeStep) return 1;
    return resolvedPostSubmitMaxVisitDays({
      id: activeStep.actionId,
      type: activeStep.type,
      enabled: true,
    });
  }, [activeStep]);

  const availabilityEndpointBuilder = useCallback(
    (start: string, end: string) => {
      const params = new URLSearchParams({
        organizationId,
        start,
        end,
      });
      if (isFamilyCampusTour || isGuestTour) {
        params.set("familyCampusTour", "1");
      } else if (target?.kind === "application") {
        params.set("applicationId", target.application.id);
        params.set("actionId", target.step.actionId);
      }
      return `/api/school-admin/admissions/visits/availability?${params.toString()}`;
    },
    [isFamilyCampusTour, isGuestTour, organizationId, target],
  );

  const contactEmailForConfirmation = useMemo(() => {
    if (!target) return null;
    if (target.kind === "family") {
      return target.family.primaryEmail?.trim() || null;
    }
    if (target.kind === "application") {
      return target.application.guardianEmail?.trim() || null;
    }
    if (target.kind === "guest") {
      return extractGuestContactEmail(target.fields, target.answers);
    }
    return null;
  }, [target]);

  useEffect(() => {
    if (!open || !target || isFamilyCampusTour) return;
    if (!activeStep || !isWholeDay) return;

    let cancelled = false;
    async function loadShadowMode() {
      setModeLoading(true);
      setError(null);
      try {
        const { start, end } = currentMonthRange(timezone);
        const response = await fetch(availabilityEndpointBuilder(start, end));
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
  }, [
    activeStep,
    availabilityEndpointBuilder,
    isFamilyCampusTour,
    isWholeDay,
    open,
    target,
    timezone,
  ]);

  function selectApplication(application: AdminManualBookingApplicationTarget) {
    if (application.pendingSteps.length === 1) {
      setTarget({
        kind: "application",
        application,
        step: application.pendingSteps[0]!,
      });
      setGuestSchedulingReady(false);
      setPendingStepChoice(null);
      resetSchedulingState();
      return;
    }
    setPendingStepChoice(application);
  }

  function selectStep(step: AdminManualBookingPendingStep) {
    if (!pendingStepChoice) return;
    setTarget({
      kind: "application",
      application: pendingStepChoice,
      step,
    });
    setGuestSchedulingReady(false);
    setPendingStepChoice(null);
    resetSchedulingState();
  }

  function selectFamily(family: AdminManualBookingFamilyTarget) {
    setTarget({ kind: "family", family });
    setPendingStepChoice(null);
    setGuestSchedulingReady(false);
    resetSchedulingState();
  }

  async function startGuestContact() {
    setError(null);
    setGuestFieldsLoading(true);
    try {
      const response = await fetch(
        `/api/school-admin/admissions/public-tour-settings?organizationId=${encodeURIComponent(organizationId)}`,
      );
      const payload = (await response.json()) as {
        fields?: PublicTourFieldDefinition[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load guest form.");
      }
      setTarget({
        kind: "guest",
        answers: {},
        fields: payload.fields ?? [],
      });
      setGuestSchedulingReady(false);
      setPendingStepChoice(null);
      resetSchedulingState();
    } catch (err) {
      setError(formatActionError(err, "Failed to load guest form."));
    } finally {
      setGuestFieldsLoading(false);
    }
  }

  function continueGuestToScheduling() {
    if (target?.kind !== "guest") return;
    const validation = validatePublicTourAnswers(target.fields, target.answers);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError(null);
    setGuestSchedulingReady(true);
    resetSchedulingState();
  }

  async function handleConfirm() {
    if (!target) return;

    if (isCampusTourTimeSlot) {
      if (!selectedDate || !selectedTime) return;
    } else if (isWholeDay) {
      if (shadowAvailabilityMode === "observation_slot") {
        if (selectedSlotIds.length === 0) return;
      } else if (selectedDates.length === 0) {
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    let responseStatus: number | undefined;
    try {
      const body =
        target.kind === "guest"
          ? {
              organizationId,
              guestAnswers: target.answers,
              scheduledDate: selectedDate,
              startTimeSlot: selectedTime,
              sendConfirmationEmail,
            }
          : target.kind === "family"
            ? {
                organizationId,
                familyId: target.family.id,
                scheduledDate: selectedDate,
                startTimeSlot: selectedTime,
                sendConfirmationEmail,
              }
            : isWholeDay
              ? shadowAvailabilityMode === "observation_slot"
                ? {
                    organizationId,
                    applicationId: target.application.id,
                    actionId: target.step.actionId,
                    slotIds: selectedSlotIds,
                    sendConfirmationEmail,
                  }
                : {
                    organizationId,
                    applicationId: target.application.id,
                    actionId: target.step.actionId,
                    scheduledDates: selectedDates,
                    sendConfirmationEmail,
                  }
              : {
                  organizationId,
                  applicationId: target.application.id,
                  actionId: target.step.actionId,
                  scheduledDate: selectedDate,
                  startTimeSlot: selectedTime,
                  sendConfirmationEmail,
                };

      const response = await fetch("/api/school-admin/admissions/visits/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      responseStatus = response.status;
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to schedule visit.");
      }

      adminToast.success("Visit scheduled");
      onBooked();
      handleClose();
    } catch (err) {
      void reportPortalOperationalError(
        "school_admin",
        {
          organizationId,
          operation: "admissions.manual_visit_book",
          error: "",
        },
        err,
        responseStatus,
      );
      setError(formatActionError(err, "Failed to schedule visit."));
    } finally {
      setSubmitting(false);
    }
  }

  const dialogTitle =
    context === "tours" ? "Book tour or interview" : "Book shadow / observation day";

  const showSchedulingStep =
    target && (target.kind !== "guest" || guestSchedulingReady);

  const canConfirm =
    showSchedulingStep &&
    (isCampusTourTimeSlot
      ? Boolean(selectedDate && selectedTime)
      : isWholeDay
        ? shadowAvailabilityMode === "observation_slot"
          ? selectedSlotIds.length > 0
          : selectedDates.length > 0
        : false) &&
    (!sendConfirmationEmail || Boolean(contactEmailForConfirmation));

  const schedulingTitle =
    target?.kind === "family" || target?.kind === "guest"
      ? POST_SUBMIT_ACTION_TEMPLATES.schedule_campus_tour.label
      : activeStep?.title ?? "";

  const pickerApplicationId =
    target?.kind === "application"
      ? target.application.id
      : target?.kind === "family"
        ? target.family.id
        : target?.kind === "guest"
          ? "guest"
          : "";

  const pickerActionId =
    target?.kind === "application"
      ? target.step.actionId
      : target?.kind === "guest"
        ? PUBLIC_TOUR_POST_SUBMIT_ACTION_ID
        : PRE_APPLICATION_CAMPUS_TOUR_ACTION_ID;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-safe sm:items-center"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
          onClick={handleClose}
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
            aria-labelledby="admin-manual-booking-title"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="admin-manual-booking-title"
                  className="text-lg font-semibold"
                  style={{ color: C.accentDark }}
                >
                  {dialogTitle}
                </h2>
                <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                  Search for a family or application, then choose an open slot on your
                  calendar.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-sm p-1"
                style={{ color: C.textTertiary }}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error ? (
              <p
                className="mb-3 rounded-sm px-3 py-2 text-xs"
                style={{ backgroundColor: C.errorBg, color: C.error }}
                role="alert"
              >
                {error}
              </p>
            ) : null}

            {!target ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: C.textTertiary }}
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by student, family, or email"
                    className="w-full rounded-md border py-2 pl-9 pr-3 text-sm"
                    style={{ borderColor: C.border, color: C.textPrimary }}
                    autoFocus
                  />
                </div>

                {context === "tours" && !pendingStepChoice ? (
                  <div
                    className="flex items-center gap-3 border-t pt-4"
                    style={{ borderColor: C.border }}
                  >
                    <span className="text-xs" style={{ color: C.textTertiary }}>
                      No family in MudKitchen yet?
                    </span>
                    <button
                      type="button"
                      disabled={guestFieldsLoading}
                      onClick={() => void startGuestContact()}
                      className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-2 hover:underline disabled:opacity-60"
                      style={{ color: C.accent }}
                    >
                      <UserPlus className="h-4 w-4" aria-hidden />
                      {guestFieldsLoading ? "Loading…" : "Add guest contact"}
                    </button>
                  </div>
                ) : null}

                {pendingStepChoice ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium" style={{ color: C.textSecondary }}>
                      Choose a step for {pendingStepChoice.studentLabel}
                    </p>
                    {pendingStepChoice.pendingSteps.map((step) => (
                      <button
                        key={step.actionId}
                        type="button"
                        onClick={() => selectStep(step)}
                        className="flex w-full rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-black/[0.02]"
                        style={{ borderColor: C.border, color: C.textPrimary }}
                      >
                        {step.title}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPendingStepChoice(null)}
                      className="text-xs underline-offset-2 hover:underline"
                      style={{ color: C.textSecondary }}
                    >
                      Back to search
                    </button>
                  </div>
                ) : (
                  <>
                    {searching ? (
                      <p className="text-xs" style={{ color: C.textTertiary }}>
                        Searching…
                      </p>
                    ) : null}
                    {showSearchResults &&
                    !searching &&
                    visibleApplications.length === 0 &&
                    visibleFamilies.length === 0 ? (
                      <p className="text-xs" style={{ color: C.textTertiary }}>
                        No matching applications or families with a visit still to schedule.
                      </p>
                    ) : null}

                    {visibleApplications.length > 0 ? (
                      <div className="space-y-2">
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: C.textQuaternary }}
                        >
                          Applications
                        </p>
                        {visibleApplications.map((application) => (
                          <button
                            key={application.id}
                            type="button"
                            onClick={() => selectApplication(application)}
                            className="flex w-full flex-col rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-black/[0.02]"
                            style={{ borderColor: C.border }}
                          >
                            <span className="font-medium" style={{ color: C.textPrimary }}>
                              {application.studentLabel}
                            </span>
                            <span className="text-xs" style={{ color: C.textSecondary }}>
                              {[application.familyName, application.guardianEmail]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                            <span className="mt-0.5 text-[11px]" style={{ color: C.textTertiary }}>
                              {application.pendingSteps.map((step) => step.title).join(", ")}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {context === "tours" && visibleFamilies.length > 0 ? (
                      <div className="space-y-2">
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: C.textQuaternary }}
                        >
                          Campus tour (no application yet)
                        </p>
                        {visibleFamilies.map((family) => (
                          <button
                            key={family.id}
                            type="button"
                            onClick={() => selectFamily(family)}
                            className="flex w-full flex-col rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-black/[0.02]"
                            style={{ borderColor: C.border }}
                          >
                            <span className="font-medium" style={{ color: C.textPrimary }}>
                              {family.name}
                            </span>
                            {family.primaryEmail ? (
                              <span className="text-xs" style={{ color: C.textSecondary }}>
                                {family.primaryEmail}
                              </span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}

            {target?.kind === "guest" && !guestSchedulingReady ? (
              <div className="space-y-4">
                <AdminManualGuestRegistrantForm
                  C={C}
                  fields={target.fields}
                  values={target.answers}
                  onChange={(answers) =>
                    setTarget({ kind: "guest", answers, fields: target.fields })
                  }
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setTarget(null)}
                    className="rounded-md px-3 py-2 text-sm font-medium"
                    style={getAdminButtonStyle(C, "secondary")}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={continueGuestToScheduling}
                    className="rounded-md px-3 py-2 text-sm font-medium"
                    style={getAdminButtonStyle(C, "primary")}
                  >
                    Continue to schedule
                  </button>
                </div>
              </div>
            ) : null}

            {showSchedulingStep && target ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                      {schedulingTitle}
                    </p>
                    <p className="text-xs" style={{ color: C.textSecondary }}>
                      {target.kind === "family"
                        ? target.family.name
                        : target.kind === "guest"
                          ? (typeof target.answers.contact_name === "string"
                              ? target.answers.contact_name
                              : "Guest")
                          : target.application.studentLabel}
                      {" · "}
                      {timezoneLabel}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (target.kind === "guest") {
                        setGuestSchedulingReady(false);
                        resetSchedulingState();
                        return;
                      }
                      setTarget(null);
                      resetSchedulingState();
                    }}
                    className="text-xs underline-offset-2 hover:underline"
                    style={{ color: C.textSecondary }}
                  >
                    {target.kind === "guest" ? "Edit contact" : "Change family"}
                  </button>
                </div>

                {isCampusTourTimeSlot ? (
                  <AdmissionsDateTimePicker
                    C={C}
                    organizationId={organizationId}
                    applicationId={pickerApplicationId}
                    actionId={pickerActionId}
                    availabilityEndpointBuilder={availabilityEndpointBuilder}
                    timezone={timezone}
                    timezoneLabel={timezoneLabel}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onDateChange={setSelectedDate}
                    onTimeChange={setSelectedTime}
                    showGroupTourBadges
                  />
                ) : isWholeDay ? (
                  modeLoading ? (
                    <AdmissionsDateTimePickerSkeleton C={C} />
                  ) : shadowAvailabilityMode === "observation_slot" ? (
                    <AdmissionsObservationSlotPicker
                      C={C}
                      organizationId={organizationId}
                      applicationId={pickerApplicationId}
                      actionId={pickerActionId}
                      availabilityEndpointBuilder={availabilityEndpointBuilder}
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
                      applicationId={pickerApplicationId}
                      actionId={pickerActionId}
                      availabilityEndpointBuilder={availabilityEndpointBuilder}
                      timezone={timezone}
                      timezoneLabel={timezoneLabel}
                      maxVisitDays={maxVisitDays}
                      selectedDates={selectedDates}
                      onDatesChange={setSelectedDates}
                    />
                  )
                ) : null}

                <label
                  className="flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3"
                  style={{ borderColor: C.border, backgroundColor: C.bg }}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded"
                    checked={sendConfirmationEmail}
                    disabled={!contactEmailForConfirmation}
                    onChange={(event) => setSendConfirmationEmail(event.target.checked)}
                  />
                  <span className="text-sm" style={{ color: C.textPrimary }}>
                    <span className="font-medium">Send confirmation email</span>
                    <span className="mt-0.5 block text-xs" style={{ color: C.textSecondary }}>
                      {contactEmailForConfirmation
                        ? `We'll email ${contactEmailForConfirmation} with the visit date, time, and details.`
                        : "Add a contact email to send a confirmation."}
                    </span>
                  </span>
                </label>

                <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: C.border }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-md px-3 py-2 text-sm font-medium"
                    style={getAdminButtonStyle(C, "secondary")}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!canConfirm || submitting}
                    onClick={() => void handleConfirm()}
                    className="rounded-md px-3 py-2 text-sm font-medium disabled:opacity-60"
                    style={getAdminButtonStyle(C, "primary")}
                  >
                    {submitting ? "Scheduling…" : "Confirm booking"}
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
