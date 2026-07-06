import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApplicationFormSchema } from "./application-form-schema";

const PROGRESS_KEY = "__progress";

export type FamilyApplication = {
  id: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  formTitle: string;
  publicSlug: string | null;
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
  responses: Record<string, string>;
  acknowledgments: Record<string, boolean>;
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  fee_pending: "Fee pending",
  under_review: "Under review",
  observation: "Observation",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

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

async function getFamilyIdsForUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("guardians")
    .select("family_id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId);

  if (error) throw error;
  return (data ?? []).map((row) => String(row.family_id));
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
): Promise<FamilyApplication[]> {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      status,
      submitted_at,
      created_at,
      application_form_versions!inner (
        title,
        public_slug
      )
    `,
    )
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const formVersion = row.application_form_versions as
      | { title?: string; public_slug?: string | null }
      | { title?: string; public_slug?: string | null }[]
      | null;
    const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;

    return {
      id: String(row.id),
      status: String(row.status),
      submittedAt: row.submitted_at ? String(row.submitted_at) : null,
      createdAt: String(row.created_at),
      formTitle: String(form?.title ?? "Application"),
      publicSlug:
        typeof form?.public_slug === "string" ? form.public_slug : null,
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

export async function loadApplicationDetail(
  supabase: SupabaseClient,
  applicationId: string,
  organizationId: string,
): Promise<ApplicationDetail | null> {
  const { data, error } = await supabase
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
        schema
      )
    `,
    )
    .eq("id", applicationId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const formVersion = data.application_form_versions as
    | { title?: string; schema?: ApplicationFormSchema }
    | { title?: string; schema?: ApplicationFormSchema }[]
    | null;
  const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;

  return {
    id: String(data.id),
    status: String(data.status),
    submittedAt: data.submitted_at ? String(data.submitted_at) : null,
    formTitle: String(form?.title ?? "Application"),
    schema: (form?.schema as ApplicationFormSchema) ?? {
      sections: [],
      acknowledgments: [],
    },
    responses: parseStringRecord(data.responses),
    acknowledgments: parseBooleanRecord(data.acknowledgments),
  };
}
