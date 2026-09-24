import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  loadApplicationDetail,
  loadAssignedTeachersForStudent,
  userHasEnrolledAccess,
} from "@/lib/admissions/parent-portal-access";
import { loadEnrollmentChecklistForApplication } from "@/lib/admissions/enrollment-checklist-materialization";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/children/[applicationId]/profile";

type RouteContext = { params: Promise<{ applicationId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { applicationId } = await context.params;
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId || !applicationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and applicationId are required.",
      code: "missing_fields",
    });
  }

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

  try {
    const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

    const [application, checklist] = await Promise.all([
      loadApplicationDetail(supabase, applicationId, organizationId),
      loadEnrollmentChecklistForApplication(supabase, applicationId, organizationId),
    ]);

    if (!application) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Student profile not found.",
        code: "not_found",
      });
    }

    const admin = createAdminClient();
    const assignedTeachers = application.studentId
      ? await loadAssignedTeachersForStudent(admin, organizationId, application.studentId)
      : [];

    return NextResponse.json({
      profile: {
        application,
        checklist,
        assignedTeachers,
      },
    });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load student profile.",
      cause: err,
      code: "internal_error",
    });
  }
}
