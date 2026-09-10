import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import type { BulletinAudience, BulletinPostStatus } from "./types";

export function shouldLogBulletinPostPublished(
  previousStatus: BulletinPostStatus | undefined,
  nextStatus: BulletinPostStatus,
): boolean {
  return nextStatus === "published" && previousStatus !== "published";
}

type LogBulletinPostPublishedInput = {
  organizationId: string;
  postId: string;
  title: string;
  audiences: BulletinAudience[];
  programIds: string[];
  actorUserId?: string | null;
  actorName?: string | null;
};

export async function logBulletinPostPublished(
  supabase: SupabaseClient,
  input: LogBulletinPostPublishedInput,
): Promise<void> {
  const title = input.title.trim();

  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: input.actorUserId ? "school_admin" : "system",
    actorUserId: input.actorUserId ?? null,
    actorName: input.actorName ?? null,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.BULLETIN_POST_PUBLISHED,
    entityType: "school_bulletin_post",
    entityId: input.postId,
    summary: `Published bulletin "${title}"`,
    metadata: {
      postId: input.postId,
      title,
      programIds: input.programIds,
      audiences: input.audiences,
    },
  });
}
