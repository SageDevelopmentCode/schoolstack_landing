export function buildAgreementEnrollmentHref(
  enrollmentBasePath: string,
  templateItemId: string,
  resumeSectionId?: string,
): string {
  const params = new URLSearchParams();
  params.set("item", templateItemId);
  if (resumeSectionId) {
    params.set("section", resumeSectionId);
  }
  return `${enrollmentBasePath}?${params.toString()}`;
}
