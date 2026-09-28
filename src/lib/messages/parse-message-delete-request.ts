export type MessageDeleteRequestQuery = {
  organizationId: string;
  schoolName: string;
};

export function parseMessageDeleteRequest(
  request: Request,
): MessageDeleteRequestQuery {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const schoolName =
    searchParams.get("schoolName")?.trim() || "School";
  return { organizationId, schoolName };
}
