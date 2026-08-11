import type { SupabaseClient, User } from "@supabase/supabase-js";
import { buildAdminPostSubmitSteps, type AdminPostSubmitStep } from "./admin-post-submit-steps";
import { listScheduledVisitsForApplications } from "./admissions-booking";
import {
  parseApplicationFormPostSubmitConfig,
  type PostSubmitActionType,
} from "./application-form-schema";
import { extractStudentFromResponses, ensureApplySystemSchema } from "./apply-system-fields";
import { isApplyFormSlug } from "./application-forms";
import { extractStudentLabel } from "./application-submissions";
import {
  postSubmitActionLabel,
  POST_SUBMIT_ACTION_TEMPLATES,
  resolvedPostSubmitDurationMinutes,
  resolvedPostSubmitMaxVisitDays,
} from "./post-submit-templates";
import {
  parseApplicationFormFeeConfig,
  type ApplicationFormFeeConfig,
  type ApplicationFormSchema,
} from "./application-form-schema";
import { parseApplicationFormStepIndex } from "./application-form-steps";
import {
  listEnrollmentProgressForApplications,
  type EnrollmentProgressSummary,
  type LoadedEnrollmentChecklist,
} from "./enrollment-checklist-materialization";
import {
  applicationOwnershipFilter,
  getFamilyIdsForUser,
} from "./application-auth";
import { applicationStatusLabel } from "./application-status-ui";

const PROGRESS_KEY = "__progress";

export type ApplicationPostSubmitTask = {
  actionId: string;
  type: PostSubmitActionType;
  title: string;
  instructions: string;
  required: boolean;
  durationMinutes: number;
  maxVisitDays?: number;
  sortIndex: number;
  status: "pending" | "scheduled";
  booking?: {
    schedulingMode?: "time_slot" | "whole_day";
    scheduledDate: string;
    endDate?: string;
    startTimeSlot: string;
    durationMinutes: number;
    visitDayCount?: number;
    visitDates?: string[];
    completedManuallyAt?: string;
  };
};

export type FamilyApplication = {
  id: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  formTitle: string;
  publicSlug: string | null;
  studentName: string | null;
  grade: string | null;
  postSubmitTasks: ApplicationPostSubmitTask[];
};

export type EnrolledStudent = {
  enrollmentId: string;
  studentName: string;
  programName: string;
  status: string;
};

export type ApplicationDetail = {
  id: string;
  status: string;
  submittedAt: string | null;
  formTitle: string;
  schema: ApplicationFormSchema;
  feeConfig: ApplicationFormFeeConfig;
  stepIndex: number;
  responses: Record<string, string>;
  acknowledgments: Record<string, boolean>;
  postSubmitSteps: AdminPostSubmitStep[];
};

export type ChildProfileData = {
  application: ApplicationDetail;
  checklist: LoadedEnrollmentChecklist | null;
};

export type FamilyUserProfile = {
  email: string;
  displayName: string;
};

export type FamilyChildOverview = {
  applicationId: string;
  studentName: string;
  grade: string | null;
  status: string;
  statusLabel: string;
  isEnrolled: boolean;
  checklistProgress: { completed: number; total: number } | null;
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  fee_pending: "Fee pending",
  under_review: "Under review",
  observation: "Observation",
  accepted: "Accepted",
  enrolling: "Enrolling",
  enrolled: "Enrolled",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

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

function parseStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (key === PROGRESS_KEY) continue;
    if (typeof entry === "string") {
      result[key] = entry;
    } else if (entry != null) {
      result[key] = String(entry);
    }
  }
  return result;
}

function parseBooleanRecord(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, boolean> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    result[key] = Boolean(entry);
  }
  return result;
}

export async function getFamilyUserProfile(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  user: User,
): Promise<FamilyUserProfile> {
  const { data: guardian, error } = await supabase
    .from("guardians")
    .select("first_name, last_name, email")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;

  const metadata = user.user_metadata ?? {};
  const metadataFirstName =
    typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
  const metadataLastName =
    typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";

  const guardianFirstName = String(guardian?.first_name ?? "").trim();
  const guardianLastName = String(guardian?.last_name ?? "").trim();
  const firstName = guardianFirstName || metadataFirstName;
  const lastName = guardianLastName || metadataLastName;

  const email =
    user.email?.trim() ||
    (typeof guardian?.email === "string" ? guardian.email.trim() : "") ||
    "";

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || email || "Account";

  return { email, displayName };
}

async function getStudentIdsForFamilies(
  supabase: SupabaseClient,
  organizationId: string,
  familyIds: string[],
): Promise<string[]> {
  if (familyIds.length === 0) return [];

  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("organization_id", organizationId)
    .in("family_id", familyIds);

  if (error) throw error;
  return (data ?? []).map((row) => String(row.id));
}

export async function listFamilyApplications(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<FamilyApplication[]> {
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);

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
    .or(applicationOwnershipFilter(userId, familyIds))
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
                POST_SUBMIT_ACTION_TEMPLATES[action.type]?.defaultInstructions ||
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
                      completedManuallyAt: visit.completedManuallyAt,
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
      grade: (() => {
        const student = extractStudentFromResponses(row.responses);
        const grade = student?.grade?.trim();
        return grade ? grade : null;
      })(),
      postSubmitTasks,
    };
  });
}

export async function userHasEnrolledAccess(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  const studentIds = await getStudentIdsForFamilies(
    supabase,
    organizationId,
    familyIds,
  );

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

export async function listEnrolledStudents(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<EnrolledStudent[]> {
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  const studentIds = await getStudentIdsForFamilies(
    supabase,
    organizationId,
    familyIds,
  );

  if (studentIds.length === 0) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      status,
      students!inner (first_name, last_name),
      programs (name)
    `,
    )
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .in("student_id", studentIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const student = row.students as
      | { first_name?: string; last_name?: string }
      | { first_name?: string; last_name?: string }[]
      | null;
    const studentRow = Array.isArray(student) ? student[0] : student;
    const program = row.programs as { name?: string } | { name?: string }[] | null;
    const programRow = Array.isArray(program) ? program[0] : program;

    return {
      enrollmentId: String(row.id),
      studentName: [studentRow?.first_name, studentRow?.last_name]
        .filter(Boolean)
        .join(" "),
      programName: String(programRow?.name ?? "Program"),
      status: String(row.status),
    };
  });
}

export async function listFamilyChildrenForHome(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<FamilyChildOverview[]> {
  const applications = await listFamilyApplications(supabase, organizationId, userId);
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
      grade: application.grade,
      status: displayStatus,
      statusLabel: applicationStatusLabel(displayStatus),
      isEnrolled,
      checklistProgress: enrollmentProgress
        ? { completed: enrollmentProgress.completed, total: enrollmentProgress.total }
        : null,
    };
  });

  return children.sort((a, b) => {
    if (a.isEnrolled !== b.isEnrolled) {
      return a.isEnrolled ? -1 : 1;
    }
    return a.studentName.localeCompare(b.studentName);
  });
}

export async function loadApplicationDetail(
  supabase: SupabaseClient,
  applicationId: string,
  organizationId: string,
  userId?: string,
): Promise<ApplicationDetail | null> {
  const familyIds = userId
    ? await getFamilyIdsForUser(supabase, userId, organizationId)
    : null;

  let query = supabase
    .from("applications")
    .select(
      `
      id,
      status,
      submitted_at,
      responses,
      acknowledgments,
      application_form_versions!inner (
        title,
        public_slug,
        schema,
        fee_config,
        post_submit_config
      )
    `,
    )
    .eq("id", applicationId)
    .eq("organization_id", organizationId);

  if (userId) {
    query = query.or(applicationOwnershipFilter(userId, familyIds ?? []));
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const formVersion = data.application_form_versions as
    | {
        title?: string;
        public_slug?: string | null;
        schema?: ApplicationFormSchema;
        fee_config?: unknown;
        post_submit_config?: unknown;
      }
    | {
        title?: string;
        public_slug?: string | null;
        schema?: ApplicationFormSchema;
        fee_config?: unknown;
        post_submit_config?: unknown;
      }[]
    | null;
  const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
  const applicationStatus = String(data.status);
  const feeConfig = parseApplicationFormFeeConfig(form?.fee_config);
  const stepIndex = parseApplicationFormStepIndex(data.responses);
  const postSubmitConfig = parseApplicationFormPostSubmitConfig(form?.post_submit_config);
  const visits = await listScheduledVisitsForApplications(supabase, [applicationId]);
  const postSubmitSteps = buildAdminPostSubmitSteps(
    postSubmitConfig,
    visits,
    applicationStatus,
  );
  const rawSchema = (form?.schema as ApplicationFormSchema) ?? {
    sections: [],
    acknowledgments: [],
  };
  const schema = isApplyFormSlug(form?.public_slug)
    ? ensureApplySystemSchema(rawSchema)
    : rawSchema;

  return {
    id: String(data.id),
    status: applicationStatus,
    submittedAt: data.submitted_at ? String(data.submitted_at) : null,
    formTitle: String(form?.title ?? "Application"),
    schema,
    feeConfig,
    stepIndex,
    responses: parseStringRecord(data.responses),
    acknowledgments: parseBooleanRecord(data.acknowledgments),
    postSubmitSteps,
  };
}
