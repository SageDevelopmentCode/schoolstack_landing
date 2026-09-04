import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  listProgramCoopCurriculumDiscussionMessages,
  postProgramCoopCurriculumDiscussionMessage,
  validateProgramCoopCurriculumDiscussionBody,
} from "@/lib/admissions/program-coop-curriculum-discussion";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { getGuardianIdForUser } from "@/lib/messages/messages";
import { getFamilyIdsForUser } from "@/lib/messages/api-helpers";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/curriculum-discussion";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const programId = searchParams.get("programId")?.trim() ?? "";

  if (!organizationId || !programId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and programId are required.",
      code: "missing_fields",
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  try {
    const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to curriculum discussion.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const messages = await listProgramCoopCurriculumDiscussionMessages(admin, {
      organizationId,
      programId,
    });

    return NextResponse.json({ messages });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to load discussion.",
      code: "internal_error",
      cause: err,
    });
  }
}

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  try {
    const body = (await request.json()) as {
      organizationId?: string;
      programId?: string;
      body?: string;
      pageNumber?: number | null;
    };

    const organizationId = body.organizationId?.trim() ?? "";
    const programId = body.programId?.trim() ?? "";
    const messageBody = body.body ?? "";

    if (!organizationId || !programId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and programId are required.",
        code: "missing_fields",
      });
    }

    const validationError = validateProgramCoopCurriculumDiscussionBody(messageBody);
    if (validationError) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: validationError,
        code: "invalid_body",
      });
    }

    const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to curriculum discussion.",
        code: "forbidden",
      });
    }

    const familyIds = await getFamilyIdsForUser(supabase, user.id, organizationId);
    const familyId = familyIds[0];
    if (!familyId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "No family found for this account.",
        code: "missing_family",
      });
    }

    const admin = createAdminClient();
    const guardianId = await getGuardianIdForUser(
      admin,
      user.id,
      organizationId,
      familyId,
    );
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
      programId,
      senderGuardianId: guardianId,
      body: messageBody,
      pageNumber: body.pageNumber,
    });

    return NextResponse.json({ message });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to post message.",
      code: "internal_error",
      cause: err,
    });
  }
}
