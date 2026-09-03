import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  findOrCreateThread,
  getStaffMemberIdForUser,
  requireSchoolAdminUser,
  resolveParticipantsForContact,
} from "@/lib/messages/api-helpers";
import { loadAdminMessagesInbox } from "@/lib/messages/admin-messages";
import { SchoolAdminAuthError } from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/messages/threads";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
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

  try {
    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const inbox = await loadAdminMessagesInbox(
      admin,
      organizationId,
      user.id,
      schoolName,
      supabase,
      { includeContacts: false },
    );

    return NextResponse.json(inbox);
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

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
  const supabase = await createClientFromRequest(request);

  try {
    const body = (await request.json()) as {
      organizationId?: string;
      familyId?: string;
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

    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );

    const admin = createAdminClient();
    const participants = await resolveParticipantsForContact(
      admin,
      organizationId,
      body.contact,
      {
        staffMemberId,
        viewer: "admin",
      },
    );
    const threadId = await findOrCreateThread(admin, organizationId, participants);

    return NextResponse.json({ threadId });
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to create thread.",
      code: "internal_error",
      cause: err,
    });
  }
}
