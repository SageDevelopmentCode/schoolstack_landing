export async function fetchParentFormDownloadUrl(
  formId: string,
  organizationId: string,
): Promise<string> {
  const response = await fetch(
    `/api/parent-portal/forms-documents/${encodeURIComponent(formId)}/download?organizationId=${encodeURIComponent(organizationId)}`,
  );
  const payload = (await response.json()) as {
    signedUrl?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load document.");
  }

  if (!payload.signedUrl) {
    throw new Error("Failed to load document.");
  }

  return payload.signedUrl;
}
