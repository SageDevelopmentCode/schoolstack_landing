import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getGuardianIdForUser } from "@/lib/messages/messages";
import { loadParentMessagesInbox } from "@/lib/messages/parent-messages";
import { resolveThreadProgramIdForContact } from "@/lib/messages/message-audience";
import { findOrCreateThread, resolveParticipantsForContact } from "@/lib/messages/api-helpers";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/messages/threads";

type CreateThreadBody = {
  organizationId?: string;
  programId?: string | null;
  contact: {
    key: string;
    kind: "guardian" | "staff_member" | "school_office" | "platform_support";
    guardianId?: string;
    familyId?: string;
    staffMemberId?: string;
    name: string;
  };
};

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    programScope: "optional",
    feature: "messages",
    forbiddenMessage: "You do not have access to messages.",
    fallbackErrorMessage: "Failed to load messages.",
  },
  async ({ request, supabase, user, organizationId, programId }) => {
    const schoolName = new URL(request.url).searchParams.get("schoolName")?.trim() ?? "School";

    try {
      const admin = createAdminClient();
      const inbox = await loadParentMessagesInbox(
        admin,
        supabase,
        organizationId,
        user.id,
        schoolName,
        { programId },
      );

      return NextResponse.json(inbox);
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load messages.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);

export const POST = withParentPortalRoute<CreateThreadBody>(
  {
    route: ROUTE,
    organizationFrom: "body",
    programScope: "optional",
    feature: "messages",
    forbiddenMessage: "You do not have access to messages.",
    missingOrganizationMessage: "organizationId and contact are required.",
    invalidBodyMessage: "organizationId and contact are required.",
    fallbackErrorMessage: "Failed to create thread.",
    parseBody: (raw) => {
      const body = raw as Partial<CreateThreadBody> | null;
      return body?.contact ? (body as CreateThreadBody) : null;
    },
  },
  async ({ request, user, organizationId, programId, familyId, body }) => {
    try {
      if (!familyId) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "No family found for this account.",
          code: "missing_family",
        });
      }

      const admin = createAdminClient();
      const guardianId = await getGuardianIdForUser(admin, user.id, organizationId, familyId);
      if (!guardianId) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "No guardian profile found for this account.",
          code: "missing_guardian",
        });
      }

      const participants = await resolveParticipantsForContact(
        admin,
        organizationId,
        body.contact,
        { guardianId, familyId, viewer: "parent", programId },
      );
      const threadProgramId = resolveThreadProgramIdForContact({
        contactKind: body.contact.kind,
        portalProgramId: programId,
      });
      const threadId = await findOrCreateThread(admin, organizationId, participants, {
        programId: threadProgramId,
      });

      return NextResponse.json({ threadId });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to create thread.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
