import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { isBenignEnrollmentChecklistErrorCode } from "@/lib/admissions/enrollment-checklist-errors";
import { reportOperationalError } from "@/lib/operational-errors";

export async function reportEnrollmentChecklistItemApiFailure(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    applicationId?: string | null;
    instanceId: string;
    operation: string;
    error: string;
    code?: string;
    actorUserId?: string;
    actorEmail?: string | null;
    cause?: unknown;
  },
): Promise<void> {
  if (isBenignEnrollmentChecklistErrorCode(input.code)) {
    return;
  }

  await reportOperationalError({
    supabase,
    surface: "parent_portal",
    action: ACTIVITY_ACTIONS.ENROLLMENT_CHECKLIST_ITEM_FAILED,
    organizationId: input.organizationId,
    operation: input.operation,
    error: input.error,
    code: input.code,
    entityType: "enrollment_checklist_item",
    entityId: input.instanceId,
    metadata: {
      applicationId: input.applicationId ?? null,
    },
    notify: true,
    actor: {
      type: "parent",
      userId: input.actorUserId,
      email: input.actorEmail,
    },
    cause: input.cause,
  });
}
