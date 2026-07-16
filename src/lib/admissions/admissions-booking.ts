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
  ALL_DAY_TIME_SLOT,
  eachDateInRange,
  listBookableObservationDates,
  listObservationDayAvailability,
  listOccupiedObservationDays,
} from "./admissions-observation-availability";
import {
  isWholeDayPostSubmitAction,
  parseApplicationFormPostSubmitConfig,
  type PostSubmitAction,
  type PostSubmitActionType,
} from "./application-form-schema";
import {
  resolvedPostSubmitDurationMinutes,
  resolvedPostSubmitMaxVisitDays,
} from "./post-submit-templates";

export type AdmissionsSchedulingMode = "time_slot" | "whole_day";

export type ScheduledVisitRecord = {
  id: string;
  organizationId: string;
  applicationId: string;
  postSubmitActionId: string;
  actionType: PostSubmitActionType;
  schedulingMode: AdmissionsSchedulingMode;
  scheduledDate: string;
  startTimeSlot: string;
  durationMinutes: number;
  visitDayCount?: number;
  endDate?: string;
  visitDates?: string[];
  status: "scheduled" | "cancelled";
};

export type ScheduledVisitRow = {
  id: string;
  organization_id: string;
  application_id: string;
  post_submit_action_id: string;
  action_type: PostSubmitActionType;
  scheduling_mode?: string | null;
  scheduled_date: string;
  start_time_slot: string;
  duration_minutes: number;
  visit_day_count?: number | null;
  end_date?: string | null;
  status: string;
};

const VISIT_SELECT_COLUMNS =
  "id, organization_id, application_id, post_submit_action_id, action_type, scheduling_mode, scheduled_date, start_time_slot, duration_minutes, visit_day_count, end_date, status";

export type TimeSlotAvailabilityResult = {
  mode: "time_slot";
  availability: Record<string, string[]>;
};

export type WholeDayAvailabilityResult = {
  mode: "whole_day";
  bookableDates: string[];
  maxVisitDays: number;
};

export type BookableAvailabilityResult =
  | TimeSlotAvailabilityResult
  | WholeDayAvailabilityResult;

export class AdmissionsBookingError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "AdmissionsBookingError";
    this.code = code;
  }
}

function scheduledVisitFromRow(
  row: ScheduledVisitRow,
  visitDates?: string[],
): ScheduledVisitRecord {
  const schedulingMode: AdmissionsSchedulingMode =
    row.scheduling_mode === "whole_day" ? "whole_day" : "time_slot";

  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    applicationId: String(row.application_id),
    postSubmitActionId: String(row.post_submit_action_id),
    actionType: row.action_type,
    schedulingMode,
    scheduledDate: String(row.scheduled_date),
    startTimeSlot: String(row.start_time_slot),
    durationMinutes: Number(row.duration_minutes),
    visitDayCount:
      row.visit_day_count != null ? Number(row.visit_day_count) : undefined,
    endDate: row.end_date ? String(row.end_date) : undefined,
    visitDates,
    status: row.status === "cancelled" ? "cancelled" : "scheduled",
  };
}

export function normalizeScheduledDates(dates: string[]): string[] {
  return [...new Set(dates.map((date) => date.trim()).filter(Boolean))].sort();
}

export function validateWholeDayScheduledDates(
  scheduledDates: string[],
  maxVisitDays: number,
  bookableDates: Set<string>,
): string[] {
  const normalized = normalizeScheduledDates(scheduledDates);

  if (normalized.length === 0) {
    throw new AdmissionsBookingError(
      "Select at least one shadow day.",
      "invalid_request",
    );
  }

  if (normalized.length > maxVisitDays) {
    throw new AdmissionsBookingError(
      `You can select up to ${maxVisitDays} school day${maxVisitDays === 1 ? "" : "s"}.`,
      "invalid_request",
    );
  }

  for (const date of normalized) {
    if (!bookableDates.has(date)) {
      throw new AdmissionsBookingError(
        "One or more selected days are no longer available. Please review your selection.",
        "slot_unavailable",
      );
    }
  }

  return normalized;
}

async function listVisitDatesForVisits(
  supabase: SupabaseClient,
  visitIds: string[],
): Promise<Map<string, string[]>> {
  if (visitIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("admissions_scheduled_visit_days")
    .select("scheduled_visit_id, date")
    .in("scheduled_visit_id", visitIds)
    .order("date", { ascending: true });

  if (error) throw error;

  const datesByVisit = new Map<string, string[]>();
  for (const row of data ?? []) {
    const visitId = String(row.scheduled_visit_id);
    const date = String(row.date);
    const existing = datesByVisit.get(visitId) ?? [];
    existing.push(date);
    datesByVisit.set(visitId, existing);
  }

  return datesByVisit;
}

async function attachVisitDates(
  supabase: SupabaseClient,
  visits: ScheduledVisitRecord[],
): Promise<ScheduledVisitRecord[]> {
  const wholeDayVisitIds = visits
    .filter((visit) => visit.schedulingMode === "whole_day")
    .map((visit) => visit.id);

  if (wholeDayVisitIds.length === 0) return visits;

  const datesByVisit = await listVisitDatesForVisits(supabase, wholeDayVisitIds);

  return visits.map((visit) => {
    if (visit.schedulingMode !== "whole_day") return visit;
    const visitDates = datesByVisit.get(visit.id);
    if (!visitDates || visitDates.length === 0) return visit;
    return { ...visit, visitDates };
  });
}

export function buildOccupiedSlotKeys(
  visits: Pick<
    ScheduledVisitRecord,
    | "schedulingMode"
    | "scheduledDate"
    | "startTimeSlot"
    | "durationMinutes"
    | "status"
  >[],
): Set<AdmissionsAvailabilitySlotKey> {
  const occupied = new Set<AdmissionsAvailabilitySlotKey>();

  for (const visit of visits) {
    if (visit.status === "cancelled") continue;
    if (visit.schedulingMode === "whole_day") continue;

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
    .select(VISIT_SELECT_COLUMNS)
    .in("application_id", applicationIds)
    .eq("status", "scheduled");

  if (error) throw error;

  const visits = (data ?? []).map((row) =>
    scheduledVisitFromRow(row as ScheduledVisitRow),
  );
  return attachVisitDates(supabase, visits);
}

export async function listActiveScheduledVisitsForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<ScheduledVisitRecord[]> {
  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .select(VISIT_SELECT_COLUMNS)
    .eq("organization_id", organizationId)
    .eq("status", "scheduled")
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate);

  if (error) throw error;

  const visits = (data ?? []).map((row) =>
    scheduledVisitFromRow(row as ScheduledVisitRow),
  );
  return attachVisitDates(supabase, visits);
}

export async function getScheduledVisitForAction(
  supabase: SupabaseClient,
  applicationId: string,
  postSubmitActionId: string,
): Promise<ScheduledVisitRecord | null> {
  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .select(VISIT_SELECT_COLUMNS)
    .eq("application_id", applicationId)
    .eq("post_submit_action_id", postSubmitActionId)
    .eq("status", "scheduled")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [visit] = await attachVisitDates(supabase, [
    scheduledVisitFromRow(data as ScheduledVisitRow),
  ]);
  return visit ?? null;
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
): Promise<BookableAvailabilityResult> {
  if (isWholeDayPostSubmitAction(action.type)) {
    const maxVisitDays = resolvedPostSubmitMaxVisitDays(action);
    const [openDays, occupiedDays] = await Promise.all([
      listObservationDayAvailability(supabase, organizationId, startDate, endDate),
      listOccupiedObservationDays(supabase, organizationId, startDate, endDate),
    ]);

    return {
      mode: "whole_day",
      bookableDates: listBookableObservationDates(
        openDays,
        occupiedDays,
        startDate,
        endDate,
      ),
      maxVisitDays,
    };
  }

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
  return {
    mode: "time_slot",
    availability: listBookableStartTimes(
      openSlots,
      occupiedSlots,
      startDate,
      endDate,
      durationMinutes,
    ),
  };
}

async function bookWholeDayVisit(
  supabase: SupabaseClient,
  context: {
    organizationId: string;
    applicationId: string;
    actionId: string;
    action: PostSubmitAction;
  },
  scheduledDates: string[],
): Promise<ScheduledVisitRecord> {
  const maxVisitDays = resolvedPostSubmitMaxVisitDays(context.action);
  const normalized = normalizeScheduledDates(scheduledDates);

  if (normalized.length === 0) {
    throw new AdmissionsBookingError(
      "Select at least one shadow day.",
      "invalid_request",
    );
  }

  const rangeStart = normalized[0]!;
  const rangeEnd = normalized[normalized.length - 1]!;
  const availability = await getBookableAvailabilityForAction(
    supabase,
    context.organizationId,
    context.action,
    rangeStart,
    rangeEnd,
  );

  if (availability.mode !== "whole_day") {
    throw new AdmissionsBookingError(
      "This scheduling step does not use whole-day booking.",
      "invalid_request",
    );
  }

  const visitDates = validateWholeDayScheduledDates(
    normalized,
    maxVisitDays,
    new Set(availability.bookableDates),
  );

  const scheduledDate = visitDates[0]!;
  const endDate = visitDates[visitDates.length - 1]!;
  const bookedDayCount = visitDates.length;
  const durationMinutes = bookedDayCount * 24 * 60;

  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .insert({
      organization_id: context.organizationId,
      application_id: context.applicationId,
      post_submit_action_id: context.actionId,
      action_type: context.action.type,
      scheduling_mode: "whole_day",
      scheduled_date: scheduledDate,
      start_time_slot: ALL_DAY_TIME_SLOT,
      duration_minutes: durationMinutes,
      visit_day_count: bookedDayCount,
      end_date: endDate,
      status: "scheduled",
    })
    .select(VISIT_SELECT_COLUMNS)
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

  const visit = scheduledVisitFromRow(data as ScheduledVisitRow, visitDates);

  const { error: daysError } = await supabase
    .from("admissions_scheduled_visit_days")
    .insert(
      visitDates.map((date) => ({
        scheduled_visit_id: visit.id,
        organization_id: context.organizationId,
        date,
      })),
    );

  if (daysError) {
    await supabase.from("admissions_scheduled_visits").delete().eq("id", visit.id);
    if (daysError.code === "23505") {
      throw new AdmissionsBookingError(
        "One or more selected days are no longer available. Please review your selection.",
        "slot_unavailable",
      );
    }
    throw daysError;
  }

  return visit;
}

async function bookTimeSlotVisit(
  supabase: SupabaseClient,
  context: {
    organizationId: string;
    applicationId: string;
    actionId: string;
    action: PostSubmitAction;
  },
  scheduledDate: string,
  startTimeSlot: string,
): Promise<ScheduledVisitRecord> {
  const durationMinutes = resolvedPostSubmitDurationMinutes(context.action);
  const availability = await getBookableAvailabilityForAction(
    supabase,
    context.organizationId,
    context.action,
    scheduledDate,
    scheduledDate,
  );

  if (availability.mode !== "time_slot") {
    throw new AdmissionsBookingError(
      "This scheduling step does not use time slots.",
      "invalid_request",
    );
  }

  const bookableStarts = availability.availability[scheduledDate] ?? [];
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
      application_id: context.applicationId,
      post_submit_action_id: context.actionId,
      action_type: context.action.type,
      scheduling_mode: "time_slot",
      scheduled_date: scheduledDate,
      start_time_slot: startTimeSlot,
      duration_minutes: durationMinutes,
      status: "scheduled",
    })
    .select(VISIT_SELECT_COLUMNS)
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

export async function bookAdmissionsVisit(
  supabase: SupabaseClient,
  applicationId: string,
  actionId: string,
  scheduledDate: string,
  startTimeSlot?: string,
  scheduledDates?: string[],
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

  if (isWholeDayPostSubmitAction(context.action.type)) {
    const dates =
      scheduledDates && scheduledDates.length > 0
        ? scheduledDates
        : scheduledDate
          ? [scheduledDate]
          : [];

    return bookWholeDayVisit(
      supabase,
      { ...context, applicationId, actionId },
      dates,
    );
  }

  if (!startTimeSlot) {
    throw new AdmissionsBookingError(
      "A start time is required for this visit.",
      "invalid_request",
    );
  }

  return bookTimeSlotVisit(
    supabase,
    { ...context, applicationId, actionId },
    scheduledDate,
    startTimeSlot,
  );
}
