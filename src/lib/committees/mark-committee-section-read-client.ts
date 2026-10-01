import type { CommitteeWorkspaceSection } from "@/lib/committees/types";

export async function markCommitteeSectionReadViaApi(
  apiBase: string,
  committeeId: string,
  input: { organizationId: string; section: CommitteeWorkspaceSection },
): Promise<void> {
  const response = await fetch(`${apiBase}/${committeeId}/mark-read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error || "Failed to mark section read.");
  }
}
