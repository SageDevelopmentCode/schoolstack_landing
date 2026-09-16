export async function fetchAdminFormDownloadUrl(
  formId: string,
  organizationId: string,
): Promise<string> {
  const response = await fetch(
    `/api/school-admin/forms-documents/${formId}/download?organizationId=${encodeURIComponent(organizationId)}`,
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
