import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { createCommitteeJoinRequest } from "@/lib/committees/join-requests";
import { resolveParentGuardianForOrg } from "@/lib/committees/parent-committees";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/join-requests";

type JoinRequestBody = {
  organizationId?: string;
  committeeId?: string;
  schoolSlug?: string;
  schoolName?: string;
  committeeName?: string;
  preferredDutyRoleId?: string | null;
  grade?: string | null;
  note?: string | null;
};

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
    const hasEnrolledAccess = await userHasEnrolledAccess(
      supabase,
      user.id,
      organizationId,
    );

    if (!hasEnrolledAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to request committees for this school.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const guardian = await resolveParentGuardianForOrg(
      admin,
      user.id,
      organizationId,
      user.email ?? "",
    );

    const joinRequest = await createCommitteeJoinRequest(admin, {
      organizationId,
      committeeId,
      userId: user.id,
      guardianId: guardian.id,
      guardianName: guardian.displayName,
      guardianEmail: guardian.email,
      committeeName,
      schoolName,
      schoolSlug,
      preferredDutyRoleId: body.preferredDutyRoleId ?? null,
      grade: body.grade ?? null,
      note: body.note ?? null,
    });

    return NextResponse.json({ request: joinRequest });
  } catch (err) {
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
