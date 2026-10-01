import type { LogCommitteeActivityInput } from "@/lib/committees/committee-activity-log";
import { recordCommitteeActivityViaApi } from "@/lib/committees/committee-activity-api-client";

export function logCommitteeActivityForPortal(
  apiBase: string,
  input: LogCommitteeActivityInput & { organizationId: string },
): void {
  if (!input.entityId) return;

  void recordCommitteeActivityViaApi(apiBase, input.committeeId, {
    organizationId: input.organizationId,
    action: input.action,
    entityId: input.entityId,
  }).catch(() => {
    // Activity logging is best-effort and must not block committee actions.
  });
}
