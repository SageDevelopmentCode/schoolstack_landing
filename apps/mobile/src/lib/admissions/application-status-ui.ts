import type { EnrollmentProgressSummaryTone } from '@/lib/admissions/enrollment-progress';
import type { MobileAdminTheme } from '@/lib/organization-settings/build-admin-theme';

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  fee_pending: 'Fee pending',
  under_review: 'Under review',
  observation: 'Observation',
  accepted: 'Accepted',
  enrolling: 'Enrolling',
  enrolled: 'Enrolled',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
};

export const APPLICATION_STATUS_FILTER_ORDER = [
  'draft',
  'submitted',
  'fee_pending',
  'under_review',
  'observation',
  'accepted',
  'enrolling',
  'enrolled',
  'declined',
  'withdrawn',
] as const;

export const APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL = ['withdrawn'] as const;

export const FEE_STATUS_LABELS: Record<string, string> = {
  not_required: '—',
  pending: 'Pending',
  paid: 'Paid',
  waived: 'Waived',
};

export function applicationStatusLabel(status: string): string {
  return APPLICATION_STATUS_LABELS[status] ?? status;
}

export function adminApplicationStatusLabel(status: string): string {
  if (status === 'draft') return 'Applying';
  return applicationStatusLabel(status);
}

export type StatusBadgeColors = {
  backgroundColor: string;
  color: string;
};

export function applicationStatusBadgeStyle(
  status: string,
  theme?: MobileAdminTheme,
): StatusBadgeColors {
  switch (status) {
    case 'accepted':
    case 'enrolled':
      return { backgroundColor: theme?.successBg ?? '#E2EDD9', color: theme?.success ?? '#4A6B52' };
    case 'draft':
      return {
        backgroundColor: theme?.warningBg ?? '#FDF3E3',
        color: theme?.warning ?? '#D97706',
      };
    case 'enrolling':
      return { backgroundColor: theme?.infoBg ?? '#E8F0FA', color: theme?.info ?? '#3B6FA0' };
    case 'declined':
    case 'withdrawn':
      return { backgroundColor: theme?.errorBg ?? '#FCE8E6', color: theme?.error ?? '#B42318' };
    case 'under_review':
    case 'observation':
      return { backgroundColor: theme?.infoBg ?? '#E8F0FA', color: theme?.info ?? '#3B6FA0' };
    case 'submitted':
    case 'fee_pending':
      return {
        backgroundColor: theme?.warningBg ?? '#FDF3E3',
        color: theme?.warning ?? '#A05C45',
      };
    default:
      return {
        backgroundColor: theme?.elevated ?? '#F0EBE3',
        color: theme?.textSecondary ?? '#6D6257',
      };
  }
}

export function adminCombinedStatusProgressLabel(
  status: string,
  applicationProgressSummary: { completed: number; total: number } | null,
  enrollmentSummary: { completed: number; total: number } | null,
): string {
  const statusLabel = adminApplicationStatusLabel(status);
  if (status === 'draft' && applicationProgressSummary) {
    return `${statusLabel} • ${applicationProgressSummary.completed}/${applicationProgressSummary.total}`;
  }
  if (status === 'enrolling' && enrollmentSummary) {
    return `${statusLabel} • ${enrollmentSummary.completed}/${enrollmentSummary.total}`;
  }
  return statusLabel;
}

export function adminCombinedStatusProgressBadgeStyle(
  status: string,
  enrollmentSummary: { tone: EnrollmentProgressSummaryTone } | null,
  theme?: MobileAdminTheme,
): StatusBadgeColors {
  if (status === 'draft') {
    return {
      backgroundColor: theme?.warningBg ?? '#FDF3E3',
      color: theme?.warning ?? '#D97706',
    };
  }
  if (status === 'enrolling' && enrollmentSummary) {
    return enrollmentProgressBadgeStyle(enrollmentSummary.tone, theme);
  }
  return applicationStatusBadgeStyle(status, theme);
}

export function applicationProgressBadgeStyle(
  completed: number,
  total: number,
  theme?: MobileAdminTheme,
): StatusBadgeColors {
  if (total > 0 && completed === total) {
    return { backgroundColor: theme?.successBg ?? '#E2EDD9', color: theme?.success ?? '#4A6B52' };
  }
  if (completed > 0) {
    return { backgroundColor: theme?.infoBg ?? '#E8F0FA', color: theme?.info ?? '#3B6FA0' };
  }
  return {
    backgroundColor: theme?.elevated ?? '#F0EBE3',
    color: theme?.textSecondary ?? '#6D6257',
  };
}

export function enrollmentProgressBadgeStyle(
  tone: 'complete' | 'in_progress' | 'not_started',
  theme?: MobileAdminTheme,
): StatusBadgeColors {
  switch (tone) {
    case 'complete':
      return { backgroundColor: theme?.successBg ?? '#E2EDD9', color: theme?.success ?? '#4A6B52' };
    case 'in_progress':
      return { backgroundColor: theme?.infoBg ?? '#E8F0FA', color: theme?.info ?? '#3B6FA0' };
    default:
      return {
        backgroundColor: theme?.elevated ?? '#F0EBE3',
        color: theme?.textSecondary ?? '#6D6257',
      };
  }
}

export function postSubmitSummaryBadgeStyle(
  tone: 'complete' | 'scheduled' | 'pending' | 'none',
  theme?: MobileAdminTheme,
): StatusBadgeColors {
  switch (tone) {
    case 'complete':
      return { backgroundColor: theme?.successBg ?? '#E2EDD9', color: theme?.success ?? '#4A6B52' };
    case 'scheduled':
      return { backgroundColor: theme?.infoBg ?? '#E8F0FA', color: theme?.info ?? '#3B6FA0' };
    case 'pending':
      return {
        backgroundColor: theme?.warningBg ?? '#FDF3E3',
        color: theme?.warning ?? '#A05C45',
      };
    default:
      return {
        backgroundColor: theme?.elevated ?? '#F0EBE3',
        color: theme?.textSecondary ?? '#6D6257',
      };
  }
}

export function organizationStatusBadgeStyle(
  status: string,
  theme?: MobileAdminTheme,
): StatusBadgeColors {
  switch (status) {
    case 'live':
      return { backgroundColor: theme?.successBg ?? '#E2EDD9', color: theme?.success ?? '#4A6B52' };
    case 'onboarding':
      return { backgroundColor: theme?.infoBg ?? '#E8F0FA', color: theme?.info ?? '#3B6FA0' };
    case 'paused':
      return {
        backgroundColor: theme?.elevated ?? '#F0EBE3',
        color: theme?.textSecondary ?? '#6D6257',
      };
    default:
      return {
        backgroundColor: theme?.bg ?? '#F7F1E7',
        color: theme?.textTertiary ?? '#6D6257',
      };
  }
}

export function organizationStatusLabel(status: string): string {
  switch (status) {
    case 'onboarding':
      return 'Onboarding';
    case 'live':
      return 'Live';
    case 'paused':
      return 'Paused';
    case 'churned':
      return 'Churned';
    default:
      return status;
  }
}
