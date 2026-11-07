import type { SupabaseClient } from "@supabase/supabase-js";
import { getCommitteeUnreadSummaryForUser } from "@/lib/committees/committee-unread";
import type { CommitteeUnreadSummary } from "@/lib/committees/committee-unread-types";
import { getParentMessagesUnreadCount } from "@/lib/messages/unread-count-api";
import type { ParentNotificationContext } from "@/lib/parent-portal/parent-notification-context";
import { getParentPortalActivityUnreadCount } from "@/lib/parent-portal/parent-activity-notifications-server";
import { getParentPortalAccess } from "@/lib/parent-portal/parent-portal-server-cache";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Header badge counts started by the live parent layout WITHOUT awaiting them. Each promise
 * resolves to the count, or `null` when the server load failed so the client falls back to its own
 * fetch. Promises never reject.
 */
export type ParentBadgeCountPromises = {
  activity: Promise<number | null>;
  messages: Promise<number | null>;
  committees: Promise<CommitteeUnreadSummary | null>;
};

type StartInput = {
  supabase: SupabaseClient;
  organizationId: string;
  organizationName: string;
  slug: string;
  userId: string;
  notificationContext: ParentNotificationContext;
  messagesEnabled: boolean;
  committeesEnabled: boolean;
};

/** Kick off the three badge loads in parallel; the layout renders without waiting for them. */
export function startParentBadgeCountLoads(
  input: StartInput,
): ParentBadgeCountPromises {
  const activity = (async () => {
    const access = await getParentPortalAccess(input.organizationId);
    const familyId = access?.familyIds[0];
    if (!familyId) return 0;
    return getParentPortalActivityUnreadCount(input.supabase, {
      organizationId: input.organizationId,
      slug: input.slug,
      familyId,
      userId: input.userId,
      notificationContext: input.notificationContext,
    });
  })().catch(() => null);

  const messages: Promise<number | null> = input.messagesEnabled
    ? (async () =>
        getParentMessagesUnreadCount(
          createAdminClient(),
          input.supabase,
          input.organizationId,
          input.userId,
          input.organizationName,
        ))().catch(() => null)
    : Promise.resolve(0);

  const committees: Promise<CommitteeUnreadSummary | null> =
    input.committeesEnabled
      ? (async () =>
          getCommitteeUnreadSummaryForUser(
            createAdminClient(),
            input.organizationId,
            input.userId,
          ))().catch(() => null)
      : Promise.resolve({ totalUnread: 0, byCommittee: [] });

  return { activity, messages, committees };
}
