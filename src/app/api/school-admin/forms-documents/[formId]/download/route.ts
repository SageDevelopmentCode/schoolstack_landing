import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getOrgParentFormById } from "@/lib/school-admin/forms-documents/load-admin-forms";
import { requireSchoolAdminUser, SchoolAdminAuthError } from "@/lib/school-admin/access";
import { createTeacherFormSignedUrl } from "@/lib/school-teacher/forms-documents/teacher-form-file-storage";
import type { TeacherFormConfig } from "@/lib/school-teacher/forms-documents/types";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/forms-documents/[formId]/download";

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

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const form = await getOrgParentFormById(admin, organizationId, formId);
    if (!form) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Form not found.",
        code: "not_found",
      });
    }

    if (form.formType !== "upload") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Only uploaded documents can be downloaded.",
        code: "invalid_form_type",
      });
    }

    const { data: row, error } = await admin
      .from("teacher_parent_forms")
      .select("config")
      .eq("organization_id", organizationId)
      .eq("id", formId)
      .maybeSingle();

    if (error) throw error;

    const config = (row?.config ?? {}) as TeacherFormConfig;
    const storagePath = config.upload?.storagePath;
    if (!storagePath) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "No file is attached to this form.",
        code: "not_found",
      });
    }

    const signedUrl = await createTeacherFormSignedUrl(admin, storagePath);

    return NextResponse.json({
      signedUrl,
      fileName: config.upload?.fileName ?? form.uploadFileName ?? "document",
    });
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
    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to create download link.",
      code: "download_failed",
      cause: error,
    });
  }
}
