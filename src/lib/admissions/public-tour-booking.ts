import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AdmissionsBookingError,
  throwIfAdmissionsVisitSlotUnavailable,
} from "./admissions-booking";
import {
  getOrganizationTimezone,
  listAdmissionsAvailabilitySlotRecords,
} from "./admissions-availability";
import { getAdmissionsOrgSettings } from "./admissions-org-settings";
import {
  defaultFamilyCampusTourAction,
  FAMILY_TOUR_ACTION_TYPE,
} from "./family-tour-booking";
import {
  computePublicTourAvailability,
  isPublicTourSlotBookable,
  type PublicTourAvailabilityResult,
  type PublicTourVisitForAvailability,
} from "./public-tour-availability";
import {
  isPublicTourEnabled,
  parsePublicTourPageSettings,
  PUBLIC_TOUR_POST_SUBMIT_ACTION_ID,
  resolvePublicTourFields,
  type PublicTourRegistrant,
} from "./public-tour-settings";
import { resolvedPostSubmitDurationMinutes } from "./post-submit-templates";
import { validatePublicTourAnswers } from "./public-tour-validation";

export { PUBLIC_TOUR_POST_SUBMIT_ACTION_ID };

const VISIT_AVAILABILITY_SELECT =
  "action_type, scheduling_mode, scheduled_date, start_time_slot, duration_minutes, status";

export async function listPublicTourVisitsForAvailability(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<PublicTourVisitForAvailability[]> {
  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .select(VISIT_AVAILABILITY_SELECT)
    .eq("organization_id", organizationId)
    .eq("status", "scheduled")
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    actionType: String(row.action_type),
    schedulingMode: row.scheduling_mode === "whole_day" ? "whole_day" : "time_slot",
    scheduledDate: String(row.scheduled_date),
    startTimeSlot: String(row.start_time_slot),
    durationMinutes: Number(row.duration_minutes),
    status: String(row.status),
  }));
}

export async function getPublicTourBookableAvailability(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<PublicTourAvailabilityResult & { timezone: string }> {
  const [slotRecords, visits, timezone] = await Promise.all([
    listAdmissionsAvailabilitySlotRecords(
      supabase,
      organizationId,
      startDate,
      endDate,
    ),
    listPublicTourVisitsForAvailability(
      supabase,
      organizationId,
      startDate,
      endDate,
    ),
    getOrganizationTimezone(supabase, organizationId),
  ]);

  const availability = computePublicTourAvailability({
    slotRecords,
    visits,
    startDate,
    endDate,
  });

  return { ...availability, timezone };
}

export async function assertPublicTourBookingEnabled(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<void> {
  const settings = await getAdmissionsOrgSettings(supabase, organizationId);
  if (!isPublicTourEnabled(settings.publicTour ?? {})) {
    throw new AdmissionsBookingError(
      "Public tour booking is not available for this school.",
      "not_enabled",
    );
  }
}

export async function bookPublicCampusTour(
  supabase: SupabaseClient,
  params: {
    organizationId: string;
    scheduledDate: string;
    startTimeSlot: string;
    answers: Record<string, unknown>;
  },
): Promise<{
  visitId: string;
  scheduledDate: string;
  startTimeSlot: string;
  durationMinutes: number;
  registrant: PublicTourRegistrant;
}> {
  await assertPublicTourBookingEnabled(supabase, params.organizationId);

  const admissionsSettings = await getAdmissionsOrgSettings(
    supabase,
    params.organizationId,
  );
  const publicTourSettings = parsePublicTourPageSettings(
    admissionsSettings.publicTour,
  );
  const fields = resolvePublicTourFields(publicTourSettings);
  const validation = validatePublicTourAnswers(fields, params.answers);
  if (!validation.ok) {
    throw new AdmissionsBookingError(validation.error, "invalid_request");
  }

  const action = defaultFamilyCampusTourAction();
  const durationMinutes = resolvedPostSubmitDurationMinutes(action);

  const [slotRecords, visits] = await Promise.all([
    listAdmissionsAvailabilitySlotRecords(
      supabase,
      params.organizationId,
      params.scheduledDate,
      params.scheduledDate,
    ),
    listPublicTourVisitsForAvailability(
      supabase,
      params.organizationId,
      params.scheduledDate,
      params.scheduledDate,
    ),
  ]);

  if (
    !isPublicTourSlotBookable({
      slotRecords,
      visits,
      scheduledDate: params.scheduledDate,
      startTimeSlot: params.startTimeSlot,
      durationMinutes,
    })
  ) {
    throw new AdmissionsBookingError(
      "That time is no longer available. Please choose another slot.",
      "slot_unavailable",
    );
  }

  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .insert({
      organization_id: params.organizationId,
      application_id: null,
      family_id: null,
      post_submit_action_id: PUBLIC_TOUR_POST_SUBMIT_ACTION_ID,
      action_type: FAMILY_TOUR_ACTION_TYPE,
      booking_source: "public",
      scheduling_mode: "time_slot",
      scheduled_date: params.scheduledDate,
      start_time_slot: params.startTimeSlot,
      duration_minutes: durationMinutes,
      status: "scheduled",
      registrant: validation.registrant,
    })
    .select("id")
    .single();

  if (error) {
    throwIfAdmissionsVisitSlotUnavailable(error);
    throw error;
  }

  return {
    visitId: String(data.id),
    scheduledDate: params.scheduledDate,
    startTimeSlot: params.startTimeSlot,
    durationMinutes,
    registrant: validation.registrant,
  };
}

export async function updatePublicTourPageSettingsForOrg(
  supabase: SupabaseClient,
  organizationId: string,
  patch: {
    headline?: string;
    intro?: string;
    fields?: ReturnType<typeof resolvePublicTourFields>;
  },
): Promise<void> {
  const current = await getAdmissionsOrgSettings(supabase, organizationId);
  const existing = parsePublicTourPageSettings(current.publicTour);

  const next = {
    ...existing,
    ...(patch.headline !== undefined ? { headline: patch.headline } : {}),
    ...(patch.intro !== undefined ? { intro: patch.intro } : {}),
    ...(patch.fields !== undefined ? { fields: patch.fields } : {}),
  };

  const { error } = await supabase
    .from("organization_settings")
    .update({
      admissions: {
        ...current,
        publicTour: next,
      },
    })
    .eq("organization_id", organizationId);

  if (error) throw error;
}
