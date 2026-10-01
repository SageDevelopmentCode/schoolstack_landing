import type { CommitteeMessage } from "@/lib/committees/types";

export async function postCommitteeMessageViaApi(
  apiBase: string,
  committeeId: string,
  input: {
    organizationId: string;
    body: string;
    files?: File[];
  },
): Promise<CommitteeMessage> {
  const formData = new FormData();
  formData.set("organizationId", input.organizationId);
  formData.set("body", input.body);
  for (const file of input.files ?? []) {
    formData.append("files", file);
  }

  const response = await fetch(`${apiBase}/${committeeId}/messages`, {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: CommitteeMessage;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || "Failed to send message.");
  }

  if (!payload.message) {
    throw new Error("Failed to send message.");
  }

  return payload.message;
}
