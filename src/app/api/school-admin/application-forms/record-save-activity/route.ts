import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { recordApplicationFormSaveActivityServer } from "@/lib/admissions/record-application-form-save-activity-server";
import {
  getSchoolAdminUserProfile,
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/application-forms/record-save-activity";

type RequestBody = {
  organizationId?: string;
  formVersionId?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  const formVersionId = body.formVersionId?.trim() ?? "";
  const summary = body.summary?.trim() ?? "";

  if (!organizationId || !formVersionId || !summary) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, formVersionId, and summary are required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const profile = getSchoolAdminUserProfile(user);

    const admin = createAdminClient();
    const { data: form, error: formError } = await admin
      .from("application_form_versions")
      .select("id")
      .eq("id", formVersionId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (formError) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to verify application form.",
        cause: formError,
      });
    }

    if (!form) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Application form not found.",
        code: "not_found",
      });
    }

    const activityEventId = await recordApplicationFormSaveActivityServer(admin, {
      organizationId,
      formVersionId,
      summary,
      metadata: body.metadata ?? {},
      actorUserId: user.id,
      actorEmail: profile.email,
      actorName: profile.displayName,
    });

    return NextResponse.json({ ok: true, activityEventId });
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
      error: "Failed to record application form save activity.",
      cause: err,
    });
  }
}
