import { NextResponse } from "next/server";
import { AuthError } from "@/lib/admissions/application-auth";
import { requireAuthenticatedUser } from "@/lib/admissions/application-auth-server";
import { removePostSubmitStepCompletionFile } from "@/lib/admissions/post-submit-step-documentation";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE =
  "/api/admissions/applications/[id]/post-submit/steps/[actionId]/files/[fileId]";

type RouteContext = {
  params: Promise<{ id: string; actionId: string; fileId: string }>;
};

async function loadApplicationOrganizationId(
  admin: ReturnType<typeof createAdminClient>,
  applicationId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("applications")
    .select("organization_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw error;
  return data?.organization_id ? String(data.organization_id) : null;
}

export async function DELETE(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: applicationId, actionId: rawActionId, fileId: rawFileId } =
    await context.params;
  const actionId = rawActionId.trim();
  const fileId = rawFileId.trim();

  if (!actionId || !fileId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "actionId and fileId are required.",
      code: "invalid_request",
    });
  }

  try {
    const user = await requireAuthenticatedUser(supabase, request);
    const admin = createAdminClient();
    const organizationId = await loadApplicationOrganizationId(admin, applicationId);

    if (!organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Application not found.",
        code: "not_found",
      });
    }

    await requireSchoolAdminUser(supabase, organizationId, request);

    await removePostSubmitStepCompletionFile(admin, {
      organizationId,
      applicationId,
      actionId,
      fileId,
      actorUserId: user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError || error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }

    if (error instanceof Error && error.message === "File not found.") {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: error.message,
        code: "not_found",
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to remove file.",
      cause: error,
    });
  }
}
