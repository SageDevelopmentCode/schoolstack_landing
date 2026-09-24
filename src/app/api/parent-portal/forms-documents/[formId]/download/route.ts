import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { assertParentFormAccess } from "@/lib/school-parent/forms-documents/load-parent-forms";
import { getParentFormUploadStoragePath } from "@/lib/school-parent/forms-documents/mutations";
import { createTeacherFormSignedUrl } from "@/lib/school-teacher/forms-documents/teacher-form-file-storage";
import { createClientFromRequest, getUserFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/forms-documents/[formId]/download";

type RouteContext = {
  params: Promise<{ formId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { formId } = await context.params;
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

  const {
    data: { user },
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
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

    const familyIds = await getFamilyIdsForUser(supabase, user.id, organizationId);
    const familyId = familyIds[0];
    if (!familyId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Form not found.",
        code: "not_found",
      });
    }

    const admin = createAdminClient();
    await assertParentFormAccess(admin, organizationId, familyId, formId);

    const { storagePath, fileName } = await getParentFormUploadStoragePath(
      admin,
      organizationId,
      formId,
    );
    const signedUrl = await createTeacherFormSignedUrl(admin, storagePath);

    return NextResponse.json({ signedUrl, fileName });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create download link.";
    const status = message === "Form not found." ? 404 : 500;
    return apiError(ROUTE, {
      request,
      status,
      error: message,
      code: status === 404 ? "not_found" : "download_failed",
      cause: err,
    });
  }
}
