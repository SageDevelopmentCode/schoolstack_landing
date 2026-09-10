import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  countUnreadParentActivityNotifications,
  fetchUnreadParentActivityNotificationCount,
  getPrimaryGuardianUserIdForFamily,
} from "@/lib/parent-portal/parent-activity-notifications";

import type { ParentNotificationContext } from "@/lib/parent-portal/parent-notification-context";

const getCachedParentUnreadCount = cache(
  async (
    organizationId: string,
    slug: string,
    familyId: string,
    userId: string | null,
    notificationContext?: ParentNotificationContext,
    aggregateAllContexts?: boolean,
  ): Promise<number> => {
    const { createAdminClient } = await import("@/utils/supabase/admin");
    const admin = createAdminClient();

    if (userId) {
      return fetchUnreadParentActivityNotificationCount(
        admin,
        userId,
        organizationId,
        slug,
        familyId,
        {
          notificationContext,
          aggregateAllContexts,
          parentNavBasePath: notificationContext?.parentNavBasePath,
          applyBasePath: notificationContext?.applyBasePath,
        },
      );
    }

    return countUnreadParentActivityNotifications(
      admin,
      organizationId,
      slug,
      familyId,
      null,
      {
        notificationContext,
        aggregateAllContexts,
        parentNavBasePath: notificationContext?.parentNavBasePath,
        applyBasePath: notificationContext?.applyBasePath,
      },
    );
  },
);

export async function getParentPortalActivityUnreadCount(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    slug: string;
    familyId: string;
    userId?: string | null;
    parentNavBasePath?: string;
    applyBasePath?: string;
    notificationContext?: ParentNotificationContext;
    aggregateAllContexts?: boolean;
  },
): Promise<number> {
  let userId = input.userId ?? null;
  if (!userId) {
    userId = await getPrimaryGuardianUserIdForFamily(
      supabase,
      input.familyId,
      input.organizationId,
    );
  }

  const notificationContext =
    input.notificationContext ??
    (input.parentNavBasePath || input.applyBasePath
      ? {
          mode: "main" as const,
          slug: input.slug,
          parentNavBasePath:
            input.parentNavBasePath ?? `/school/${input.slug}/parent`,
          applyBasePath:
            input.applyBasePath ?? `/school/${input.slug}/apply`,
        }
      : undefined);

  return getCachedParentUnreadCount(
    input.organizationId,
    input.slug,
    input.familyId,
    userId,
    notificationContext,
    input.aggregateAllContexts,
  );
}
