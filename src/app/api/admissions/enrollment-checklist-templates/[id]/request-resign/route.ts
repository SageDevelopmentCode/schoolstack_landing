import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthError,
} from "@/lib/admissions/application-auth";
import {
  EnrollmentMaterializationError,
  requestEnrollmentAgreementResign,
} from "@/lib/admissions/enrollment-checklist-materialization";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/enrollment-checklist-templates/[id]/request-resign";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type RequestBody = {
  documentTemplateId?: string;
  sectionIds?: string[];
  message?: string;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: templateId } = await context.params;

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const documentTemplateId =
    typeof body.documentTemplateId === "string" ? body.documentTemplateId.trim() : "";
  const sectionIds = Array.isArray(body.sectionIds)
    ? body.sectionIds
        .filter((sectionId): sectionId is string => typeof sectionId === "string")
        .map((sectionId) => sectionId.trim())
        .filter(Boolean)
    : [];

  if (!documentTemplateId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "documentTemplateId is required.",
      code: "invalid_body",
    });
  }

  if (sectionIds.length === 0) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "At least one sectionId is required.",
      code: "invalid_body",
    });
  }

  try {
    const admin = createAdminClient();
    const { data: template, error: templateError } = await admin
      .from("enrollment_checklist_templates")
      .select("id, organization_id, name")
      .eq("id", templateId)
      .maybeSingle();

    if (templateError) throw templateError;
    if (!template) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Enrollment checklist not found.",
        code: "not_found",
      });
    }

    const organizationId = String(template.organization_id);
    const user = await requireSchoolAdminUser(supabase, organizationId);

    const result = await requestEnrollmentAgreementResign(admin, {
      organizationId,
      documentTemplateId,
      sectionIds,
      message: body.message,
    });

    void logActivityEvent(admin, {
      organizationId,
      actorType: "school_admin",
      actorUserId: user.id,
      actorName: user.email ?? undefined,
      surface: "school_admin",
      action: ACTIVITY_ACTIONS.CHECKLIST_RESIGN_REQUESTED,
      entityType: "enrollment_checklist_template",
      entityId: templateId,
      summary: "Requested enrollment agreement re-sign",
      metadata: {
        documentTemplateId,
        sectionIds,
        affectedInstanceCount: result.affectedInstanceCount,
        checklistName: template.name,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SchoolAdminAuthError || error instanceof AuthError) {
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
      error: "Failed to request enrollment agreement re-sign.",
      code: "internal_error",
      cause: error,
    });
  }
}
