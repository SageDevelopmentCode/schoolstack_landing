import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { declineCommitteeJoinRequest } from "@/lib/committees/join-requests";
import {
  getSchoolAdminUserProfile,
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/committees/join-requests/[id]/decline";

type RouteContext = { params: Promise<{ id: string }> };

type DeclineBody = {
  organizationId?: string;
  schoolSlug?: string;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: requestId } = await context.params;

  let body: DeclineBody;
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
  const schoolSlug = body.schoolSlug?.trim() ?? "";

  if (!organizationId || !schoolSlug || !requestId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Missing required fields.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireSchoolAdminUser(supabase, organizationId);
    const profile = getSchoolAdminUserProfile(user);
    const admin = createAdminClient();

    const joinRequest = await declineCommitteeJoinRequest(admin, {
      requestId,
      organizationId,
      reviewerUserId: user.id,
      reviewerName: profile.displayName,
      schoolSlug,
    });

    return NextResponse.json({ request: joinRequest });
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
      error: err instanceof Error ? err.message : "Failed to decline request.",
      code: "internal_error",
      cause: err,
    });
  }
}
