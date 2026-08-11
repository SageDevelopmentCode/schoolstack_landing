import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  findOrCreateThread,
  getStaffMemberIdForUser,
  requireTeacherPortalUser,
  resolveParticipantsForContact,
} from "@/lib/messages/api-helpers";
import { loadTeacherMessagesInbox } from "@/lib/messages/teacher-messages";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/messages/threads";

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

  try {
    const user = await requireTeacherPortalUser(supabase, organizationId);
    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );

    if (!staffMemberId) {
      return NextResponse.json({ threads: [], contacts: [] });
    }

    const admin = createAdminClient();
    const inbox = await loadTeacherMessagesInbox(
      admin,
      organizationId,
      user.id,
      staffMemberId,
      schoolName,
    );

    return NextResponse.json(inbox);
  } catch (err) {
    if (err instanceof TeacherPortalAuthError) {
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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const body = (await request.json()) as {
      organizationId?: string;
      contact?: {
        key: string;
        kind: "family" | "staff_member" | "school_office";
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

    const user = await requireTeacherPortalUser(supabase, organizationId);
    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );

    if (!staffMemberId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Staff profile not found.",
        code: "missing_staff",
      });
    }

    const admin = createAdminClient();
    const participants = await resolveParticipantsForContact(
      admin,
      organizationId,
      body.contact,
      { staffMemberId, viewer: "teacher" },
    );
    const threadId = await findOrCreateThread(admin, organizationId, participants);

    return NextResponse.json({ threadId });
  } catch (err) {
    if (err instanceof TeacherPortalAuthError) {
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
