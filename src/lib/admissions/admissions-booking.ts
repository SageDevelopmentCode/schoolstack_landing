import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ADMISSIONS_TIME_SLOTS,
  type AdmissionsAvailabilitySlotKey,
  type AdmissionsTimeSlot,
  availabilitySlotKey,
  durationToSlotCount,
  isStartTimeBookable,
  listAdmissionsAvailabilitySlots,
} from "./admissions-availability";
import {
  parseApplicationFormPostSubmitConfig,
  type PostSubmitAction,
  type PostSubmitActionType,
} from "./application-form-schema";
import { resolvedPostSubmitDurationMinutes } from "./post-submit-templates";

export type ScheduledVisitRecord = {
  id: string;
  organizationId: string;
  applicationId: string;
  postSubmitActionId: string;
  actionType: PostSubmitActionType;
  scheduledDate: string;
  startTimeSlot: string;
  durationMinutes: number;
  status: "scheduled" | "cancelled";
};

export type ScheduledVisitRow = {
  id: string;
  organization_id: string;
  application_id: string;
  post_submit_action_id: string;
  action_type: PostSubmitActionType;
  scheduled_date: string;
  start_time_slot: string;
  duration_minutes: number;
  status: string;
};

function scheduledVisitFromRow(row: ScheduledVisitRow): ScheduledVisitRecord {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    applicationId: String(row.application_id),
    postSubmitActionId: String(row.post_submit_action_id),
    actionType: row.action_type,
    scheduledDate: String(row.scheduled_date),
    startTimeSlot: String(row.start_time_slot),
    durationMinutes: Number(row.duration_minutes),
    status: row.status === "cancelled" ? "cancelled" : "scheduled",
  };
}

function eachDateInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  while (cursor <= end) {
    const year = cursor.getFullYear();
    const month = String(cursor.getMonth() + 1).padStart(2, "0");
    const day = String(cursor.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function buildOccupiedSlotKeys(
  visits: Pick<ScheduledVisitRecord, "scheduledDate" | "startTimeSlot" | "durationMinutes" | "status">[],
): Set<AdmissionsAvailabilitySlotKey> {
  const occupied = new Set<AdmissionsAvailabilitySlotKey>();

  for (const visit of visits) {
    if (visit.status === "cancelled") continue;

    const startIndex = ADMISSIONS_TIME_SLOTS.indexOf(
      visit.startTimeSlot as AdmissionsTimeSlot,
    );
    if (startIndex < 0) continue;

    const cellCount = durationToSlotCount(visit.durationMinutes);
    for (let i = 0; i < cellCount; i++) {
      const timeSlot = ADMISSIONS_TIME_SLOTS[startIndex + i];
      if (!timeSlot) continue;
      occupied.add(availabilitySlotKey(visit.scheduledDate, timeSlot));
    }
  }

  return occupied;
}

export function listBookableStartTimes(
  openSlots: Set<AdmissionsAvailabilitySlotKey>,
  occupiedSlots: Set<AdmissionsAvailabilitySlotKey>,
  startDate: string,
  endDate: string,
  durationMinutes: number,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const date of eachDateInRange(startDate, endDate)) {
    const starts: string[] = [];

    for (const timeSlot of ADMISSIONS_TIME_SLOTS) {
      if (
        isStartTimeBookable(
          openSlots,
          date,
          timeSlot,
          durationMinutes,
          occupiedSlots,
        )
      ) {
        starts.push(timeSlot);
      }
    }

    if (starts.length > 0) {
      result[date] = starts;
    }
  }

  return result;
}

export async function listScheduledVisitsForApplications(
  supabase: SupabaseClient,
  applicationIds: string[],
): Promise<ScheduledVisitRecord[]> {
  if (applicationIds.length === 0) return [];

  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .select(
      "id, organization_id, application_id, post_submit_action_id, action_type, scheduled_date, start_time_slot, duration_minutes, status",
    )
    .in("application_id", applicationIds)
    .eq("status", "scheduled");

  if (error) throw error;

  return (data ?? []).map((row) => scheduledVisitFromRow(row as ScheduledVisitRow));
}

export async function listActiveScheduledVisitsForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<ScheduledVisitRecord[]> {
  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .select(
      "id, organization_id, application_id, post_submit_action_id, action_type, scheduled_date, start_time_slot, duration_minutes, status",
    )
    .eq("organization_id", organizationId)
    .eq("status", "scheduled")
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate);

  if (error) throw error;

  return (data ?? []).map((row) => scheduledVisitFromRow(row as ScheduledVisitRow));
}

export async function getScheduledVisitForAction(
  supabase: SupabaseClient,
  applicationId: string,
  postSubmitActionId: string,
): Promise<ScheduledVisitRecord | null> {
  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .select(
      "id, organization_id, application_id, post_submit_action_id, action_type, scheduled_date, start_time_slot, duration_minutes, status",
    )
    .eq("application_id", applicationId)
    .eq("post_submit_action_id", postSubmitActionId)
    .eq("status", "scheduled")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return scheduledVisitFromRow(data as ScheduledVisitRow);
}

export async function loadPostSubmitActionForApplication(
  supabase: SupabaseClient,
  applicationId: string,
  actionId: string,
): Promise<{
  organizationId: string;
  applicationStatus: string;
  action: PostSubmitAction;
} | null> {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      organization_id,
      status,
      application_form_versions!inner (
        post_submit_config
      )
    `,
    )
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const formVersion = data.application_form_versions as
    | { post_submit_config?: unknown }
    | { post_submit_config?: unknown }[]
    | null;
  const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
  const config = parseApplicationFormPostSubmitConfig(form?.post_submit_config);
  const action = config.actions.find(
    (entry) => entry.id === actionId && entry.enabled,
  );

  if (!action) return null;

  return {
    organizationId: String(data.organization_id),
    applicationStatus: String(data.status),
    action,
  };
}

export async function getBookableAvailabilityForAction(
  supabase: SupabaseClient,
  organizationId: string,
  action: PostSubmitAction,
  startDate: string,
  endDate: string,
): Promise<Record<string, string[]>> {
  const durationMinutes = resolvedPostSubmitDurationMinutes(action);

  const [openSlots, visits] = await Promise.all([
    listAdmissionsAvailabilitySlots(supabase, organizationId, startDate, endDate),
    listActiveScheduledVisitsForOrganization(
      supabase,
      organizationId,
      startDate,
      endDate,
    ),
  ]);

  const occupiedSlots = buildOccupiedSlotKeys(visits);
  return listBookableStartTimes(
    openSlots,
    occupiedSlots,
    startDate,
    endDate,
    durationMinutes,
  );
}

export class AdmissionsBookingError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "AdmissionsBookingError";
    this.code = code;
  }
}

export async function bookAdmissionsVisit(
  supabase: SupabaseClient,
  applicationId: string,
  actionId: string,
  scheduledDate: string,
  startTimeSlot: string,
): Promise<ScheduledVisitRecord> {
  const context = await loadPostSubmitActionForApplication(
    supabase,
    applicationId,
    actionId,
  );

  if (!context) {
    throw new AdmissionsBookingError(
      "This scheduling step is not available.",
      "action_not_found",
    );
  }

  if (context.applicationStatus === "draft") {
    throw new AdmissionsBookingError(
      "Submit your application before scheduling visits.",
      "application_not_submitted",
    );
  }

  const existing = await getScheduledVisitForAction(
    supabase,
    applicationId,
    actionId,
  );
  if (existing) {
    throw new AdmissionsBookingError(
      "This step has already been scheduled.",
      "already_scheduled",
    );
  }

  const durationMinutes = resolvedPostSubmitDurationMinutes(context.action);
  const availability = await getBookableAvailabilityForAction(
    supabase,
    context.organizationId,
    context.action,
    scheduledDate,
    scheduledDate,
  );

  const bookableStarts = availability[scheduledDate] ?? [];
  if (!bookableStarts.includes(startTimeSlot)) {
    throw new AdmissionsBookingError(
      "That time is no longer available. Please choose another slot.",
      "slot_unavailable",
    );
  }

  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .insert({
      organization_id: context.organizationId,
      application_id: applicationId,
      post_submit_action_id: actionId,
      action_type: context.action.type,
      scheduled_date: scheduledDate,
      start_time_slot: startTimeSlot,
      duration_minutes: durationMinutes,
      status: "scheduled",
    })
    .select(
      "id, organization_id, application_id, post_submit_action_id, action_type, scheduled_date, start_time_slot, duration_minutes, status",
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new AdmissionsBookingError(
        "This step has already been scheduled.",
        "already_scheduled",
      );
    }
    throw error;
  }

  return scheduledVisitFromRow(data as ScheduledVisitRow);
}
