import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getTeacherParentFormById } from "@/lib/school-teacher/forms-documents/load-teacher-forms";
import { createTeacherFormSignedUrl } from "@/lib/school-teacher/forms-documents/teacher-form-file-storage";
import type { TeacherFormConfig } from "@/lib/school-teacher/forms-documents/types";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/forms-documents/[formId]/download";

type RouteContext = {
  params: Promise<{ formId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { formId } = await context.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

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
    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );
    if (!staffMemberId) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have permission to download this form.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const form = await getTeacherParentFormById(
      admin,
      organizationId,
      staffMemberId,
      formId,
    );
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
    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to create download link.",
      code: "download_failed",
      cause: error,
    });
  }
}
