import type { FridayBranchBlock } from "./friday-branch-types";

export async function putFridayBranchSchedule(
  organizationId: string,
  blocks: FridayBranchBlock[],
): Promise<FridayBranchBlock[]> {
  const response = await fetch("/api/school-admin/friday-branch/schedule", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId, blocks }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to save Friday Branch schedule.");
  }

  const payload = (await response.json()) as { blocks: FridayBranchBlock[] };
  return payload.blocks ?? [];
}
