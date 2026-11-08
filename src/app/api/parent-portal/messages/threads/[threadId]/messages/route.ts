import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { assertParentCanAccessThread } from "@/lib/messages/api-helpers";
import { sendMessageForViewer } from "@/lib/messages/api-helpers-server";
import { parseMessagePostParts } from "@/lib/messages/parse-message-post-request";
import { MAX_MESSAGE_ATTACHMENTS } from "@/lib/messages/message-attachment-storage";
import { activityClientMetadataFromRequest } from "@/lib/activity-client";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/messages/threads/[threadId]/messages";

export const POST = withParentPortalRoute<unknown, { threadId: string }>(
  {
    route: ROUTE,
    organizationFrom: "body",
    feature: "messages",
    forbiddenMessage: "You do not have access to messages.",
    missingOrganizationMessage: "organizationId and message content are required.",
    invalidBodyMessage: "organizationId and message content are required.",
    fallbackErrorMessage: "Failed to send message.",
  },
  async ({ request, user, access, organizationId, formData, body, params }) => {
    try {
      const {
        organizationSlug,
        schoolName,
        body: messageBody,
        files,
      } = parseMessagePostParts(formData, body);

      if (!messageBody && files.length === 0) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "organizationId and message content are required.",
          code: "missing_fields",
        });
      }

      if (files.length > MAX_MESSAGE_ATTACHMENTS) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: `You can attach up to ${MAX_MESSAGE_ATTACHMENTS} files.`,
          code: "too_many_files",
        });
      }

      const admin = createAdminClient();
      const familyId = await assertParentCanAccessThread(
        admin,
        access,
        organizationId,
        params.threadId,
      );

      const message = await sendMessageForViewer(admin, {
        organizationId,
        organizationSlug: organizationSlug || organizationId,
        threadId: params.threadId,
        body: messageBody,
        files,
        userId: user.id,
        viewer: "parent",
        familyId,
        schoolName,
        schoolOfficeLabel: `${schoolName} Office`,
        activityMetadata: activityClientMetadataFromRequest(request),
      });

      return NextResponse.json({ message });
    } catch (err) {
      const resolved = portalRouteErrorStatus(err, "Failed to send message.");
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
