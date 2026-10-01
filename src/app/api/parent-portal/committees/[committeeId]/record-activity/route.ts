import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import {
  handleRecordCommitteeActivity,
  type RecordCommitteeActivityBody,
} from "@/lib/committees/api/committee-record-activity-route";
import {
  getParentCommitteeWorkspace,
  resolveParentGuardianForOrg,
} from "@/lib/committees/parent-committees";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/[committeeId]/record-activity";

type RouteContext = { params: Promise<{ committeeId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { committeeId } = await context.params;

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

  let body: RecordCommitteeActivityBody;
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
  if (!organizationId || !committeeId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
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
        error: "You do not have access to this committee.",
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

    await getParentCommitteeWorkspace(admin, organizationId, user.id, committeeId);

    const { data: actorMember } = await admin
      .from("committee_members")
      .select("id")
      .eq("committee_id", committeeId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    return handleRecordCommitteeActivity(request, ROUTE, committeeId, body, {
      userId: user.id,
      email: guardian.email || user.email,
      name: guardian.displayName,
      memberId: actorMember?.id ? String(actorMember.id) : null,
      type: "parent",
      surface: "parent_portal",
    });
  } catch (err) {
    const resolved = portalRouteErrorStatus(err, "Failed to record activity.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
