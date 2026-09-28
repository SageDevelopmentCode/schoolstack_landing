export type MessagePatchRequestBody = {
  organizationId: string;
  body: string;
  schoolName: string;
};

export async function parseMessagePatchRequest(
  request: Request,
): Promise<MessagePatchRequestBody> {
  const data = (await request.json()) as Partial<MessagePatchRequestBody>;
  const schoolName =
    typeof data.schoolName === "string" && data.schoolName.trim()
      ? data.schoolName.trim()
      : "School";
  return {
    organizationId: typeof data.organizationId === "string" ? data.organizationId.trim() : "",
    body: typeof data.body === "string" ? data.body : "",
    schoolName,
  };
}
