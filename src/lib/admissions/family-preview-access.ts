import type { SupabaseClient } from "@supabase/supabase-js";
import { listScheduledVisitsForApplications } from "./admissions-booking";
import {
  parseApplicationFormPostSubmitConfig,
  type PostSubmitActionType,
} from "./application-form-schema";
import { extractStudentFromResponses } from "./apply-system-fields";
import { extractStudentLabel } from "./application-submissions";
import {
  postSubmitActionLabel,
  POST_SUBMIT_ACTION_TEMPLATES,
  resolvedPostSubmitDurationMinutes,
  resolvedPostSubmitMaxVisitDays,
} from "./post-submit-templates";
import {
  listEnrollmentProgressForApplications,
  type EnrollmentProgressSummary,
} from "./enrollment-checklist-materialization";
import { applicationStatusLabel } from "./application-status-ui";
import {
  loadApplicationDetail,
  type ApplicationDetail,
  type ApplicationPostSubmitTask,
  type FamilyApplication,
  type FamilyChildOverview,
  type FamilyUserProfile,
} from "./parent-portal-access";

export function familyPreviewBasePath(slug: string, familyId: string): string {
  return `/admin/preview/${slug}/family/${familyId}`;
}

async function getGuardianIdsForFamily(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("guardians")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId);

  if (error) throw error;
  return (data ?? []).map((row) => String(row.id));
}

function familyApplicationFilter(familyId: string, guardianIds: string[]): string {
  if (guardianIds.length > 0) {
    return `family_id.eq.${familyId},primary_guardian_id.in.(${guardianIds.join(",")})`;
  }
  return `family_id.eq.${familyId}`;
}

async function getStudentIdsForFamily(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId);

  if (error) throw error;
  return (data ?? []).map((row) => String(row.id));
}

function parseStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (key === "__progress") continue;
    if (typeof entry === "string") {
      result[key] = entry;
    } else if (entry != null) {
      result[key] = String(entry);
    }
  }
  return result;
}

function displayApplicationStatus(
  status: string,
  enrollmentProgress?: EnrollmentProgressSummary,
): string {
  if (status === "enrolled") return "enrolled";
  if (
    status === "enrolling" &&
    enrollmentProgress?.checklistStatus === "completed"
  ) {
    return "enrolled";
  }
  return status;
}

export async function applicationBelongsToFamily(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  applicationId: string,
): Promise<boolean> {
  const guardianIds = await getGuardianIdsForFamily(supabase, organizationId, familyId);

  let query = supabase
    .from("applications")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("id", applicationId);

  query = query.or(familyApplicationFilter(familyId, guardianIds));

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function getFamilyPreviewProfile(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<FamilyUserProfile> {
  const { data: guardians, error } = await supabase
    .from("guardians")
    .select("id, first_name, last_name, email, created_at")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!guardians?.length) {
    return { email: "", displayName: "Family" };
  }

  const { data: application } = await supabase
    .from("applications")
    .select("primary_guardian_id")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .not("primary_guardian_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const primaryGuardianId = application?.primary_guardian_id
    ? String(application.primary_guardian_id)
    : null;

  const guardian =
    guardians.find((row) => String(row.id) === primaryGuardianId) ??
    guardians[0];

  const firstName = String(guardian?.first_name ?? "").trim();
  const lastName = String(guardian?.last_name ?? "").trim();
  const email = typeof guardian?.email === "string" ? guardian.email.trim() : "";
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || email || "Family";

  return { email, displayName };
}

export async function listFamilyApplicationsForFamilyId(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<FamilyApplication[]> {
  const guardianIds = await getGuardianIdsForFamily(supabase, organizationId, familyId);

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      status,
      submitted_at,
      created_at,
      responses,
      application_form_versions!inner (
        title,
        public_slug,
        post_submit_config
      )
    `,
    )
    .eq("organization_id", organizationId)
    .or(familyApplicationFilter(familyId, guardianIds))
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const rows = data ?? [];
  const submittedIds = rows
    .filter((row) => String(row.status) !== "draft")
    .map((row) => String(row.id));
  const visits = await listScheduledVisitsForApplications(supabase, submittedIds);
  const visitsByApplicationAction = new Map(
    visits.map((visit) => [
      `${visit.applicationId}|${visit.postSubmitActionId}`,
      visit,
    ]),
  );

  return rows.map((row) => {
    const formVersion = row.application_form_versions as
      | { title?: string; public_slug?: string | null; post_submit_config?: unknown }
      | { title?: string; public_slug?: string | null; post_submit_config?: unknown }[]
      | null;
    const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
    const responses = parseStringRecord(row.responses);
    const status = String(row.status);
    const applicationId = String(row.id);
    const postSubmitConfig = parseApplicationFormPostSubmitConfig(
      form?.post_submit_config,
    );

    const postSubmitTasks: ApplicationPostSubmitTask[] =
      status === "draft"
        ? []
        : postSubmitConfig.actions
            .filter((action) => action.enabled)
            .map((action, sortIndex) => {
              const visit = visitsByApplicationAction.get(
                `${applicationId}|${action.id}`,
              );
              const templateInstructions =
                action.instructions?.trim() ||
                POST_SUBMIT_ACTION_TEMPLATES[action.type as PostSubmitActionType]
                  ?.defaultInstructions ||
                "";

              return {
                actionId: action.id,
                type: action.type,
                title: postSubmitActionLabel(action),
                instructions: templateInstructions,
                required: action.required !== false,
                durationMinutes: resolvedPostSubmitDurationMinutes(action),
                maxVisitDays: resolvedPostSubmitMaxVisitDays(action),
                sortIndex,
                status: visit ? "scheduled" : "pending",
                booking: visit
                  ? {
                      schedulingMode: visit.schedulingMode,
                      scheduledDate: visit.scheduledDate,
                      endDate: visit.endDate,
                      startTimeSlot: visit.startTimeSlot,
                      durationMinutes: visit.durationMinutes,
                      visitDayCount: visit.visitDayCount,
                      visitDates: visit.visitDates,
                    }
                  : undefined,
              };
            });

    return {
      id: applicationId,
      status,
      submittedAt: row.submitted_at ? String(row.submitted_at) : null,
      createdAt: String(row.created_at),
      formTitle: String(form?.title ?? "Application"),
      publicSlug:
        typeof form?.public_slug === "string" ? form.public_slug : null,
      studentName: extractStudentLabel(responses),
      postSubmitTasks,
    };
  });
}

export async function familyHasEnrolledAccess(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<boolean> {
  const studentIds = await getStudentIdsForFamily(supabase, organizationId, familyId);
  if (studentIds.length === 0) return false;

  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .in("student_id", studentIds)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function listFamilyChildrenForHomeByFamilyId(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<FamilyChildOverview[]> {
  const applications = await listFamilyApplicationsForFamilyId(
    supabase,
    organizationId,
    familyId,
  );
  const eligible = applications.filter(
    (application) =>
      application.status !== "draft" && Boolean(application.studentName?.trim()),
  );

  if (eligible.length === 0) return [];

  const progressByApplicationId = await listEnrollmentProgressForApplications(
    supabase,
    organizationId,
    eligible.map((application) => application.id),
  );

  const children = eligible.map((application) => {
    const enrollmentProgress = progressByApplicationId.get(application.id);
    const displayStatus = displayApplicationStatus(
      application.status,
      enrollmentProgress,
    );
    const isEnrolled = displayStatus === "enrolled";

    return {
      applicationId: application.id,
      studentName: application.studentName!.trim(),
      grade: null as string | null,
      status: displayStatus,
      statusLabel: applicationStatusLabel(displayStatus),
      isEnrolled,
    };
  });

  const { data: responseRows, error } = await supabase
    .from("applications")
    .select("id, responses")
    .eq("organization_id", organizationId)
    .in(
      "id",
      children.map((child) => child.applicationId),
    );

  if (error) throw error;

  const gradeByApplicationId = new Map<string, string | null>();
  for (const row of responseRows ?? []) {
    const student = extractStudentFromResponses(row.responses);
    gradeByApplicationId.set(
      String(row.id),
      student?.grade?.trim() ? student.grade.trim() : null,
    );
  }

  return children
    .map((child) => ({
      ...child,
      grade: gradeByApplicationId.get(child.applicationId) ?? null,
    }))
    .sort((a, b) => {
      if (a.isEnrolled !== b.isEnrolled) {
        return a.isEnrolled ? -1 : 1;
      }
      return a.studentName.localeCompare(b.studentName);
    });
}

export async function loadApplicationDetailForFamily(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  applicationId: string,
): Promise<ApplicationDetail | null> {
  const belongs = await applicationBelongsToFamily(
    supabase,
    organizationId,
    familyId,
    applicationId,
  );
  if (!belongs) return null;

  return loadApplicationDetail(supabase, applicationId, organizationId);
}
