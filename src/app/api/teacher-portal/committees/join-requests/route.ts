import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { createCommitteeJoinRequest } from "@/lib/committees/join-requests";
import { resolveTeacherStaffForOrg } from "@/lib/committees/teacher-committees";
import {
  getStaffMemberIdForUser,
  getStaffUserProfile,
  requireTeacherPortalUser,
  TeacherPortalAuthError,
} from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/committees/join-requests";

type JoinRequestBody = {
  organizationId?: string;
  committeeId?: string;
  schoolSlug?: string;
  schoolName?: string;
  committeeName?: string;
  preferredDutyRoleId?: string | null;
  note?: string | null;
};

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  let body: JoinRequestBody;
  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  const committeeId = body.committeeId?.trim() ?? "";
  const schoolSlug = body.schoolSlug?.trim() ?? "";
  const schoolName = body.schoolName?.trim() ?? "";
  const committeeName = body.committeeName?.trim() ?? "";

  if (!organizationId || !committeeId || !schoolSlug || !schoolName || !committeeName) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Missing required fields.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireTeacherPortalUser(supabase, organizationId);
    const profile = await getStaffUserProfile(supabase, user.id, organizationId, user);
    const admin = createAdminClient();
    const staff = await resolveTeacherStaffForOrg(
      admin,
      user.id,
      organizationId,
      profile.email || user.email || "",
    );
    const staffMemberId = await getStaffMemberIdForUser(admin, user.id, organizationId);

    const joinRequest = await createCommitteeJoinRequest(admin, {
      organizationId,
      committeeId,
      userId: user.id,
      requesterType: "staff",
      staffMemberId: staffMemberId ?? staff.id,
      staffName: staff.displayName,
      staffEmail: staff.email,
      committeeName,
      schoolName,
      schoolSlug,
      preferredDutyRoleId: body.preferredDutyRoleId ?? null,
      note: body.note ?? null,
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

    const resolved = portalRouteErrorStatus(err, "Failed to submit request.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
