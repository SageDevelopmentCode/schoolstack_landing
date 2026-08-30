import { buildAgreementEnrollmentHref } from "./enrollment-agreement-enrollment-href";

export const ENROLLMENT_AGREEMENT_INCOMPLETE_NOTICE =
  "Your enrollment agreement still needs your signature. Please finish signing to complete enrollment.";

export type EnrollmentAgreementIncompleteBannerItem = {
  applicationId: string;
  studentName: string;
  checklistItemLabel: string;
  enrollmentHref: string;
};

type IncompleteBannerSource = {
  checklistItemLabel: string;
  templateItemId: string;
  resumeSectionId: string;
};

export function buildEnrollmentAgreementIncompleteBannerItems(input: {
  schoolSlug: string;
  familyChildren: Array<{ applicationId: string; studentName: string }>;
  incompleteByApplicationId: Record<string, IncompleteBannerSource[]>;
  previewBasePath?: string;
}): EnrollmentAgreementIncompleteBannerItem[] {
  const items: EnrollmentAgreementIncompleteBannerItem[] = [];

  for (const child of input.familyChildren) {
    const incompleteItems = input.incompleteByApplicationId[child.applicationId] ?? [];
    for (const incomplete of incompleteItems) {
      const enrollmentBasePath = input.previewBasePath
        ? `${input.previewBasePath}/apply/${child.applicationId}/enrollment`
        : `/school/${input.schoolSlug}/apply/${child.applicationId}/enrollment`;

      items.push({
        applicationId: child.applicationId,
        studentName: child.studentName,
        checklistItemLabel: incomplete.checklistItemLabel,
        enrollmentHref: buildAgreementEnrollmentHref(
          enrollmentBasePath,
          incomplete.templateItemId,
          incomplete.resumeSectionId,
        ),
      });
    }
  }

  return items;
}

export function buildEnrollmentAgreementIncompleteBannerItemsFromApplications(input: {
  schoolSlug: string;
  applications: Array<{ id: string; studentName?: string | null }>;
  incompleteByApplicationId: Record<string, IncompleteBannerSource[]>;
  previewBasePath?: string;
}): EnrollmentAgreementIncompleteBannerItem[] {
  const items: EnrollmentAgreementIncompleteBannerItem[] = [];

  for (const application of input.applications) {
    const incompleteItems = input.incompleteByApplicationId[application.id] ?? [];
    const studentName = application.studentName?.trim() || "Student";

    for (const incomplete of incompleteItems) {
      const enrollmentBasePath = input.previewBasePath
        ? `${input.previewBasePath}/apply/${application.id}/enrollment`
        : `/school/${input.schoolSlug}/apply/${application.id}/enrollment`;

      items.push({
        applicationId: application.id,
        studentName,
        checklistItemLabel: incomplete.checklistItemLabel,
        enrollmentHref: buildAgreementEnrollmentHref(
          enrollmentBasePath,
          incomplete.templateItemId,
          incomplete.resumeSectionId,
        ),
      });
    }
  }

  return items;
}
