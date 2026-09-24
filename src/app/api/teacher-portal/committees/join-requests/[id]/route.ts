import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { withdrawCommitteeJoinRequest } from "@/lib/committees/join-requests";
import {
  getStaffUserProfile,
  TeacherPortalAuthError,
} from "@/lib/staff/teacher-portal-access";
import { requireTeacherPortalUser } from "@/lib/staff/teacher-portal-access-server";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/committees/join-requests/[id]";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: requestId } = await context.params;
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";
  const committeeName = new URL(request.url).searchParams.get("committeeName")?.trim() ?? "Committee";
  const requesterName =
    new URL(request.url).searchParams.get("requesterName")?.trim() ?? "Staff member";

  if (!organizationId || !requestId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireTeacherPortalUser(supabase, organizationId, request);
    const profile = await getStaffUserProfile(supabase, user.id, organizationId, user);
    const admin = createAdminClient();
    const joinRequest = await withdrawCommitteeJoinRequest(admin, {
      requestId,
      userId: user.id,
      organizationId,
      committeeName,
      requesterName: requesterName || profile.displayName,
      actorType: "teacher",
      surface: "teacher_portal",
    });

    return NextResponse.json({ request: joinRequest });
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
      error: "Failed to withdraw request.",
      cause: err,
      code: "internal_error",
    });
  }
}
