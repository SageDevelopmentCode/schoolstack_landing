import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { markParentActivityNotificationsRead } from "@/lib/parent-portal/parent-activity-notifications";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/activity-notifications/mark-read";

export const POST = withParentPortalRoute(
  {
    route: ROUTE,
    organizationFrom: "body",
    invalidBodyMessage: "Invalid JSON body.",
    fallbackErrorMessage: "Failed to mark activity notifications as read.",
  },
  async ({ request, user, organizationId }) => {
    try {
      const admin = createAdminClient();
      const lastReadAt = await markParentActivityNotificationsRead(admin, user.id, organizationId);

      return NextResponse.json({ unreadCount: 0, lastReadAt });
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to mark activity notifications as read.",
        code: "internal_error",
        cause: error,
      });
    }
  },
);
