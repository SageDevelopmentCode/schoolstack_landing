import type { SupabaseClient } from '@supabase/supabase-js';

import type { EnrollmentProgressSummary, EnrollmentProgressSummaryTone } from '@/lib/admissions/enrollment-progress';
import { listEnrollmentProgressForApplications } from '@/lib/admissions/enrollment-progress';
import {
  buildApplicationFormSteps,
  computeApplicationFormStepStatuses,
  parseApplicationFormStepIndex,
  summarizeApplicationFormProgress,
} from '@/lib/admissions/application-form-steps';
import { applicationStatusLabel, FEE_STATUS_LABELS } from '@/lib/admissions/application-status-ui';

export type PostSubmitSummaryTone = 'complete' | 'scheduled' | 'pending' | 'none';

export type PostSubmitSummary = {
  label: string;
  tone: PostSubmitSummaryTone;
};

export type ApplicationProgressSummary = {
  completed: number;
  total: number;
  label: string;
};

export type AdminApplicationSubmission = {
  id: string;
  status: string;
  feeStatus: string;
  feeEnabled: boolean;
  formTitle: string;
  formSlug: string | null;
  programName: string | null;
  guardianName: string | null;
  primaryGuardianId: string | null;
  contactEmail: string | null;
  studentLabel: string | null;
  stepIndex: number;
  totalSteps: number;
  applicationProgressSummary: ApplicationProgressSummary | null;
  createdAt: string;
  submittedAt: string | null;
  updatedAt: string;
  hasPostSubmitActions: boolean;
  postSubmitSummary: PostSubmitSummary | null;
  enrollmentSummary: EnrollmentProgressSummary | null;
};

const PROGRESS_KEY = '__progress';

const STUDENT_NAME_KEYS = [
  'student_first_name',
  'student_name',
  'child_first_name',
  'child_name',
  'first_name',
];

const APPLICATION_SUBMISSION_SELECT = `
  id,
  status,
  fee_status,
  responses,
  primary_guardian_id,
  created_at,
  submitted_at,
  updated_at,
  application_form_versions!inner (
    title,
    public_slug,
    schema,
    fee_config,
    post_submit_config
  ),
  guardians:primary_guardian_id (
    id,
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
`;

const APPLICATION_SUBMISSION_LIST_SELECT = `
  id,
  status,
  fee_status,
  responses,
  primary_guardian_id,
  created_at,
  submitted_at,
  updated_at,
  application_form_versions!inner (
    title,
    public_slug,
    schema,
    fee_config,
    post_submit_config
  ),
  guardians:primary_guardian_id (
    id,
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
`;

export const ORG_SUBMISSIONS_LIST_DEFAULT_LIMIT = 100;

type ListOrgApplicationSubmissionsOptions = {
  limit?: number;
  offset?: number;
};

type PostSubmitAction = {
  id: string;
  enabled?: boolean;
  required?: boolean;
};

type PostSubmitConfig = {
  actions: PostSubmitAction[];
};

type FeeConfig = {
  enabled: boolean;
  label?: string;
};

type FormSchema = {
  sections: Array<{ id: string; title: string }>;
  acknowledgments?: Array<{ id: string; label: string }>;
};

function parseStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (key === PROGRESS_KEY) continue;
    if (typeof entry === 'string') {
      result[key] = entry;
    } else if (entry != null) {
      result[key] = String(entry);
    }
  }
  return result;
}

function parseFeeConfig(raw: unknown): FeeConfig {
  if (!raw || typeof raw !== 'object') return { enabled: false };
  const record = raw as Record<string, unknown>;
  return {
    enabled: Boolean(record.enabled),
    label: typeof record.label === 'string' ? record.label : undefined,
  };
}

function parsePostSubmitConfig(raw: unknown): PostSubmitConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { actions: [] };
  }
  const record = raw as Record<string, unknown>;
  const actions = Array.isArray(record.actions)
    ? record.actions
        .filter((action): action is PostSubmitAction => Boolean(action && typeof action === 'object'))
        .map((action) => action as PostSubmitAction)
    : [];
  return { actions };
}

function formHasEnabledPostSubmitActions(config: PostSubmitConfig): boolean {
  return config.actions.some((action) => action.enabled !== false);
}

function summarizePostSubmitSteps(enabledActionCount: number, scheduledCount: number): PostSubmitSummary | null {
  if (enabledActionCount === 0) return null;

  const total = enabledActionCount;
  const completed = scheduledCount;
  const label = `${completed}/${total} done`;

  if (completed === total) {
    return { label, tone: 'complete' };
  }
  if (completed > 0) {
    return { label, tone: 'scheduled' };
  }
  return { label, tone: 'pending' };
}

export function extractStudentLabel(responses: Record<string, string>): string | null {
  const first = responses.student_first_name?.trim();
  const last = responses.student_last_name?.trim();
  if (first || last) {
    return [first, last].filter(Boolean).join(' ');
  }

  for (const key of STUDENT_NAME_KEYS) {
    const value = responses[key]?.trim();
    if (value) return value;
  }

  return null;
}

function parseDraftProgress(
  responses: unknown,
  schema: FormSchema,
): { stepIndex: number; totalSteps: number } {
  const record =
    responses && typeof responses === 'object' && !Array.isArray(responses)
      ? (responses as Record<string, unknown>)
      : {};
  const progress =
    record[PROGRESS_KEY] && typeof record[PROGRESS_KEY] === 'object'
      ? (record[PROGRESS_KEY] as Record<string, unknown>)
      : {};
  const rawStep = progress.stepIndex;
  const stepIndex =
    typeof rawStep === 'number' && Number.isFinite(rawStep) && rawStep >= 0
      ? Math.floor(rawStep)
      : 0;
  const totalSteps = Math.max(schema.sections.length, 1);

  return {
    stepIndex: Math.min(stepIndex, totalSteps - 1),
    totalSteps,
  };
}

function computeApplicationProgressSummary(
  status: string,
  responses: unknown,
  schema: FormSchema,
  feeConfig: FeeConfig,
  feeStatus: string,
): ApplicationProgressSummary | null {
  if (status !== 'draft') return null;

  const steps = buildApplicationFormSteps(schema, feeConfig);
  const stepIndex = parseApplicationFormStepIndex(responses);
  const stepsWithStatus = computeApplicationFormStepStatuses(steps, {
    applicationStatus: status,
    stepIndex,
    feeStatus,
  });
  const { completed, total } = summarizeApplicationFormProgress(stepsWithStatus);
  return { completed, total, label: `${completed}/${total} complete` };
}

export function formatSubmissionProgress(submission: AdminApplicationSubmission): string {
  if (submission.status === 'draft') {
    return submission.applicationProgressSummary?.label ?? 'Applying';
  }

  if (submission.submittedAt) {
    const date = new Date(submission.submittedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `Submitted ${date}`;
  }

  return '—';
}

export function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

async function listScheduledVisitCountsByApplication(
  supabase: SupabaseClient,
  applicationIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (applicationIds.length === 0) return counts;

  const { data, error } = await supabase
    .from('admissions_scheduled_visits')
    .select('application_id')
    .in('application_id', applicationIds)
    .eq('status', 'scheduled');

  if (error) throw error;

  for (const row of data ?? []) {
    const applicationId = String(row.application_id);
    counts.set(applicationId, (counts.get(applicationId) ?? 0) + 1);
  }

  return counts;
}

function mapApplicationRowToAdminSubmission(
  row: Record<string, unknown>,
  scheduledVisitCountByApplicationId: Map<string, number>,
  enrollmentByApplicationId: Map<string, EnrollmentProgressSummary>,
): AdminApplicationSubmission {
  const formVersion = row.application_form_versions as
    | {
        title?: string;
        public_slug?: string | null;
        schema?: FormSchema;
        fee_config?: unknown;
        post_submit_config?: unknown;
      }
    | {
        title?: string;
        public_slug?: string | null;
        schema?: FormSchema;
        fee_config?: unknown;
        post_submit_config?: unknown;
      }[]
    | null;
  const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
  const schema = form?.schema;
  const hasFullPayload = schema != null && row.responses !== undefined;
  const feeConfig = parseFeeConfig(form?.fee_config);
  const responses = row.responses !== undefined ? parseStringRecord(row.responses) : {};
  const { stepIndex, totalSteps } =
    hasFullPayload && schema
      ? parseDraftProgress(row.responses, schema)
      : { stepIndex: 0, totalSteps: 0 };

  const guardian = row.guardians as
    | { id?: string; first_name?: string; last_name?: string; email?: string | null }
    | { id?: string; first_name?: string; last_name?: string; email?: string | null }[]
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
    ? [guardianRow.first_name, guardianRow.last_name].filter(Boolean).join(' ') || null
    : null;

  const studentFromTable = studentRow
    ? [studentRow.first_name, studentRow.last_name].filter(Boolean).join(' ') || null
    : null;

  const applicationId = String(row.id);
  const applicationStatus = String(row.status);
  const postSubmitConfig = parsePostSubmitConfig(form?.post_submit_config);
  const enabledActions = postSubmitConfig.actions.filter((action) => action.enabled !== false);
  const hasPostSubmitActions = applicationStatus !== 'draft' && enabledActions.length > 0;
  const scheduledCount = scheduledVisitCountByApplicationId.get(applicationId) ?? 0;
  const postSubmitSummary = hasPostSubmitActions
    ? summarizePostSubmitSteps(enabledActions.length, scheduledCount)
    : null;

  const primaryGuardianId =
    row.primary_guardian_id != null && String(row.primary_guardian_id).trim() !== ''
      ? String(row.primary_guardian_id)
      : guardianRow?.id != null && String(guardianRow.id).trim() !== ''
        ? String(guardianRow.id)
        : null;

  const applicationProgressSummary =
    applicationStatus === 'draft' && schema
      ? computeApplicationProgressSummary(
          applicationStatus,
          row.responses,
          schema,
          feeConfig,
          String(row.fee_status),
        )
      : null;

  return {
    id: applicationId,
    status: applicationStatus,
    feeStatus: String(row.fee_status),
    feeEnabled: feeConfig.enabled,
    formTitle: String(form?.title ?? 'Application'),
    formSlug: typeof form?.public_slug === 'string' ? form.public_slug : null,
    programName: programRow?.name ? String(programRow.name) : null,
    guardianName,
    primaryGuardianId,
    contactEmail: guardianRow?.email?.trim() || familyRow?.primary_email?.trim() || null,
    studentLabel:
      studentFromTable ?? (row.responses !== undefined ? extractStudentLabel(responses) : null),
    stepIndex,
    totalSteps,
    applicationProgressSummary,
    createdAt: String(row.created_at),
    submittedAt: row.submitted_at ? String(row.submitted_at) : null,
    updatedAt: String(row.updated_at),
    hasPostSubmitActions,
    postSubmitSummary,
    enrollmentSummary: enrollmentByApplicationId.get(applicationId) ?? null,
  };
}

async function mapApplicationRowsToAdminSubmissions(
  supabase: SupabaseClient,
  organizationId: string,
  rows: Record<string, unknown>[],
): Promise<AdminApplicationSubmission[]> {
  const submittedIds = rows
    .filter((row) => String(row.status) !== 'draft')
    .map((row) => String(row.id));
  const applicationIds = rows.map((row) => String(row.id));

  const [scheduledVisitCountByApplicationId, enrollmentByApplicationId] = await Promise.all([
    listScheduledVisitCountsByApplication(supabase, submittedIds),
    listEnrollmentProgressForApplications(supabase, organizationId, applicationIds),
  ]);

  return rows.map((row) =>
    mapApplicationRowToAdminSubmission(
      row,
      scheduledVisitCountByApplicationId,
      enrollmentByApplicationId,
    ),
  );
}

export async function listOrgApplicationSubmissions(
  supabase: SupabaseClient,
  organizationId: string,
  options: ListOrgApplicationSubmissionsOptions = {},
): Promise<AdminApplicationSubmission[]> {
  const limit = Math.min(Math.max(options.limit ?? ORG_SUBMISSIONS_LIST_DEFAULT_LIMIT, 1), 500);
  const offset = Math.max(options.offset ?? 0, 0);

  const { data, error } = await supabase
    .from('applications')
    .select(APPLICATION_SUBMISSION_LIST_SELECT)
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return mapApplicationRowsToAdminSubmissions(
    supabase,
    organizationId,
    (data ?? []) as Record<string, unknown>[],
  );
}

export async function getOrgApplicationSubmissionById(
  supabase: SupabaseClient,
  organizationId: string,
  applicationId: string,
): Promise<AdminApplicationSubmission | null> {
  const { data, error } = await supabase
    .from('applications')
    .select(APPLICATION_SUBMISSION_SELECT)
    .eq('organization_id', organizationId)
    .eq('id', applicationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const status = String(data.status);
  const submittedIds = status === 'draft' ? [] : [applicationId];
  const [scheduledVisitCountByApplicationId, enrollmentByApplicationId] = await Promise.all([
    listScheduledVisitCountsByApplication(supabase, submittedIds),
    listEnrollmentProgressForApplications(supabase, organizationId, [applicationId]),
  ]);

  return mapApplicationRowToAdminSubmission(
    data as Record<string, unknown>,
    scheduledVisitCountByApplicationId,
    enrollmentByApplicationId,
  );
}

export function submissionHasFeeBadges(submission: AdminApplicationSubmission): boolean {
  return submission.feeEnabled && submission.feeStatus !== 'not_required';
}

export type FamilyAdmissionTimelineEvent = {
  id: string;
  kind: 'created' | 'submitted' | 'fee_paid' | 'draft' | 'enrollment';
  applicationId: string;
  applicationStatus: string;
  title: string;
  subtitle?: string;
  occurredAt: string;
  statusLabel?: string;
  progressLabel?: string;
  enrollmentProgress?: { completed: number; total: number };
  studentLabel: string | null;
  programName: string | null;
  applicationBadgeStatus?: string;
  enrollmentTone?: EnrollmentProgressSummaryTone;
};

function enrollmentChecklistStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In progress';
    case 'not_started':
      return 'Not started';
    default:
      return status.replace(/_/g, ' ');
  }
}

function formatEnrollmentProgressLabel(summary: EnrollmentProgressSummary | null): string {
  if (!summary || summary.total === 0) {
    return 'No required items';
  }
  return `${summary.completed}/${summary.total} required items`;
}

export async function resolveApplicationFamilyId(
  supabase: SupabaseClient,
  organizationId: string,
  applicationId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('applications')
    .select('family_id, primary_guardian_id')
    .eq('organization_id', organizationId)
    .eq('id', applicationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  if (data.family_id) return String(data.family_id);
  if (!data.primary_guardian_id) return null;

  const { data: guardian, error: guardianError } = await supabase
    .from('guardians')
    .select('family_id')
    .eq('id', data.primary_guardian_id)
    .maybeSingle();

  if (guardianError) throw guardianError;
  return guardian?.family_id ? String(guardian.family_id) : null;
}

async function listApplicationSubmissionsForFamily(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<AdminApplicationSubmission[]> {
  const { data: guardians, error: guardiansError } = await supabase
    .from('guardians')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('family_id', familyId);

  if (guardiansError) throw guardiansError;

  const guardianIds = (guardians ?? []).map((row) => String(row.id));

  let query = supabase
    .from('applications')
    .select(APPLICATION_SUBMISSION_SELECT)
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false });

  if (guardianIds.length > 0) {
    query = query.or(`family_id.eq.${familyId},primary_guardian_id.in.(${guardianIds.join(',')})`);
  } else {
    query = query.eq('family_id', familyId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return mapApplicationRowsToAdminSubmissions(
    supabase,
    organizationId,
    (data ?? []) as Record<string, unknown>[],
  );
}

export async function listFamilyAdmissionHistory(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<FamilyAdmissionTimelineEvent[]> {
  const applications = await listApplicationSubmissionsForFamily(
    supabase,
    organizationId,
    familyId,
  );
  if (applications.length === 0) return [];

  const applicationIds = applications.map((application) => application.id);

  const { data: checklistRows, error: checklistError } = await supabase
    .from('enrollment_checklists')
    .select(
      `
      id,
      application_id,
      status,
      created_at,
      updated_at,
      enrollment_checklist_templates ( name )
    `,
    )
    .eq('organization_id', organizationId)
    .in('application_id', applicationIds);

  if (checklistError) throw checklistError;

  const checklistByApplicationId = new Map(
    (checklistRows ?? []).map((row) => [String(row.application_id), row]),
  );

  const events: FamilyAdmissionTimelineEvent[] = [];

  for (const application of applications) {
    const { studentLabel, programName } = application;

    events.push({
      id: `${application.id}-created`,
      kind: 'created',
      applicationId: application.id,
      applicationStatus: application.status,
      title: 'Application created',
      subtitle: application.formTitle,
      occurredAt: application.createdAt,
      studentLabel,
      programName,
    });

    if (application.status === 'draft') {
      events.push({
        id: `${application.id}-draft`,
        kind: 'draft',
        applicationId: application.id,
        applicationStatus: application.status,
        title: 'In progress',
        subtitle: application.formTitle,
        occurredAt: application.updatedAt,
        progressLabel: application.applicationProgressSummary?.label,
        statusLabel: applicationStatusLabel('draft'),
        applicationBadgeStatus: 'draft',
        studentLabel,
        programName,
      });
    }

    if (application.submittedAt) {
      const hasChecklist = checklistByApplicationId.has(application.id);
      const displayStatus =
        application.status === 'enrolling' && hasChecklist
          ? 'submitted'
          : application.status;

      events.push({
        id: `${application.id}-submitted`,
        kind: 'submitted',
        applicationId: application.id,
        applicationStatus: application.status,
        title: 'Submitted',
        subtitle: application.formTitle,
        occurredAt: application.submittedAt,
        statusLabel: applicationStatusLabel(displayStatus),
        applicationBadgeStatus: displayStatus,
        studentLabel,
        programName,
      });
    }

    if (
      application.feeEnabled &&
      (application.feeStatus === 'paid' || application.feeStatus === 'waived')
    ) {
      events.push({
        id: `${application.id}-fee`,
        kind: 'fee_paid',
        applicationId: application.id,
        applicationStatus: application.status,
        title: FEE_STATUS_LABELS[application.feeStatus] ?? 'Fee paid',
        subtitle: application.formTitle,
        occurredAt: application.submittedAt ?? application.updatedAt,
        studentLabel,
        programName,
      });
    }

    const checklistRow = checklistByApplicationId.get(application.id);
    if (checklistRow) {
      const template = checklistRow.enrollment_checklist_templates as
        | { name?: string }
        | Array<{ name?: string }>
        | null;
      const templateRow = Array.isArray(template) ? template[0] : template;
      const checklistStatus = String(checklistRow.status);
      const summary = application.enrollmentSummary ?? null;

      events.push({
        id: String(checklistRow.id),
        kind: 'enrollment',
        applicationId: application.id,
        applicationStatus: application.status,
        title: String(templateRow?.name ?? 'Enrollment checklist'),
        occurredAt: String(checklistRow.created_at ?? checklistRow.updated_at),
        statusLabel: enrollmentChecklistStatusLabel(checklistStatus),
        progressLabel: formatEnrollmentProgressLabel(summary),
        enrollmentProgress: summary
          ? { completed: summary.completed, total: summary.total }
          : undefined,
        enrollmentTone: summary?.tone ?? 'not_started',
        studentLabel,
        programName,
      });
    }
  }

  return events.sort(
    (left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime(),
  );
}
