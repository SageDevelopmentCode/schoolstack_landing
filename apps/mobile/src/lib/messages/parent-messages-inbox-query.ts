export function buildParentMessagesInboxQuery(
  organizationId: string,
  schoolName: string,
  programId?: string,
): string {
  const params = new URLSearchParams({
    organizationId,
    schoolName,
  });
  if (programId) {
    params.set('programId', programId);
  }
  return params.toString();
}
