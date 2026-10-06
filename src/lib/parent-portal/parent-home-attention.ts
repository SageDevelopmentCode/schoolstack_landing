import type { ParentSignupAttentionItem } from "@/lib/classroom-signups/types";
import { parentClassroomSignupPath } from "@/lib/organization-settings/parent-routes";
import type { ResolvedParentOnboardingItem } from "@/lib/organization-settings/parent-onboarding";
import type { EnrollmentAgreementAmendmentBannerItem } from "@/lib/admissions/enrollment-agreement-amendment-banner";
import {
  ENROLLMENT_AGREEMENT_INCOMPLETE_NOTICE,
  type EnrollmentAgreementIncompleteBannerItem,
} from "@/lib/admissions/enrollment-agreement-incomplete-banner";
import type { ParentFormAttentionItem } from "@/lib/school-parent/forms-documents/load-parent-form-attention-items";
import { formatFormDueDate } from "@/lib/school-teacher/forms-documents/utils";

export type ParentPortalAttentionIconKind =
  | "form"
  | "signup"
  | "enrollment-incomplete"
  | "enrollment-amendment"
  | "onboarding";

export type ParentPortalAttentionItem = {
  key: string;
  title: string;
  subtitle?: string;
  href?: string;
  urgent?: boolean;
  iconBg?: string;
  iconKind: ParentPortalAttentionIconKind;
  onboardingItem?: ResolvedParentOnboardingItem;
};

export type BuildParentPortalAttentionInput = {
  enrollmentAmendmentBannerItems: EnrollmentAgreementAmendmentBannerItem[];
  enrollmentIncompleteBannerItems: EnrollmentAgreementIncompleteBannerItem[];
  formAttentionItems: ParentFormAttentionItem[];
  classroomSignupAttentionItems: ParentSignupAttentionItem[];
  schoolSlug: string;
  previewBasePath?: string;
};

export function buildPortalAttentionItems(
  input: BuildParentPortalAttentionInput,
): ParentPortalAttentionItem[] {
  const items: ParentPortalAttentionItem[] = [];

  for (const form of input.formAttentionItems) {
    items.push({
      key: `form-${form.formId}`,
      title: `Sign ${form.formTitle}`,
      subtitle: form.dueDate
        ? `Due ${formatFormDueDate(form.dueDate)}`
        : "This form needs your signature.",
      href: form.formsHref,
      urgent: true,
      iconKind: "form",
    });
  }

  for (const signup of input.classroomSignupAttentionItems) {
    items.push({
      key: `signup-${signup.signupId}`,
      title: "Help in the classroom",
      subtitle: `${signup.teacherName} needs help with ${signup.title}${
        signup.classroomName ? ` (${signup.classroomName})` : ""
      }`,
      href: parentClassroomSignupPath(
        input.schoolSlug,
        signup.signupId,
        input.previewBasePath,
      ),
      iconKind: "signup",
      iconBg: "#E9F2EA",
    });
  }

  for (const item of input.enrollmentIncompleteBannerItems) {
    items.push({
      key: `incomplete-${item.applicationId}`,
      title: `Sign ${item.studentName.split(" ")[0]}'s enrollment agreement`,
      subtitle: ENROLLMENT_AGREEMENT_INCOMPLETE_NOTICE,
      href: item.enrollmentHref,
      urgent: true,
      iconKind: "enrollment-incomplete",
    });
  }

  for (const item of input.enrollmentAmendmentBannerItems) {
    items.push({
      key: `amendment-${item.applicationId}`,
      title: `Review ${item.studentName.split(" ")[0]}'s agreement update`,
      subtitle: item.amendmentNotice,
      href: item.enrollmentHref,
      urgent: true,
      iconKind: "enrollment-amendment",
    });
  }

  return items;
}

export function buildStartHereAttentionItems(
  input: BuildParentPortalAttentionInput & {
    onboardingItems: ResolvedParentOnboardingItem[];
  },
): ParentPortalAttentionItem[] {
  const items = buildPortalAttentionItems(input);

  for (const item of input.onboardingItems) {
    if (item.completed || !item.autoTracked) continue;
    items.push({
      key: `onboarding-${item.id}`,
      title: item.label,
      href: item.href,
      iconKind: "onboarding",
      onboardingItem: item,
    });
  }

  return items;
}
