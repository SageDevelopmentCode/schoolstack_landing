"use client";

import type { ActivityAction } from "@/lib/activity-log";

export async function recordCommitteeActivityViaApi(
  apiBase: string,
  committeeId: string,
  input: {
    organizationId: string;
    action: ActivityAction | string;
    entityType: string;
    entityId: string;
    summary: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const response = await fetch(`${apiBase}/${committeeId}/record-activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error || "Failed to record committee activity.");
  }
}
