import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import {
  EnrollmentMaterializationError,
  getStartEnrollmentPreview,
  startEnrollmentFromApplication,
} from "@/lib/admissions/enrollment-checklist-materialization";
import type { VariantResolutionMap } from "@/lib/admissions/enrollment-checklist-variants";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { sendApplicationAcceptedEnrollmentNotifications } from "@/lib/admissions/application-notifications";

const ROUTE = "/api/admissions/applications/[id]/start-enrollment";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(_request);
  const { id: applicationId } = await context.params;

  try {
    const admin = createAdminClient();
    const { data: application, error } = await admin
      .from("applications")
      .select("id, organization_id, status, student_id, program_id")
      .eq("id", applicationId)
      .maybeSingle();

    if (error) throw error;
    if (!application) {
      return apiError(ROUTE, {
        request: _request,
        status: 404,
        error: "Application not found.",
        code: "not_found",
      });
    }

    await requireSchoolAdminUser(
      supabase,
      String(application.organization_id),
      _request,
    );

    const preview = await getStartEnrollmentPreview(
      admin,
      applicationId,
      String(application.organization_id),
    );

    if (!preview) {
      return apiError(ROUTE, {
        request: _request,
        status: 400,
        error: "No published enrollment checklist is linked to this program.",
        code: "no_checklist",
      });
    }

    return NextResponse.json({
      applicationId,
      status: application.status,
      templateName: preview.templateName,
      groups: preview.groups.map((group) => ({
        groupId: group.groupId,
        groupLabel: group.groupLabel,
        variants: group.variants.map((item) => ({
          id: item.id,
          label: item.label,
          isDefault: item.metadata?.variant &&
            typeof item.metadata.variant === "object" &&
            (item.metadata.variant as { isDefault?: boolean }).isDefault === true,
          sectionCount:
            item.document?.kind === "inline_sections"
              ? item.document.sections.length
              : 0,
        })),
      })),
      sharedItems: preview.sharedItems.map((item) => ({
        id: item.id,
        label: item.label,
        type: item.type,
      })),
    });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request: _request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request: _request,
      status: 500,
      error: "Failed to load enrollment preview.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: applicationId } = await context.params;

  let body: { variantResolutions?: VariantResolutionMap };
  try {
    body = (await request.json()) as { variantResolutions?: VariantResolutionMap };
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
      request,
    );

    const result = await startEnrollmentFromApplication(admin, {
      applicationId,
      variantResolutions: body.variantResolutions ?? {},
      actorUserId: user.id,
    });

    void sendApplicationAcceptedEnrollmentNotifications(admin, applicationId);

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
      error: "Failed to start enrollment.",
      code: "internal_error",
      cause: error,
    });
  }
}
