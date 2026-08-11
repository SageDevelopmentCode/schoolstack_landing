export type ParsedMessagePostRequest = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  body: string;
  files: File[];
};

export async function parseMessagePostRequest(
  request: Request,
): Promise<ParsedMessagePostRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const organizationId = String(formData.get("organizationId") ?? "").trim();
    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const schoolName = String(formData.get("schoolName") ?? "School").trim();
    const body = String(formData.get("body") ?? "").trim();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    return { organizationId, organizationSlug, schoolName, body, files };
  }

  const json = (await request.json()) as {
    organizationId?: string;
    organizationSlug?: string;
    schoolName?: string;
    body?: string;
  };

  return {
    organizationId: json.organizationId?.trim() ?? "",
    organizationSlug: json.organizationSlug?.trim() ?? "",
    schoolName: json.schoolName?.trim() ?? "School",
    body: json.body?.trim() ?? "",
    files: [],
  };
}
