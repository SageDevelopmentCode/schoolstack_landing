export const PARENT_FAMILY_PREVIEW_MESSAGES_BASE =
  "/api/admin/mobile-preview/parent/messages";

export type ParentFamilyPreviewMessagesQueryInput = {
  organizationId: string;
  slug: string;
  familyId: string;
  schoolName: string;
  programId?: string | null;
};

export function buildParentFamilyPreviewMessagesQuery(
  input: ParentFamilyPreviewMessagesQueryInput,
): string {
  const params = new URLSearchParams({
    organizationId: input.organizationId,
    slug: input.slug,
    familyId: input.familyId,
    schoolName: input.schoolName,
  });
  const programId = input.programId?.trim();
  if (programId) {
    params.set("programId", programId);
  }
  return params.toString();
}
