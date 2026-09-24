import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listBrowsableCommitteesForTeacher } from "@/lib/committees/teacher-committees";
import {
  requireTeacherPortalUser,
  TeacherPortalAuthError,
} from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/committees/browse";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireTeacherPortalUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const committees = await listBrowsableCommitteesForTeacher(
      admin,
      organizationId,
      user.id,
    );

    return NextResponse.json({ committees });
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
      error: "Failed to load committees.",
      code: "internal_error",
      cause: err,
    });
  }
}
