import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { handlePostCommitteeMessage } from "@/lib/committees/api/committee-message-route";
import {
  resolveActiveCommitteeMemberForPost,
  resolveParentGuardianForOrg,
} from "@/lib/committees/parent-committees";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/[committeeId]/messages";

export const POST = withParentPortalRoute<undefined, { committeeId: string }>(
  {
    route: ROUTE,
    feature: "committees",
    forbiddenMessage: "You do not have access to this committee.",
    // The handler reads the (possibly multipart) body itself, so look the school up on a clone.
    resolveOrganizationId: async (request) => {
      const fromRequest =
        request.headers.get("x-organization-id")?.trim() ||
        new URL(request.url).searchParams.get("organizationId")?.trim() ||
        "";
      if (fromRequest) return fromRequest;
      if (request.headers.get("content-type")?.includes("multipart/form-data")) {
        const formData = await request.formData();
        return String(formData.get("organizationId") ?? "").trim();
      }
      return "";
    },
    fallbackErrorMessage: "Failed to send message.",
  },
  async ({ request, user, organizationId, params }) => {
    try {
      const admin = createAdminClient();
      const guardian = await resolveParentGuardianForOrg(
        admin,
        user.id,
        organizationId,
        user.email ?? "",
      );

      const currentMember = await resolveActiveCommitteeMemberForPost(
        admin,
        organizationId,
        user.id,
        params.committeeId,
      );

      return await handlePostCommitteeMessage(request, ROUTE, {
        committeeId: params.committeeId,
        organizationId,
        actorUserId: user.id,
        actorEmail: guardian.email || user.email,
        actorName: guardian.displayName,
        actorMemberId: currentMember.id,
        senderMemberId: currentMember.id,
        senderName: currentMember.name,
        actorType: "parent",
        surface: "parent_portal",
      });
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
