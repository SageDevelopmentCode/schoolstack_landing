import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  EnrollmentMaterializationError,
  markApplicationAsEnrolled,
} from "@/lib/admissions/enrollment-checklist-materialization";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/applications/[id]/mark-enrolled";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type MarkEnrolledBody = {
  note?: string;
  completeChecklist?: boolean;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: applicationId } = await context.params;

  let body: MarkEnrolledBody = {};
  try {
    const rawBody = await request.text();
    if (rawBody.trim()) {
      body = JSON.parse(rawBody) as MarkEnrolledBody;
    }
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  try {
    const admin = createAdminClient();
    const { data: application, error } = await admin
      .from("applications")
      .select("id, organization_id")
      .eq("id", applicationId)
      .maybeSingle();

    if (error) throw error;
    if (!application) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Application not found.",
        code: "not_found",
      });
    }

    const user = await requireSchoolAdminUser(
      supabase,
      String(application.organization_id),
    );

    const result = await markApplicationAsEnrolled(admin, {
      applicationId,
      actorUserId: user.id,
      note: body.note?.trim() || undefined,
      completeChecklist: body.completeChecklist,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (error instanceof EnrollmentMaterializationError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to mark application as enrolled.",
      code: "internal_error",
      cause: error,
    });
  }
}
