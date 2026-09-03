import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminMessagesUnreadCount } from "@/lib/messages/unread-count-api";
import { fetchUnreadActivityNotificationCount } from "@/lib/school-admin/activity-notifications";

export const getCachedAdminMessagesUnreadCount = cache(
  async (
    admin: SupabaseClient,
    organizationId: string,
    userId: string,
    schoolName: string,
  ) => getAdminMessagesUnreadCount(admin, organizationId, userId, schoolName),
);

export const getCachedActivityNotificationUnreadCount = cache(
  async (admin: SupabaseClient, userId: string, organizationId: string) =>
    fetchUnreadActivityNotificationCount(admin, userId, organizationId),
);
