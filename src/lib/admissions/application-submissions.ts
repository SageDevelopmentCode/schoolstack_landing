import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApplicationFormSchema } from "./application-form-schema";
import { parseApplicationFormFeeConfig } from "./application-form-schema";

const PROGRESS_KEY = "__progress";

const STUDENT_NAME_KEYS = [
  "student_first_name",
  "student_name",
  "child_first_name",
  "child_name",
  "first_name",
];

export type AdminApplicationSubmission = {
  id: string;
  status: string;
  feeStatus: string;
  feeEnabled: boolean;
  formTitle: string;
  formSlug: string | null;
  programName: string | null;
  guardianName: string | null;
  contactEmail: string | null;
  studentLabel: string | null;
  stepIndex: number;
  totalSteps: number;
  createdAt: string;
  submittedAt: string | null;
  updatedAt: string;
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

export function extractStudentLabel(responses: Record<string, string>): string | null {
  for (const key of STUDENT_NAME_KEYS) {
    const value = responses[key]?.trim();
    if (value) return value;
  }

  const first = responses.student_first_name?.trim();
  const last = responses.student_last_name?.trim();
  if (first || last) {
    return [first, last].filter(Boolean).join(" ");
  }

  return null;
}

export function parseDraftProgress(
  responses: unknown,
  schema: ApplicationFormSchema,
): { stepIndex: number; totalSteps: number } {
  const record =
    responses && typeof responses === "object" && !Array.isArray(responses)
      ? (responses as Record<string, unknown>)
      : {};
  const progress =
    record[PROGRESS_KEY] && typeof record[PROGRESS_KEY] === "object"
      ? (record[PROGRESS_KEY] as Record<string, unknown>)
      : {};
  const rawStep = progress.stepIndex;
  const stepIndex =
    typeof rawStep === "number" && Number.isFinite(rawStep) && rawStep >= 0
      ? Math.floor(rawStep)
      : 0;
  const totalSteps = Math.max(schema.sections.length, 1);

  return {
    stepIndex: Math.min(stepIndex, totalSteps - 1),
    totalSteps,
  };
}

export function formatSubmissionProgress(submission: AdminApplicationSubmission): string {
  if (submission.status === "draft") {
    return `Step ${submission.stepIndex + 1} of ${submission.totalSteps}`;
  }

  if (submission.submittedAt) {
    const date = new Date(submission.submittedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `Submitted ${date}`;
  }

  return "—";
}

export function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function listOrgApplicationSubmissions(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<AdminApplicationSubmission[]> {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      status,
      fee_status,
      responses,
      created_at,
      submitted_at,
      updated_at,
      application_form_versions!inner (
        title,
        public_slug,
        schema,
        fee_config
      ),
      guardians:primary_guardian_id (
        first_name,
        last_name,
        email
      ),
      families (
        name,
        primary_email
      ),
      programs (
        name
      ),
      students:student_id (
        first_name,
        last_name
      )
    `,
    )
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const formVersion = row.application_form_versions as
      | {
          title?: string;
          public_slug?: string | null;
          schema?: ApplicationFormSchema;
          fee_config?: unknown;
        }
      | {
          title?: string;
          public_slug?: string | null;
          schema?: ApplicationFormSchema;
          fee_config?: unknown;
        }[]
      | null;
    const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
    const schema = (form?.schema as ApplicationFormSchema) ?? { sections: [], acknowledgments: [] };
    const feeConfig = parseApplicationFormFeeConfig(form?.fee_config);
    const responses = parseStringRecord(row.responses);
    const { stepIndex, totalSteps } = parseDraftProgress(row.responses, schema);

    const guardian = row.guardians as
      | { first_name?: string; last_name?: string; email?: string | null }
      | { first_name?: string; last_name?: string; email?: string | null }[]
      | null;
    const guardianRow = Array.isArray(guardian) ? guardian[0] : guardian;

    const family = row.families as
      | { name?: string; primary_email?: string | null }
      | { name?: string; primary_email?: string | null }[]
      | null;
    const familyRow = Array.isArray(family) ? family[0] : family;

    const program = row.programs as { name?: string } | { name?: string }[] | null;
    const programRow = Array.isArray(program) ? program[0] : program;

    const student = row.students as
      | { first_name?: string; last_name?: string }
      | { first_name?: string; last_name?: string }[]
      | null;
    const studentRow = Array.isArray(student) ? student[0] : student;

    const guardianName = guardianRow
      ? [guardianRow.first_name, guardianRow.last_name].filter(Boolean).join(" ") || null
      : null;

    const studentFromTable = studentRow
      ? [studentRow.first_name, studentRow.last_name].filter(Boolean).join(" ") || null
      : null;

    return {
      id: String(row.id),
      status: String(row.status),
      feeStatus: String(row.fee_status),
      feeEnabled: feeConfig.enabled,
      formTitle: String(form?.title ?? "Application"),
      formSlug: typeof form?.public_slug === "string" ? form.public_slug : null,
      programName: programRow?.name ? String(programRow.name) : null,
      guardianName,
      contactEmail:
        guardianRow?.email?.trim() ||
        familyRow?.primary_email?.trim() ||
        null,
      studentLabel: studentFromTable ?? extractStudentLabel(responses),
      stepIndex,
      totalSteps,
      createdAt: String(row.created_at),
      submittedAt: row.submitted_at ? String(row.submitted_at) : null,
      updatedAt: String(row.updated_at),
    };
  });
}
