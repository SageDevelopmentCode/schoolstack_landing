import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getGuardianIdForUser } from "@/lib/messages/messages";
import { loadParentMessagesInbox } from "@/lib/messages/parent-messages";
import {
  findOrCreateThread,
  getFamilyIdsForUser,
  resolveParticipantsForContact,
  userHasEnrolledAccess,
} from "@/lib/messages/api-helpers";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/parent-portal/messages/threads";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const schoolName = searchParams.get("schoolName")?.trim() ?? "School";

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
    );

    return NextResponse.json(inbox);
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to load messages.",
      code: "internal_error",
      cause: err,
    });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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

    const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
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
      { guardianId, viewer: "parent" },
    );
    const threadId = await findOrCreateThread(admin, organizationId, participants);

    return NextResponse.json({ threadId });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to create thread.",
      code: "internal_error",
      cause: err,
    });
  }
}
