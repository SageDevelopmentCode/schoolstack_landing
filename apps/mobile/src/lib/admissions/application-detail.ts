import type { SupabaseClient } from '@supabase/supabase-js';

import {
  loadPostSubmitStepsForApplication,
  type AdminPostSubmitStep,
} from '@/lib/admissions/admin-post-submit-steps';
import {
  parseApplicationFormFeeConfig,
  parseApplicationFormPostSubmitConfig,
  parseApplicationFormSchema,
  type ApplicationFormFeeConfig,
  type ApplicationFormSchema,
} from '@/lib/admissions/application-form-schema';
import { parseApplicationFormStepIndex } from '@/lib/admissions/application-form-steps';

const PROGRESS_KEY = '__progress';

export type ApplicationDetail = {
  id: string;
  status: string;
  submittedAt: string | null;
  formTitle: string;
  schema: ApplicationFormSchema;
  feeConfig: ApplicationFormFeeConfig;
  feeStatus: string;
  stepIndex: number;
  responses: Record<string, string>;
  acknowledgments: Record<string, boolean>;
  postSubmitSteps: AdminPostSubmitStep[];
  studentId: string | null;
  profilePhotoUrl: string | null;
};

function parseStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (key === PROGRESS_KEY) continue;
    if (typeof entry === 'string') result[key] = entry;
    else if (entry != null) result[key] = String(entry);
  }
  return result;
}

function parseBooleanRecord(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<string, boolean> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === 'boolean') result[key] = entry;
  }
  return result;
}

export async function loadApplicationDetail(
  supabase: SupabaseClient,
  applicationId: string,
  organizationId: string,
): Promise<ApplicationDetail | null> {
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      id,
      status,
      fee_status,
      submitted_at,
      student_id,
      responses,
      acknowledgments,
      students:student_id (
        profile_photo_url
      ),
      application_form_versions!inner (
        title,
        schema,
        fee_config,
        post_submit_config
      )
    `,
    )
    .eq('id', applicationId)
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const formVersion = data.application_form_versions as
    | {
        title?: string;
        schema?: unknown;
        fee_config?: unknown;
        post_submit_config?: unknown;
      }
    | Array<{
        title?: string;
        schema?: unknown;
        fee_config?: unknown;
        post_submit_config?: unknown;
      }>
    | null;
  const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
  const applicationStatus = String(data.status);
  const schema = parseApplicationFormSchema(form?.schema);
  const feeConfig = parseApplicationFormFeeConfig(form?.fee_config);
  const postSubmitConfig = parseApplicationFormPostSubmitConfig(form?.post_submit_config);
  const postSubmitSteps = await loadPostSubmitStepsForApplication(
    supabase,
    applicationId,
    postSubmitConfig,
    applicationStatus,
  );

  const studentRow = data.students as
    | { profile_photo_url?: string | null }
    | Array<{ profile_photo_url?: string | null }>
    | null;
  const student = Array.isArray(studentRow) ? studentRow[0] : studentRow;

  return {
    id: String(data.id),
    status: applicationStatus,
    submittedAt: data.submitted_at ? String(data.submitted_at) : null,
    formTitle: String(form?.title ?? 'Application'),
    schema,
    feeConfig,
    feeStatus: String(data.fee_status ?? 'not_required'),
    stepIndex: parseApplicationFormStepIndex(data.responses),
    responses: parseStringRecord(data.responses),
    acknowledgments: parseBooleanRecord(data.acknowledgments),
    postSubmitSteps,
    studentId: data.student_id ? String(data.student_id) : null,
    profilePhotoUrl: student?.profile_photo_url ? String(student.profile_photo_url) : null,
  };
}
