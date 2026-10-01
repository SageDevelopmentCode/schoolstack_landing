import { apiError } from "@/lib/api/route-errors";
import {
  handleRecordCommitteeActivity,
  type RecordCommitteeActivityBody,
} from "@/lib/committees/api/committee-record-activity-route";
import {
  getSchoolAdminUserProfile,
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/committees/[committeeId]/record-activity";

type RouteContext = { params: Promise<{ committeeId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { committeeId } = await context.params;

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
    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const profile = getSchoolAdminUserProfile(user);

    return handleRecordCommitteeActivity(request, ROUTE, committeeId, body, {
      userId: user.id,
      email: profile.email,
      name: profile.displayName,
      memberId: null,
      type: "school_admin",
      surface: "school_admin",
    });
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
      error: "Failed to record activity.",
      cause: err,
    });
  }
}
