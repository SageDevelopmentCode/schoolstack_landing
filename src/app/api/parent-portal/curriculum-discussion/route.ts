import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  listProgramCoopCurriculumDiscussionMessages,
  postProgramCoopCurriculumDiscussionMessage,
  validateProgramCoopCurriculumDiscussionBody,
} from "@/lib/admissions/program-coop-curriculum-discussion";
import { getGuardianIdForUser } from "@/lib/messages/messages";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/curriculum-discussion";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    programScope: "required",
    forbiddenMessage: "You do not have access to curriculum discussion.",
    fallbackErrorMessage: "Failed to load discussion.",
  },
  async ({ request, organizationId, programId }) => {
    const curriculumId = new URL(request.url).searchParams.get("curriculumId");

    try {
      const admin = createAdminClient();
      const messages = await listProgramCoopCurriculumDiscussionMessages(admin, {
        organizationId,
        programId: programId!,
        curriculumId,
      });

      return NextResponse.json({ messages });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load discussion.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);

type PostBody = {
  curriculumId?: string | null;
  body?: string;
  pageNumber?: number | null;
};

export const POST = withParentPortalRoute<PostBody>(
  {
    route: ROUTE,
    organizationFrom: "body",
    programScope: "required",
    forbiddenMessage: "You do not have access to curriculum discussion.",
    fallbackErrorMessage: "Failed to post message.",
  },
  async ({ request, user, organizationId, programId, familyId, body }) => {
    try {
      const messageBody = body.body ?? "";

      const validationError = validateProgramCoopCurriculumDiscussionBody(messageBody);
      if (validationError) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: validationError,
          code: "invalid_body",
        });
      }

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

      const message = await postProgramCoopCurriculumDiscussionMessage(admin, {
        organizationId,
        programId: programId!,
        senderGuardianId: guardianId,
        body: messageBody,
        curriculumId: body.curriculumId,
        pageNumber: body.pageNumber,
      });

      return NextResponse.json({ message });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to post message.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
