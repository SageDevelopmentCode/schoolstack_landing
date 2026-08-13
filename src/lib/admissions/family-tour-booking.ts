import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AdmissionsBookingError,
  getBookableAvailabilityForAction,
  type ScheduledVisitRecord,
} from "./admissions-booking";
import {
  parseApplicationFormPostSubmitConfig,
  type PostSubmitAction,
} from "./application-form-schema";
import { PRE_APPLICATION_CAMPUS_TOUR_ACTION_ID } from "@/lib/organization-settings/apply-auth-entry";
import { POST_SUBMIT_ACTION_TEMPLATES } from "./post-submit-templates";
import { resolvedPostSubmitDurationMinutes } from "./post-submit-templates";

export const FAMILY_TOUR_ACTION_TYPE = "schedule_campus_tour";

export const PRE_ENROLLMENT_APPLICATION_STATUSES = [
  "submitted",
  "under_review",
  "accepted",
] as const;

export type PreEnrollmentApplicationStatus =
  (typeof PRE_ENROLLMENT_APPLICATION_STATUSES)[number];

export type TourBookingApplicationSummary = {
  id: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  postSubmitTasks: Array<{
    type: string;
    status: string;
    title?: string;
    booking?: {
      schedulingMode?: "time_slot" | "whole_day";
      scheduledDate: string;
      startTimeSlot: string;
      durationMinutes: number;
    };
  }>;
};

export function isPreEnrollmentApplicationStatus(
  status: string,
): status is PreEnrollmentApplicationStatus {
  return (PRE_ENROLLMENT_APPLICATION_STATUSES as readonly string[]).includes(
    status,
  );
}

export function hasPreEnrollmentApplication(
  applications: TourBookingApplicationSummary[],
): boolean {
  return applications.some((application) =>
    isPreEnrollmentApplicationStatus(application.status),
  );
}

export function hasPendingPostSubmitCampusTour(
  applications: TourBookingApplicationSummary[],
): boolean {
  return applications.some(
    (application) =>
      application.status !== "draft" &&
      application.postSubmitTasks.some(
        (task) =>
          task.type === FAMILY_TOUR_ACTION_TYPE && task.status === "pending",
      ),
  );
}

export function findTourAttachableApplication(
  applications: TourBookingApplicationSummary[],
): TourBookingApplicationSummary | null {
  const eligible = applications.filter((application) =>
    isPreEnrollmentApplicationStatus(application.status),
  );
  if (eligible.length === 0) return null;

  return [...eligible].sort((a, b) => {
    const aTime = a.submittedAt ?? a.createdAt;
    const bTime = b.submittedAt ?? b.createdAt;
    return bTime.localeCompare(aTime);
  })[0];
}

export function shouldOfferApplyPortalTourBooking(params: {
  tourEntryEnabled: boolean;
  applications: TourBookingApplicationSummary[];
  hasScheduledCampusTour: boolean;
}): boolean {
  if (!params.tourEntryEnabled) return false;
  if (params.hasScheduledCampusTour) return false;
  if (hasPendingPostSubmitCampusTour(params.applications)) return false;
  return hasPreEnrollmentApplication(params.applications);
}

export function listUpcomingCampusToursFromApplications(
  applications: TourBookingApplicationSummary[],
): FamilyScheduledVisit[] {
  const visits: FamilyScheduledVisit[] = [];

  for (const application of applications) {
    if (!isPreEnrollmentApplicationStatus(application.status)) continue;

    for (const task of application.postSubmitTasks) {
      if (
        task.type !== FAMILY_TOUR_ACTION_TYPE ||
        task.status !== "scheduled" ||
        !task.booking
      ) {
        continue;
      }

      visits.push({
        id: `application:${application.id}`,
        actionType: FAMILY_TOUR_ACTION_TYPE,
        title:
          task.title?.trim() ||
          POST_SUBMIT_ACTION_TEMPLATES.schedule_campus_tour.label,
        schedulingMode:
          task.booking.schedulingMode === "whole_day" ? "whole_day" : "time_slot",
        scheduledDate: task.booking.scheduledDate,
        startTimeSlot: task.booking.startTimeSlot,
        durationMinutes: task.booking.durationMinutes,
      });
    }
  }

  return visits;
}

export function defaultFamilyCampusTourAction(): PostSubmitAction {
  return {
    id: PRE_APPLICATION_CAMPUS_TOUR_ACTION_ID,
    type: FAMILY_TOUR_ACTION_TYPE,
    enabled: true,
    instructions: POST_SUBMIT_ACTION_TEMPLATES.schedule_campus_tour.defaultInstructions,
  };
}

export async function familyHasPreApplicationCampusTour(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .eq("action_type", FAMILY_TOUR_ACTION_TYPE)
    .is("application_id", null)
    .eq("status", "scheduled")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function bookFamilyCampusTour(
  supabase: SupabaseClient,
  params: {
    organizationId: string;
    familyId: string;
    scheduledDate: string;
    startTimeSlot: string;
  },
): Promise<ScheduledVisitRecord> {
  const action = defaultFamilyCampusTourAction();
  const durationMinutes = resolvedPostSubmitDurationMinutes(action);

  const availability = await getBookableAvailabilityForAction(
    supabase,
    params.organizationId,
    action,
    params.scheduledDate,
    params.scheduledDate,
  );

  if (availability.mode !== "time_slot") {
    throw new AdmissionsBookingError(
      "Campus tours use time slots.",
      "invalid_request",
    );
  }

  const bookableStarts = availability.availability[params.scheduledDate] ?? [];
  if (!bookableStarts.includes(params.startTimeSlot)) {
    throw new AdmissionsBookingError(
      "That time is no longer available. Please choose another slot.",
      "slot_unavailable",
    );
  }

  const { data: familyApplications, error: applicationsError } = await supabase
    .from("applications")
    .select("id")
    .eq("organization_id", params.organizationId)
    .eq("family_id", params.familyId);

  if (applicationsError) throw applicationsError;

  const applicationIds = (familyApplications ?? []).map((row) => String(row.id));
  const existing = await familyHasScheduledCampusTour(
    supabase,
    params.organizationId,
    params.familyId,
    applicationIds,
  );
  if (existing) {
    throw new AdmissionsBookingError(
      "Your family already has a campus tour scheduled.",
      "already_scheduled",
    );
  }

  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .insert({
      organization_id: params.organizationId,
      family_id: params.familyId,
      application_id: null,
      post_submit_action_id: PRE_APPLICATION_CAMPUS_TOUR_ACTION_ID,
      action_type: FAMILY_TOUR_ACTION_TYPE,
      scheduling_mode: "time_slot",
      scheduled_date: params.scheduledDate,
      start_time_slot: params.startTimeSlot,
      duration_minutes: durationMinutes,
      status: "scheduled",
    })
    .select(
      "id, organization_id, application_id, post_submit_action_id, action_type, scheduling_mode, scheduled_date, start_time_slot, duration_minutes, visit_day_count, end_date, status, completed_manually_at, completed_manually_by_user_id",
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new AdmissionsBookingError(
        "Your family already has a campus tour scheduled.",
        "already_scheduled",
      );
    }
    throw error;
  }

  return {
    id: String(data.id),
    organizationId: String(data.organization_id),
    applicationId: data.application_id ? String(data.application_id) : "",
    postSubmitActionId: String(data.post_submit_action_id),
    actionType: FAMILY_TOUR_ACTION_TYPE,
    schedulingMode: "time_slot",
    scheduledDate: String(data.scheduled_date),
    startTimeSlot: String(data.start_time_slot),
    durationMinutes: Number(data.duration_minutes),
    status: "scheduled",
  };
}

export type FamilyScheduledVisit = {
  id: string;
  actionType: typeof FAMILY_TOUR_ACTION_TYPE;
  title: string;
  schedulingMode: "time_slot" | "whole_day";
  scheduledDate: string;
  startTimeSlot: string;
  durationMinutes: number;
};

export async function familyHasScheduledCampusTour(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  applicationIds: string[] = [],
): Promise<boolean> {
  const hasPreApplication = await familyHasPreApplicationCampusTour(
    supabase,
    organizationId,
    familyId,
  );
  if (hasPreApplication) return true;

  if (applicationIds.length === 0) return false;

  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("action_type", FAMILY_TOUR_ACTION_TYPE)
    .eq("status", "scheduled")
    .in("application_id", applicationIds)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function listUpcomingCampusToursForFamily(
  supabase: SupabaseClient,
  organizationId: string,
  familyIds: string[],
  applications: TourBookingApplicationSummary[],
): Promise<FamilyScheduledVisit[]> {
  const preApplicationVisits = await listFamilyPreApplicationVisits(
    supabase,
    organizationId,
    familyIds,
  );
  const applicationVisits = listUpcomingCampusToursFromApplications(applications);

  return [...preApplicationVisits, ...applicationVisits].sort((a, b) =>
    a.scheduledDate.localeCompare(b.scheduledDate),
  );
}

export async function listFamilyPreApplicationVisits(
  supabase: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<FamilyScheduledVisit[]> {
  if (familyIds.length === 0) return [];

  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .select(
      "id, action_type, scheduling_mode, scheduled_date, start_time_slot, duration_minutes",
    )
    .eq("organization_id", organizationId)
    .in("family_id", familyIds)
    .is("application_id", null)
    .eq("status", "scheduled")
    .order("scheduled_date", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    actionType: FAMILY_TOUR_ACTION_TYPE,
    title: POST_SUBMIT_ACTION_TEMPLATES.schedule_campus_tour.label,
    schedulingMode: "time_slot" as const,
    scheduledDate: String(row.scheduled_date),
    startTimeSlot: String(row.start_time_slot),
    durationMinutes: Number(row.duration_minutes),
  }));
}

export async function findApplicationFormVersionId(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("applications")
    .select("form_version_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw error;
  return data?.form_version_id ? String(data.form_version_id) : null;
}

export async function attachFamilyTourToApplication(
  supabase: SupabaseClient,
  params: {
    organizationId: string;
    familyId: string;
    applicationId: string;
    formVersionId: string;
  },
): Promise<boolean> {
  const { data: visit, error: visitError } = await supabase
    .from("admissions_scheduled_visits")
    .select("id")
    .eq("organization_id", params.organizationId)
    .eq("family_id", params.familyId)
    .eq("action_type", FAMILY_TOUR_ACTION_TYPE)
    .is("application_id", null)
    .eq("status", "scheduled")
    .maybeSingle();

  if (visitError) throw visitError;
  if (!visit) return false;

  const { data: formRow, error: formError } = await supabase
    .from("application_form_versions")
    .select("post_submit_config")
    .eq("id", params.formVersionId)
    .eq("organization_id", params.organizationId)
    .maybeSingle();

  if (formError) throw formError;

  const config = parseApplicationFormPostSubmitConfig(formRow?.post_submit_config);
  const campusTourAction = config.actions.find(
    (action) => action.enabled && action.type === FAMILY_TOUR_ACTION_TYPE,
  );

  const postSubmitActionId = campusTourAction?.id ?? PRE_APPLICATION_CAMPUS_TOUR_ACTION_ID;

  const { error: updateError } = await supabase
    .from("admissions_scheduled_visits")
    .update({
      application_id: params.applicationId,
      post_submit_action_id: postSubmitActionId,
      family_id: null,
    })
    .eq("id", visit.id)
    .is("application_id", null);

  if (updateError) {
    if (updateError.code === "23505") {
      await supabase
        .from("admissions_scheduled_visits")
        .delete()
        .eq("id", visit.id);
      return false;
    }
    throw updateError;
  }

  return true;
}
