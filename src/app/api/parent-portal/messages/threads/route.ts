import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getGuardianIdForUser } from "@/lib/messages/messages";
import { loadParentMessagesInbox } from "@/lib/messages/parent-messages";
import { resolveThreadProgramIdForContact } from "@/lib/messages/message-audience";
import {
  findOrCreateThread,
  getFamilyIdsForUser,
  resolveParticipantsForContact,
} from "@/lib/messages/api-helpers";
import { userHasAccessForOptionalProgramScope } from "@/lib/admissions/program-parent-portal-access";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/messages/threads";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const schoolName = searchParams.get("schoolName")?.trim() ?? "School";
  const programId = searchParams.get("programId")?.trim() || null;

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
      code: "unauthorized",
    });
  }

  try {
    const hasAccess = await userHasAccessForOptionalProgramScope(
      supabase,
      user.id,
      organizationId,
      programId,
    );
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to messages.",
        code: "forbidden",
      });
    }

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
}

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
      code: "unauthorized",
    });
  }

  try {
    const body = (await request.json()) as {
      organizationId?: string;
      programId?: string | null;
      contact?: {
        key: string;
        kind: "guardian" | "staff_member" | "school_office";
        guardianId?: string;
        familyId?: string;
        staffMemberId?: string;
        name: string;
      };
    };

    const organizationId = body.organizationId?.trim() ?? "";
    if (!organizationId || !body.contact) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and contact are required.",
        code: "missing_fields",
      });
    }

    const hasAccess = await userHasAccessForOptionalProgramScope(
      supabase,
      user.id,
      organizationId,
      body.programId,
    );
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to messages.",
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

    const participants = await resolveParticipantsForContact(
      admin,
      organizationId,
      body.contact,
      { guardianId, familyId, viewer: "parent", programId: body.programId },
    );
    const programId = resolveThreadProgramIdForContact({
      contactKind: body.contact.kind,
      portalProgramId: body.programId,
    });
    const threadId = await findOrCreateThread(admin, organizationId, participants, {
      programId,
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
}
