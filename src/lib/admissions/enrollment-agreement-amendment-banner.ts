export type EnrollmentAgreementAmendmentBannerItem = {
  applicationId: string;
  studentName: string;
  checklistItemLabel: string;
  amendmentNotice: string;
  enrollmentHref: string;
};

type AmendmentBannerSource = {
  checklistItemLabel: string;
  amendmentNotice: string;
  templateItemId: string;
  pendingResignSectionIds: string[];
};

function buildEnrollmentAmendmentHref(
  enrollmentBasePath: string,
  amendment: AmendmentBannerSource,
): string {
  const params = new URLSearchParams();
  params.set("item", amendment.templateItemId);
  const firstPendingSection = amendment.pendingResignSectionIds[0];
  if (firstPendingSection) {
    params.set("section", firstPendingSection);
  }
  return `${enrollmentBasePath}?${params.toString()}`;
}

export function buildEnrollmentAgreementAmendmentBannerItems(input: {
  schoolSlug: string;
  familyChildren: Array<{ applicationId: string; studentName: string }>;
  amendmentsByApplicationId: Record<string, AmendmentBannerSource[]>;
  previewBasePath?: string;
}): EnrollmentAgreementAmendmentBannerItem[] {
  const items: EnrollmentAgreementAmendmentBannerItem[] = [];

  for (const child of input.familyChildren) {
    const amendments = input.amendmentsByApplicationId[child.applicationId] ?? [];
    for (const amendment of amendments) {
      const enrollmentBasePath = input.previewBasePath
        ? `${input.previewBasePath}/apply/${child.applicationId}/enrollment`
        : `/school/${input.schoolSlug}/apply/${child.applicationId}/enrollment`;

      items.push({
        applicationId: child.applicationId,
        studentName: child.studentName,
        checklistItemLabel: amendment.checklistItemLabel,
        amendmentNotice: amendment.amendmentNotice,
        enrollmentHref: buildEnrollmentAmendmentHref(enrollmentBasePath, amendment),
      });
    }
  }

  return items;
}

export function buildEnrollmentAgreementAmendmentBannerItemsFromApplications(input: {
  schoolSlug: string;
  applications: Array<{ id: string; studentName?: string | null }>;
  amendmentsByApplicationId: Record<string, AmendmentBannerSource[]>;
  previewBasePath?: string;
}): EnrollmentAgreementAmendmentBannerItem[] {
  const items: EnrollmentAgreementAmendmentBannerItem[] = [];

  for (const application of input.applications) {
    const amendments = input.amendmentsByApplicationId[application.id] ?? [];
    const studentName = application.studentName?.trim() || "Student";

    for (const amendment of amendments) {
      const enrollmentBasePath = input.previewBasePath
        ? `${input.previewBasePath}/apply/${application.id}/enrollment`
        : `/school/${input.schoolSlug}/apply/${application.id}/enrollment`;

      items.push({
        applicationId: application.id,
        studentName,
        checklistItemLabel: amendment.checklistItemLabel,
        amendmentNotice: amendment.amendmentNotice,
        enrollmentHref: buildEnrollmentAmendmentHref(enrollmentBasePath, amendment),
      });
    }
  }

  return items;
}
