import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getParentMessagesUnreadCount } from "@/lib/messages/unread-count-api";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/messages/unread-count";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    // The badge answers 0 for a user without enrolled access instead of failing.
    enforceAccess: false,
    fallbackErrorMessage: "Failed to load unread count.",
  },
  async ({ request, supabase, user, organizationId }) => {
    const schoolName = new URL(request.url).searchParams.get("schoolName")?.trim() ?? "School";

    try {
      const admin = createAdminClient();
      const unreadCount = await getParentMessagesUnreadCount(
        admin,
        supabase,
        organizationId,
        user.id,
        schoolName,
      );
      return NextResponse.json({ unreadCount });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load unread count.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
