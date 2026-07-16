import type { SupabaseClient } from "@supabase/supabase-js";
import {
  classifyScheduledVisitTiming,
  formatScheduledVisitWhenLabel,
  getOrganizationTimezone,
  parseAdmissionsTimeSlot,
  type ScheduledVisitTiming,
} from "./admissions-availability";
import type { AdmissionsSchedulingMode } from "./admissions-booking";
import type { PostSubmitActionType } from "./application-form-schema";
import { parseApplicationFormPostSubmitConfig } from "./application-form-schema";
import { extractStudentLabel } from "./application-submissions";
import {
  POST_SUBMIT_ACTION_TEMPLATES,
  postSubmitActionLabel,
} from "./post-submit-templates";

export type { ScheduledVisitTiming };

export type AdminScheduledVisit = {
  id: string;
  applicationId: string;
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
  timing: ScheduledVisitTiming;
  whenLabel: string;
};

function parseStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "string") {
      result[key] = entry;
    } else if (entry != null) {
      result[key] = String(entry);
    }
  }
  return result;
}

function resolveStepTitle(
  actionType: PostSubmitActionType,
  postSubmitActionId: string,
  postSubmitConfigRaw: unknown,
): string {
  const config = parseApplicationFormPostSubmitConfig(postSubmitConfigRaw);
  const action = config.actions.find((entry) => entry.id === postSubmitActionId);
  if (action) return postSubmitActionLabel(action);
  return POST_SUBMIT_ACTION_TEMPLATES[actionType]?.label ?? "Visit";
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
  const timezone = await getOrganizationTimezone(supabase, organizationId);

  const { data, error } = await supabase
    .from("admissions_scheduled_visits")
    .select(
      `
      id,
      application_id,
      post_submit_action_id,
      action_type,
      scheduling_mode,
      scheduled_date,
      end_date,
      start_time_slot,
      duration_minutes,
      visit_day_count,
      applications!inner (
        responses,
        application_form_versions!inner (
          title,
          post_submit_config
        ),
        students:student_id (
          first_name,
          last_name
        )
      )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("status", "scheduled")
    .order("scheduled_date", { ascending: true });

  if (error) throw error;

  const visits: AdminScheduledVisit[] = (data ?? []).map((row) => {
    const application = row.applications as
      | {
          responses?: unknown;
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
          responses?: unknown;
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

    const formVersion = app?.application_form_versions;
    const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;

    const student = app?.students;
    const studentRow = Array.isArray(student) ? student[0] : student;
    const studentFromTable = studentRow
      ? [studentRow.first_name, studentRow.last_name].filter(Boolean).join(" ") || null
      : null;

    const responses = parseStringRecord(app?.responses);
    const actionType = String(row.action_type) as PostSubmitActionType;
    const schedulingMode: AdmissionsSchedulingMode =
      row.scheduling_mode === "whole_day" ? "whole_day" : "time_slot";
    const scheduledDate = String(row.scheduled_date);
    const endDate = row.end_date ? String(row.end_date) : undefined;
    const startTimeSlot = String(row.start_time_slot);
    const durationMinutes = Number(row.duration_minutes);
    const visitDayCount =
      row.visit_day_count != null ? Number(row.visit_day_count) : undefined;

    const visitCore = {
      schedulingMode,
      scheduledDate,
      endDate,
      startTimeSlot,
      durationMinutes,
      visitDayCount,
    };

    return {
      id: String(row.id),
      applicationId: String(row.application_id),
      actionType,
      stepTitle: resolveStepTitle(
        actionType,
        String(row.post_submit_action_id),
        form?.post_submit_config,
      ),
      studentLabel: studentFromTable ?? extractStudentLabel(responses),
      formTitle: String(form?.title ?? "Application"),
      schedulingMode,
      scheduledDate,
      endDate,
      startTimeSlot,
      durationMinutes,
      visitDayCount,
      whenLabel: formatScheduledVisitWhenLabel(visitCore),
      timing: classifyScheduledVisitTiming(visitCore, timezone),
    };
  });

  return visits.sort(compareVisits);
}
