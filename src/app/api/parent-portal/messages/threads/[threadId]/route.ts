import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { assertParentCanAccessThread, getThreadDetail } from "@/lib/messages/api-helpers";
import { scheduleMarkThreadReadAfterResponse } from "@/lib/messages/schedule-mark-thread-read";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/messages/threads/[threadId]";

export const GET = withParentPortalRoute<undefined, { threadId: string }>(
  {
    route: ROUTE,
    feature: "messages",
    forbiddenMessage: "You do not have access to messages.",
    fallbackErrorMessage: "Failed to load thread.",
  },
  async ({ request, user, organizationId, access, params }) => {
    const { threadId } = params;
    const { searchParams } = new URL(request.url);
    const organizationSlug = searchParams.get("organizationSlug")?.trim() ?? "";
    const schoolName = searchParams.get("schoolName")?.trim() ?? "School";

    try {
      const admin = createAdminClient();
      await assertParentCanAccessThread(admin, access, organizationId, threadId);

      const readCutoffAt = new Date().toISOString();
      const thread = await getThreadDetail(
        admin,
        organizationId,
        threadId,
        user.id,
        `${schoolName} Office`,
        "parent",
      );

      if (!thread) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Thread not found.",
          code: "not_found",
        });
      }

      scheduleMarkThreadReadAfterResponse({
        admin,
        threadId,
        userId: user.id,
        lastReadAt: readCutoffAt,
        organizationId,
        organizationName: schoolName,
        organizationSlug: organizationSlug || undefined,
        surface: "parent_portal",
        operation: "parent_portal_messages_mark_thread_read",
        actor: { type: "parent", userId: user.id, email: user.email },
      });
      return NextResponse.json({ thread });
    } catch (err) {
      const resolved = portalRouteErrorStatus(err, "Failed to load thread.");
      return apiError(ROUTE, {
        request,
        status: resolved.status,
        error: resolved.message,
        code: resolved.code,
        cause: err,
      });
    }
  },
);
