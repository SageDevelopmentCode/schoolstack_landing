import type {
  EnrollmentAgreementAmendmentBannerItem,
  EnrollmentAgreementIncompleteBannerItem,
  ParentFormAttentionItem,
  ResolvedParentOnboardingItem,
} from '@/lib/parent/parent-portal-api';
import type { ParentSignupAttentionItem } from '@/lib/parent/parent-classroom-signups-types';
import { parentClassroomSignupDetailRoute } from '@/lib/parent/parent-nav';

export const ENROLLMENT_AGREEMENT_INCOMPLETE_NOTICE =
  'Your enrollment agreement still needs your signature. Please finish signing to complete enrollment.';

export type ParentHomeAttentionItem = {
  key: string;
  title: string;
  subtitle?: string;
  href?: string;
  iconSlug: string;
  iconBg?: string;
  urgent?: boolean;
};

function formatFormDueDate(dueDate: string): string {
  const parsed = new Date(`${dueDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dueDate;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function buildAttentionItems(input: {
  slug: string;
  onboardingItems: ResolvedParentOnboardingItem[];
  enrollmentAmendmentBannerItems: EnrollmentAgreementAmendmentBannerItem[];
  enrollmentIncompleteBannerItems: EnrollmentAgreementIncompleteBannerItem[];
  formAttentionItems?: ParentFormAttentionItem[];
  signupAttentionItems?: ParentSignupAttentionItem[];
}): ParentHomeAttentionItem[] {
  const items: ParentHomeAttentionItem[] = [];

  for (const form of input.formAttentionItems ?? []) {
    items.push({
      key: `form-${form.formId}`,
      title: `Sign ${form.formTitle}`,
      subtitle: form.dueDate
        ? `Due ${formatFormDueDate(form.dueDate)}`
        : 'This form needs your signature.',
      href: form.formsHref,
      iconSlug: 'document-text-outline',
      urgent: true,
    });
  }

  for (const signup of input.signupAttentionItems ?? []) {
    items.push({
      key: `signup-${signup.signupId}`,
      title: 'Help in the classroom',
      subtitle: `${signup.teacherName} needs help with ${signup.title}${
        signup.classroomName ? ` (${signup.classroomName})` : ''
      }`,
      href: parentClassroomSignupDetailRoute(input.slug, signup.signupId) as string,
      iconSlug: 'clipboard-list',
      iconBg: '#E9F2EA',
    });
  }

  for (const item of input.enrollmentIncompleteBannerItems) {
    items.push({
      key: `incomplete-${item.applicationId}`,
      title: `Sign ${item.studentName.split(' ')[0]}'s enrollment agreement`,
      subtitle: ENROLLMENT_AGREEMENT_INCOMPLETE_NOTICE,
      href: item.enrollmentHref,
      iconSlug: 'alert-circle',
      urgent: true,
    });
  }

  for (const item of input.enrollmentAmendmentBannerItems) {
    items.push({
      key: `amendment-${item.applicationId}`,
      title: `Review ${item.studentName.split(' ')[0]}'s agreement update`,
      subtitle: item.amendmentNotice,
      href: item.enrollmentHref,
      iconSlug: 'alert-circle',
      urgent: true,
    });
  }

  for (const item of input.onboardingItems) {
    if (item.completed || !item.autoTracked) continue;
    items.push({
      key: `onboarding-${item.id}`,
      title: item.label,
      href: item.href,
      iconSlug: item.icon ?? 'puzzle',
    });
  }

  return items;
}
