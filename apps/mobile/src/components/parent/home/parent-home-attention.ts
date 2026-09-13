import type {
  EnrollmentAgreementAmendmentBannerItem,
  EnrollmentAgreementIncompleteBannerItem,
  ResolvedParentOnboardingItem,
} from '@/lib/parent/parent-portal-api';

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

export function buildAttentionItems(input: {
  onboardingItems: ResolvedParentOnboardingItem[];
  enrollmentAmendmentBannerItems: EnrollmentAgreementAmendmentBannerItem[];
  enrollmentIncompleteBannerItems: EnrollmentAgreementIncompleteBannerItem[];
}): ParentHomeAttentionItem[] {
  const items: ParentHomeAttentionItem[] = [];

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
