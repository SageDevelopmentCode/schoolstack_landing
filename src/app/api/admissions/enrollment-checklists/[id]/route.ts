import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthError,
  requireAuthenticatedUser,
  userIsOrgAdmin,
  userOwnsApplication,
} from "@/lib/admissions/application-auth";
import {
  EnrollmentMaterializationError,
  saveEnrollmentChecklistActiveItem,
} from "@/lib/admissions/enrollment-checklist-materialization";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/enrollment-checklists/[id]";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ProgressBody = {
  lastActiveTemplateItemId?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: checklistId } = await context.params;

  let body: ProgressBody;
  try {
    body = (await request.json()) as ProgressBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const templateItemId = body.lastActiveTemplateItemId?.trim();
  if (!templateItemId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "lastActiveTemplateItemId is required.",
      code: "invalid_body",
    });
  }

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();

    const { data: checklist, error: checklistError } = await admin
      .from("enrollment_checklists")
      .select("id, organization_id, application_id")
      .eq("id", checklistId)
      .maybeSingle();

    if (checklistError) throw checklistError;
    if (!checklist) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Enrollment checklist not found.",
        code: "not_found",
      });
    }

    const organizationId = String(checklist.organization_id);
    const applicationId = checklist.application_id
      ? String(checklist.application_id)
      : null;

    const isAdmin = await userIsOrgAdmin(supabase, user.id, organizationId);
    const ownsApplication =
      applicationId &&
      (await userOwnsApplication(supabase, user.id, applicationId));

    if (!isAdmin && !ownsApplication) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to this enrollment checklist.",
        code: "forbidden",
      });
    }

    if (isAdmin) {
      await requireSchoolAdminUser(supabase, organizationId);
    }

    await saveEnrollmentChecklistActiveItem(admin, {
      checklistId,
      templateItemId,
      organizationId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof SchoolAdminAuthError ||
      error instanceof AuthError ||
      error instanceof EnrollmentMaterializationError
    ) {
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
      error: "Failed to update enrollment checklist progress.",
      code: "internal_error",
      cause: error,
    });
  }
}
