import { apiError } from "@/lib/api/route-errors";
import { handlePostCommitteeMessage } from "@/lib/committees/api/committee-message-route";
import { SCHOOL_ADMIN_ATTRIBUTION } from "@/lib/committees/attribution";
import {
  getSchoolAdminUserProfile,
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/committees/[committeeId]/messages";

type RouteContext = { params: Promise<{ committeeId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { committeeId } = await context.params;

  let resolvedOrganizationId =
    new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";

  if (!resolvedOrganizationId && request.headers.get("content-type")?.includes("multipart/form-data")) {
    const formData = await request.clone().formData();
    resolvedOrganizationId = String(formData.get("organizationId") ?? "").trim();
  }

  if (!resolvedOrganizationId || !committeeId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireSchoolAdminUser(supabase, resolvedOrganizationId, request);
    const profile = getSchoolAdminUserProfile(user);

    return handlePostCommitteeMessage(request, ROUTE, {
      committeeId,
      organizationId: resolvedOrganizationId,
      actorUserId: user.id,
      actorEmail: profile.email,
      actorName: profile.displayName,
      senderMemberId: null,
      senderName: SCHOOL_ADMIN_ATTRIBUTION,
      actorType: "school_admin",
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
      error: "Failed to send message.",
      cause: err,
    });
  }
}
