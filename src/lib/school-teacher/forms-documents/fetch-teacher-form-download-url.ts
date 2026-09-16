export async function fetchTeacherFormDownloadUrl(
  formId: string,
  organizationId: string,
): Promise<string> {
  const response = await fetch(
    `/api/teacher-portal/forms-documents/${formId}/download?organizationId=${encodeURIComponent(organizationId)}`,
  );
  const payload = (await response.json()) as {
    signedUrl?: string;
    error?: string;
  };
  if (!response.ok || !payload.signedUrl) {
    throw new Error(payload.error ?? "Failed to load document.");
  }
  return payload.signedUrl;
}
