import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { markThreadRead, assertParentCanAccessThread } from "@/lib/messages/api-helpers";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/messages/threads/[threadId]/read";

export const POST = withParentPortalRoute<unknown, { threadId: string }>(
  {
    route: ROUTE,
    organizationFrom: "body",
    forbiddenMessage: "You do not have access to messages.",
    fallbackErrorMessage: "Failed to mark thread read.",
  },
  async ({ request, user, organizationId, access, params }) => {
    try {
      const admin = createAdminClient();
      await assertParentCanAccessThread(admin, access, organizationId, params.threadId);
      await markThreadRead(admin, params.threadId, user.id);

      return NextResponse.json({ ok: true });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to mark thread read.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
