import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { assertParentCanAccessThread } from "@/lib/messages/api-helpers";
import { deleteMessageForViewer, editMessageForViewer } from "@/lib/messages/api-helpers-server";
import { parseMessageDeleteRequest } from "@/lib/messages/parse-message-delete-request";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/messages/threads/[threadId]/messages/[messageId]";

type MessageParams = { threadId: string; messageId: string };

export const PATCH = withParentPortalRoute<{ body?: unknown; schoolName?: unknown }, MessageParams>(
  {
    route: ROUTE,
    organizationFrom: "body",
    feature: "messages",
    forbiddenMessage: "You do not have access to messages.",
    missingOrganizationMessage: "organizationId and message body are required.",
    invalidBodyMessage: "organizationId and message body are required.",
    fallbackErrorMessage: "Failed to edit message.",
  },
  async ({ request, user, access, organizationId, body, params }) => {
    try {
      const messageBody = typeof body.body === "string" ? body.body : "";
      const schoolName =
        typeof body.schoolName === "string" && body.schoolName.trim()
          ? body.schoolName.trim()
          : "School";

      if (!messageBody.trim()) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "organizationId and message body are required.",
          code: "missing_fields",
        });
      }

      const admin = createAdminClient();
      await assertParentCanAccessThread(admin, access, organizationId, params.threadId);

      const message = await editMessageForViewer(admin, {
        organizationId,
        threadId: params.threadId,
        messageId: params.messageId,
        body: messageBody,
        userId: user.id,
        viewer: "parent",
        schoolOfficeLabel: `${schoolName} Office`,
      });

      return NextResponse.json({ message });
    } catch (err) {
      const resolved = portalRouteErrorStatus(err, "Failed to edit message.");
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

export const DELETE = withParentPortalRoute<undefined, MessageParams>(
  {
    route: ROUTE,
    feature: "messages",
    forbiddenMessage: "You do not have access to messages.",
    fallbackErrorMessage: "Failed to delete message.",
  },
  async ({ request, user, access, organizationId, params }) => {
    try {
      const { schoolName } = parseMessageDeleteRequest(request);

      const admin = createAdminClient();
      await assertParentCanAccessThread(admin, access, organizationId, params.threadId);

      const message = await deleteMessageForViewer(admin, {
        organizationId,
        threadId: params.threadId,
        messageId: params.messageId,
        userId: user.id,
        viewer: "parent",
        schoolOfficeLabel: `${schoolName} Office`,
      });

      return NextResponse.json({ message });
    } catch (err) {
      const resolved = portalRouteErrorStatus(err, "Failed to delete message.");
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
