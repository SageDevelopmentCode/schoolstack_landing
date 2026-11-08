export type ParsedMessagePostRequest = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  body: string;
  files: File[];
};

/**
 * Builds the parsed payload from an already-read multipart form or JSON body (used by routes that
 * went through `withParentPortalRoute`, which reads the body once).
 */
export function parseMessagePostParts(
  formData: FormData | null,
  json: unknown,
): ParsedMessagePostRequest {
  if (formData) {
    const organizationId = String(formData.get("organizationId") ?? "").trim();
    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const schoolName = String(formData.get("schoolName") ?? "School").trim();
    const body = String(formData.get("body") ?? "").trim();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    return { organizationId, organizationSlug, schoolName, body, files };
  }

  const data = (json ?? {}) as {
    organizationId?: string;
    organizationSlug?: string;
    schoolName?: string;
    body?: string;
  };

  return {
    organizationId: data.organizationId?.trim() ?? "",
    organizationSlug: data.organizationSlug?.trim() ?? "",
    schoolName: data.schoolName?.trim() ?? "School",
    body: data.body?.trim() ?? "",
    files: [],
  };
}

export async function parseMessagePostRequest(
  request: Request,
): Promise<ParsedMessagePostRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return parseMessagePostParts(await request.formData(), null);
  }

  return parseMessagePostParts(null, await request.json());
}
