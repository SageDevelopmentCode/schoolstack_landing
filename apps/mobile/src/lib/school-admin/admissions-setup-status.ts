import type { SupabaseClient } from '@supabase/supabase-js';

import {
  getOrganizationPaymentAccount,
  isPaymentReady,
  type OrganizationPaymentAccount,
} from '@/lib/school-admin/payment-account';

const APPLY_FORM_PUBLIC_SLUG = 'apply';
const ENROLLMENT_CHECKLIST_PATH = 'enrollment';

export type AdmissionsSetupStepId =
  | 'programs'
  | 'stripe'
  | 'apply_form'
  | 'enrollment_checklist'
  | 'go_live';

export type AdmissionsSetupStepStatus = 'not_started' | 'in_progress' | 'completed';

export type AdmissionsSetupStep = {
  id: AdmissionsSetupStepId;
  title: string;
  description: string;
  status: AdmissionsSetupStepStatus;
};

export type AdmissionsSetupStatus = {
  steps: AdmissionsSetupStep[];
  completedCount: number;
  totalCount: number;
  firstIncompleteStepId: AdmissionsSetupStepId | null;
  applyFormPublicPath: string | null;
};

type AdmissionsSetupRawData = {
  hasPrograms: boolean;
  paymentAccount: OrganizationPaymentAccount | null;
  applyFormStatus: 'none' | 'draft' | 'published';
  applyFormPublicSlug: string | null;
  checklistStatus: 'none' | 'draft' | 'published';
  checklistItemCount: number;
  hasSubmissions: boolean;
};

export function computeProgramsStepStatus(hasPrograms: boolean): AdmissionsSetupStepStatus {
  return hasPrograms ? 'completed' : 'not_started';
}

export function computeStripeStepStatus(account: OrganizationPaymentAccount | null): AdmissionsSetupStepStatus {
  if (!account?.stripeConnectAccountId) return 'not_started';
  if (isPaymentReady(account)) return 'completed';
  return 'in_progress';
}

export function computeApplyFormStepStatus(status: 'none' | 'draft' | 'published'): AdmissionsSetupStepStatus {
  if (status === 'published') return 'completed';
  if (status === 'draft') return 'in_progress';
  return 'not_started';
}

export function computeChecklistStepStatus(
  status: 'none' | 'draft' | 'published',
  itemCount: number,
): AdmissionsSetupStepStatus {
  if (status === 'published' && itemCount >= 1) return 'completed';
  if (status === 'draft' || status === 'published') return 'in_progress';
  return 'not_started';
}

export function computeGoLiveStepStatus(
  applyFormPublished: boolean,
  checklistPublished: boolean,
  hasSubmissions: boolean,
): AdmissionsSetupStepStatus {
  if (!applyFormPublished || !checklistPublished) return 'not_started';
  if (hasSubmissions) return 'completed';
  return 'in_progress';
}

function buildAdmissionsSetupStatus(slug: string, data: AdmissionsSetupRawData): AdmissionsSetupStatus {
  const programsStatus = computeProgramsStepStatus(data.hasPrograms);
  const stripeStatus = computeStripeStepStatus(data.paymentAccount);
  const applyFormStatus = computeApplyFormStepStatus(data.applyFormStatus);
  const checklistStatus = computeChecklistStepStatus(data.checklistStatus, data.checklistItemCount);
  const applyFormPublished = data.applyFormStatus === 'published';
  const checklistPublished = data.checklistStatus === 'published' && data.checklistItemCount >= 1;
  const goLiveStatus = computeGoLiveStepStatus(
    applyFormPublished,
    checklistPublished,
    data.hasSubmissions,
  );

  const steps: AdmissionsSetupStep[] = [
    {
      id: 'programs',
      title: 'Set up programs',
      description:
        'Add the programs families can apply to, such as grade levels or school years.',
      status: programsStatus,
    },
    {
      id: 'stripe',
      title: 'Connect Stripe',
      description:
        "Connect your school's Stripe account to collect application and enrollment fees.",
      status: stripeStatus,
    },
    {
      id: 'apply_form',
      title: 'Create your apply form',
      description: 'Build the form families fill out when they apply to your school.',
      status: applyFormStatus,
    },
    {
      id: 'enrollment_checklist',
      title: 'Create enrollment checklist',
      description:
        'Set up the steps accepted families complete before enrollment is finalized.',
      status: checklistStatus,
    },
    {
      id: 'go_live',
      title: 'Go live',
      description: 'Share your apply link with families and review incoming submissions.',
      status: goLiveStatus,
    },
  ];

  const completedCount = steps.filter((step) => step.status === 'completed').length;
  const firstIncompleteStepId = steps.find((step) => step.status !== 'completed')?.id ?? null;

  const applyFormPublicPath = applyFormPublished
    ? `/school/${slug}/forms/${APPLY_FORM_PUBLIC_SLUG}`
    : null;

  return {
    steps,
    completedCount,
    totalCount: steps.length,
    firstIncompleteStepId,
    applyFormPublicPath,
  };
}

function normalizeApplyFormRowsStatus(
  rows: Array<{ status?: string }>,
): 'none' | 'draft' | 'published' {
  if (rows.some((row) => row.status === 'published')) return 'published';
  if (rows.some((row) => row.status === 'draft')) return 'draft';
  return 'none';
}

function normalizeApplyFormStatus(status: string | undefined): 'none' | 'draft' | 'published' {
  if (status === 'draft' || status === 'published') return status;
  return 'none';
}

function normalizeChecklistRowsStatus(
  rows: Array<{ status?: string }>,
): 'none' | 'draft' | 'published' {
  if (rows.some((row) => row.status === 'published')) return 'published';
  if (rows.some((row) => row.status === 'draft')) return 'draft';
  return 'none';
}

function normalizeChecklistStatus(status: string | undefined): 'none' | 'draft' | 'published' {
  if (status === 'draft' || status === 'published') return status;
  return 'none';
}

export async function fetchAdmissionsSetupStatus(
  supabase: SupabaseClient,
  organizationId: string,
  slug: string,
): Promise<AdmissionsSetupStatus> {
  const [programsResult, paymentAccount, applyFormResult, checklistResult, submissionsResult] =
    await Promise.all([
      supabase.from('programs').select('id').eq('organization_id', organizationId).limit(1),
      getOrganizationPaymentAccount(supabase, organizationId),
      supabase
        .from('application_form_versions')
        .select('status, public_slug')
        .eq('organization_id', organizationId)
        .eq('form_kind', 'apply')
        .in('status', ['draft', 'published'])
        .order('updated_at', { ascending: false }),
      supabase
        .from('enrollment_checklist_templates')
        .select('id, status, enrollment_checklist_template_items(id)')
        .eq('organization_id', organizationId)
        .eq('enrollment_path', ENROLLMENT_CHECKLIST_PATH)
        .in('status', ['draft', 'published'])
        .order('updated_at', { ascending: false }),
      supabase.from('applications').select('id').eq('organization_id', organizationId).limit(1),
    ]);

  if (programsResult.error) throw programsResult.error;
  if (applyFormResult.error) throw applyFormResult.error;
  if (checklistResult.error) throw checklistResult.error;
  if (submissionsResult.error) throw submissionsResult.error;

  const checklistRows = (checklistResult.data ?? []) as Array<{
    status?: string;
    enrollment_checklist_template_items?: Array<{ id: string }>;
  }>;

  const applyFormRows = applyFormResult.data ?? [];
  const publishedApplyForm = applyFormRows.find((row) => row.status === 'published');
  const publishedChecklist = checklistRows.find((row) => row.status === 'published');
  const draftChecklist = checklistRows.find((row) => row.status === 'draft');

  const rawData: AdmissionsSetupRawData = {
    hasPrograms: (programsResult.data ?? []).length > 0,
    paymentAccount,
    applyFormStatus: normalizeApplyFormRowsStatus(applyFormRows),
    applyFormPublicSlug:
      typeof publishedApplyForm?.public_slug === 'string'
        ? publishedApplyForm.public_slug
        : typeof applyFormRows[0]?.public_slug === 'string'
          ? applyFormRows[0].public_slug
          : null,
    checklistStatus: normalizeChecklistRowsStatus(checklistRows),
    checklistItemCount:
      publishedChecklist?.enrollment_checklist_template_items?.length ??
      draftChecklist?.enrollment_checklist_template_items?.length ??
      0,
    hasSubmissions: (submissionsResult.data ?? []).length > 0,
  };

  return buildAdmissionsSetupStatus(slug, rawData);
}
