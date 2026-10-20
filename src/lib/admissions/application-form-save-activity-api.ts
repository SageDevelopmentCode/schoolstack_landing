export type RecordApplicationFormSaveActivityPayload = {
  organizationId: string;
  formVersionId: string;
  summary: string;
  metadata: Record<string, unknown>;
};

export async function recordApplicationFormSaveActivityViaApi(
  payload: RecordApplicationFormSaveActivityPayload,
): Promise<string | null> {
  const response = await fetch(
    "/api/school-admin/application-forms/record-save-activity",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(
      body?.error ?? "Failed to record application form save activity.",
    );
  }

  const body = (await response.json()) as { activityEventId?: string | null };
  return body.activityEventId ? String(body.activityEventId) : null;
}
