import type { SupabaseClient } from "@supabase/supabase-js";
import {
  classifyScheduledVisitTiming,
  formatScheduledVisitWhenLabel,
  getOrganizationTimezone,
  listAdmissionsAvailabilitySlotRecords,
  parseAdmissionsTimeSlot,
  type AdmissionsAvailabilitySlotKey,
  type ScheduledVisitTiming,
} from "./admissions-availability";
import type { AdmissionsSchedulingMode, ScheduledVisitSlotDetail } from "./admissions-booking";
import {
  buildAdminAvailabilityOccupiedSlotKeys,
  listCampusTourVisitsForAvailability,
} from "./public-tour-availability";
import { listObservationSlotsByIds } from "./admissions-observation-slots";
import type { PostSubmitActionType } from "./application-form-schema";
import { parseApplicationFormPostSubmitConfig } from "./application-form-schema";
import {
  POST_SUBMIT_ACTION_TEMPLATES,
  postSubmitActionLabel,
} from "./post-submit-templates";
import { PUBLIC_TOUR_POST_SUBMIT_ACTION_ID } from "./public-tour-settings";
import type { PublicTourChildEntry, PublicTourRegistrant } from "./public-tour-settings";

export type { ScheduledVisitTiming };

export type AdminScheduledVisit = {
  id: string;
  applicationId: string | null;
  isPreApplication: boolean;
  bookingSource?: "application" | "family_pre_app" | "public";
  registrant?: Record<string, unknown> | null;
  actionType: PostSubmitActionType;
  stepTitle: string;
  studentLabel: string | null;
  formTitle: string;
  schedulingMode: AdmissionsSchedulingMode;
  scheduledDate: string;
  endDate?: string;
  startTimeSlot: string;
  durationMinutes: number;
  visitDayCount?: number;
  visitDates?: string[];
  observationSlots?: ScheduledVisitSlotDetail[];
  timing: ScheduledVisitTiming;
  whenLabel: string;
};

function resolveStepTitle(
  actionType: PostSubmitActionType,
  postSubmitActionId: string,
  postSubmitConfigRaw: unknown,
): string {
  if (postSubmitActionId === PUBLIC_TOUR_POST_SUBMIT_ACTION_ID) {
    return "Public campus tour";
  }
  const config = parseApplicationFormPostSubmitConfig(postSubmitConfigRaw);
  const action = config.actions.find((entry) => entry.id === postSubmitActionId);
  if (action) return postSubmitActionLabel(action);
  return POST_SUBMIT_ACTION_TEMPLATES[actionType]?.label ?? "Visit";
}

export function labelFromPublicRegistrant(registrantRaw: unknown): string | null {
  if (!registrantRaw || typeof registrantRaw !== "object" || Array.isArray(registrantRaw)) {
    return null;
  }
  const registrant = registrantRaw as PublicTourRegistrant;
  const answers = registrant.answers;
  if (answers && typeof answers.contact_name === "string" && answers.contact_name.trim()) {
    return answers.contact_name.trim();
  }
  const children = answers?.children;
  if (Array.isArray(children) && children.length > 0) {
    const first = children[0] as PublicTourChildEntry;
    if (first?.name?.trim()) return first.name.trim();
  }
  return registrant.contactEmail?.trim() || null;
}

function compareVisits(a: AdminScheduledVisit, b: AdminScheduledVisit): number {
  const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
  if (dateCompare !== 0) return dateCompare;

  if (a.schedulingMode === "whole_day" || b.schedulingMode === "whole_day") {
    return 0;
  }

  const aMinutes = parseAdmissionsTimeSlot(a.startTimeSlot) ?? 0;
  const bMinutes = parseAdmissionsTimeSlot(b.startTimeSlot) ?? 0;
  return aMinutes - bMinutes;
}

export async function listOrgScheduledVisits(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<AdminScheduledVisit[]> {
  return listOrgScheduledVisitsForAdminList(supabase, organizationId);
}

const ADMIN_SCHEDULED_VISITS_LIST_SELECT = `
      id,
      application_id,
      family_id,
      booking_source,
      registrant,
      post_submit_action_id,
      action_type,
      scheduling_mode,
      scheduled_date,
      end_date,
      start_time_slot,
      duration_minutes,
      visit_day_count,
      applications (
        application_form_versions (
          title,
          post_submit_config
        ),
        students:student_id (
          first_name,
          last_name
        )
      ),
      families:family_id (
        name,
        guardians (
          first_name,
          last_name
        )
      )
    `;

export async function listOrgScheduledVisitsForAdminList(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<AdminScheduledVisit[]> {
  const timezone = await getOrganizationTimezone(supabase, organizationId);

  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .select(ADMIN_SCHEDULED_VISITS_LIST_SELECT)
    .eq("organization_id", organizationId)
    .eq("status", "scheduled")
    .is("completed_manually_at", null)
    .order("scheduled_date", { ascending: true });

  if (error) throw error;

  const wholeDayVisitIds = (data ?? [])
    .filter((row) => row.scheduling_mode === "whole_day")
    .map((row) => String(row.id));

  const visitDatesById = new Map<string, string[]>();
  const slotIdsByVisit = new Map<string, string[]>();
  if (wholeDayVisitIds.length > 0) {
    const { data: dayRows, error: dayError } = await supabase
      .from("admissions_scheduled_visit_days")
      .select("scheduled_visit_id, date, observation_slot_id")
      .in("scheduled_visit_id", wholeDayVisitIds)
      .order("date", { ascending: true });

    if (dayError) throw dayError;

    for (const dayRow of dayRows ?? []) {
      const visitId = String(dayRow.scheduled_visit_id);
      const date = String(dayRow.date);
      const existing = visitDatesById.get(visitId) ?? [];
      existing.push(date);
      visitDatesById.set(visitId, existing);

      if (dayRow.observation_slot_id) {
        const slotIds = slotIdsByVisit.get(visitId) ?? [];
        slotIds.push(String(dayRow.observation_slot_id));
        slotIdsByVisit.set(visitId, slotIds);
      }
    }
  }

  const allSlotIds = [...new Set([...slotIdsByVisit.values()].flat())];
  const slots = await listObservationSlotsByIds(supabase, allSlotIds);
  const slotById = new Map(slots.map((slot) => [slot.id, slot]));
  const observationSlotsByVisit = new Map<string, ScheduledVisitSlotDetail[]>();

  for (const [visitId, slotIds] of slotIdsByVisit) {
    observationSlotsByVisit.set(
      visitId,
      slotIds
        .map((slotId) => slotById.get(slotId))
        .filter((slot): slot is NonNullable<typeof slot> => Boolean(slot))
        .map((slot) => ({
          slotId: slot.id,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          label: slot.label,
          gradeValues: slot.gradeValues,
        })),
    );
  }

  const visits: AdminScheduledVisit[] = (data ?? []).map((row) => {
    const application = row.applications as
      | {
          application_form_versions?:
            | { title?: string; post_submit_config?: unknown }
            | { title?: string; post_submit_config?: unknown }[]
            | null;
          students?:
            | { first_name?: string; last_name?: string }
            | { first_name?: string; last_name?: string }[]
            | null;
        }
      | {
          application_form_versions?:
            | { title?: string; post_submit_config?: unknown }
            | { title?: string; post_submit_config?: unknown }[]
            | null;
          students?:
            | { first_name?: string; last_name?: string }
            | { first_name?: string; last_name?: string }[]
            | null;
        }[]
      | null;
    const app = Array.isArray(application) ? application[0] : application;

    const family = row.families as
      | {
          name?: string;
          guardians?:
            | { first_name?: string; last_name?: string }
            | { first_name?: string; last_name?: string }[]
            | null;
        }
      | {
          name?: string;
          guardians?:
            | { first_name?: string; last_name?: string }
            | { first_name?: string; last_name?: string }[]
            | null;
        }[]
      | null;
    const familyRow = Array.isArray(family) ? family[0] : family;
    const guardian = familyRow?.guardians;
    const guardianRow = Array.isArray(guardian) ? guardian[0] : guardian;
    const guardianLabel = guardianRow
      ? [guardianRow.first_name, guardianRow.last_name].filter(Boolean).join(" ") || null
      : null;
    const familyLabel =
      guardianLabel ??
      (typeof familyRow?.name === "string" ? familyRow.name : null);

    const formVersion = app?.application_form_versions;
    const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;

    const student = app?.students;
    const studentRow = Array.isArray(student) ? student[0] : student;
    const studentFromTable = studentRow
      ? [studentRow.first_name, studentRow.last_name].filter(Boolean).join(" ") || null
      : null;

    const actionType = String(row.action_type) as PostSubmitActionType;
    const bookingSource = row.booking_source as AdminScheduledVisit["bookingSource"];
    const isPublicTour = bookingSource === "public";
    const isPreApplication = row.application_id == null && !isPublicTour;
    const publicLabel = isPublicTour ? labelFromPublicRegistrant(row.registrant) : null;
    const schedulingMode: AdmissionsSchedulingMode =
      row.scheduling_mode === "whole_day" ? "whole_day" : "time_slot";
    const scheduledDate = String(row.scheduled_date);
    const endDate = row.end_date ? String(row.end_date) : undefined;
    const startTimeSlot = String(row.start_time_slot);
    const durationMinutes = Number(row.duration_minutes);
    const visitDayCount =
      row.visit_day_count != null ? Number(row.visit_day_count) : undefined;
    const visitDates = visitDatesById.get(String(row.id));
    const observationSlots = observationSlotsByVisit.get(String(row.id));

    const visitCore = {
      schedulingMode,
      scheduledDate,
      endDate,
      startTimeSlot,
      durationMinutes,
      visitDayCount,
      visitDates,
      observationSlots,
    };

    return {
      id: String(row.id),
      applicationId: row.application_id ? String(row.application_id) : null,
      isPreApplication,
      bookingSource,
      registrant:
        row.registrant && typeof row.registrant === "object" && !Array.isArray(row.registrant)
          ? (row.registrant as Record<string, unknown>)
          : null,
      actionType,
      stepTitle: resolveStepTitle(
        actionType,
        String(row.post_submit_action_id),
        form?.post_submit_config,
      ),
      studentLabel: isPublicTour
        ? publicLabel
        : isPreApplication
          ? familyLabel
          : studentFromTable,
      formTitle: isPublicTour
        ? "Public tour"
        : isPreApplication
          ? "Pre-application tour"
          : String(form?.title ?? "Application"),
      schedulingMode,
      scheduledDate,
      endDate,
      startTimeSlot,
      durationMinutes,
      visitDayCount,
      visitDates,
      observationSlots,
      whenLabel: formatScheduledVisitWhenLabel(visitCore),
      timing: classifyScheduledVisitTiming(visitCore, timezone),
    };
  });

  return visits.sort(compareVisits);
}

export async function listOccupiedSlotKeysForDateRange(
  supabase: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<Set<AdmissionsAvailabilitySlotKey>> {
  const [slotRecords, visits] = await Promise.all([
    listAdmissionsAvailabilitySlotRecords(
      supabase,
      organizationId,
      startDate,
      endDate,
    ),
    listCampusTourVisitsForAvailability(
      supabase,
      organizationId,
      startDate,
      endDate,
    ),
  ]);

  return buildAdminAvailabilityOccupiedSlotKeys(slotRecords, visits);
}

export function occupiedSlotKeysToBookedDates(
  occupiedSlots: Set<AdmissionsAvailabilitySlotKey>,
): Set<string> {
  const dates = new Set<string>();
  for (const key of occupiedSlots) {
    dates.add(key.split("|")[0] ?? key);
  }
  return dates;
}
