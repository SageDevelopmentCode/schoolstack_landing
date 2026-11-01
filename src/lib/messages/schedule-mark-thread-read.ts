import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivitySurface, ActorType } from "@/lib/activity-log";
import { runAfterResponse } from "@/lib/next/run-after-response";
import { reportOperationalError } from "@/lib/operational-errors";
import { markThreadRead } from "@/lib/messages/threads";

export function scheduleMarkThreadReadAfterResponse(input: {
  admin: SupabaseClient;
  threadId: string;
  userId: string;
  organizationId: string;
  organizationName?: string;
  organizationSlug?: string;
  surface: ActivitySurface;
  operation: string;
  actor: { type: ActorType; userId: string; email?: string | null };
}): void {
  const {
    admin,
    threadId,
    userId,
    organizationId,
    organizationName,
    organizationSlug,
    surface,
    operation,
    actor,
  } = input;

  runAfterResponse(async () => {
    try {
      await markThreadRead(admin, threadId, userId);
    } catch (readErr) {
      await reportOperationalError({
        supabase: admin,
        surface,
        organizationId,
        organizationName,
        organizationSlug,
        operation,
        error: "Failed to mark thread read.",
        cause: readErr,
        entityType: "message_thread",
        entityId: threadId,
        notify: true,
        actor,
      });
    }
  });
}
