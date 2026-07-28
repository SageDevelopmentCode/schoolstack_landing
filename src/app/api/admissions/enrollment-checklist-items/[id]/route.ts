import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthError,
  requireAuthenticatedUser,
  userIsOrgAdmin,
  userOwnsApplication,
} from "@/lib/admissions/application-auth";
import {
  completeChecklistItem,
  EnrollmentMaterializationError,
  saveAgreementSectionSignature,
  saveChecklistItemDraft,
} from "@/lib/admissions/enrollment-checklist-materialization";
import { reportEnrollmentChecklistItemApiFailure } from "@/lib/admissions/enrollment-checklist-operational-errors";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/enrollment-checklist-items/[id]";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CompleteBody = {
  responses?: Record<string, unknown>;
  signerName?: string;
  draft?: boolean;
  agreementSection?: {
    sectionId: string;
    signerName: string;
    consentValue?: string;
  };
};

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: instanceId } = await context.params;

  let body: CompleteBody;
  try {
    body = (await request.json()) as CompleteBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  let organizationId: string | undefined;
  let applicationId: string | null = null;
  let actorUserId: string | undefined;
  let actorEmail: string | null = null;

  try {
    const user = await requireAuthenticatedUser(supabase);
    actorUserId = user.id;
    actorEmail = user.email ?? null;
    const admin = createAdminClient();

    const { data: instance, error: instanceError } = await admin
      .from("enrollment_checklist_items")
      .select(
        `
        id,
        organization_id,
        enrollment_checklists!inner (
          application_id
        )
      `,
      )
      .eq("id", instanceId)
      .maybeSingle();

    if (instanceError) throw instanceError;
    if (!instance) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Checklist item not found.",
        code: "not_found",
      });
    }

    organizationId = String(instance.organization_id);
    const checklist = instance.enrollment_checklists as
      | { application_id?: string }
      | { application_id?: string }[]
      | null;
    const checklistRow = Array.isArray(checklist) ? checklist[0] : checklist;
    applicationId = checklistRow?.application_id
      ? String(checklistRow.application_id)
      : null;

    const isAdmin = await userIsOrgAdmin(supabase, user.id, organizationId);
    const ownsApplication =
      applicationId &&
      (await userOwnsApplication(supabase, user.id, applicationId));

    if (!isAdmin && !ownsApplication) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to this checklist item.",
        code: "forbidden",
      });
    }

    if (isAdmin) {
      await requireSchoolAdminUser(supabase, organizationId);
    }

    if (body.agreementSection) {
      const result = await saveAgreementSectionSignature(admin, {
        instanceId,
        sectionId: body.agreementSection.sectionId,
        signerName: body.agreementSection.signerName,
        consentValue: body.agreementSection.consentValue,
        actorUserId: user.id,
        organizationId,
      });

      return NextResponse.json({
        success: true,
        status: result.status,
        responses: result.responses,
      });
    }

    if (body.draft) {
      if (!body.responses) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "Draft saves require responses.",
          code: "invalid_body",
        });
      }

      const result = await saveChecklistItemDraft(admin, {
        instanceId,
        responses: body.responses,
        organizationId,
      });

      return NextResponse.json({
        success: true,
        status: result.status,
        responses: result.responses,
      });
    }

    await completeChecklistItem(admin, {
      instanceId,
      responses: body.responses,
      signerName: body.signerName,
      actorUserId: user.id,
      organizationId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof EnrollmentMaterializationError && organizationId) {
      await reportEnrollmentChecklistItemApiFailure(createAdminClient(), {
        organizationId,
        applicationId,
        instanceId,
        operation: "enrollment_checklist.update_item",
        error: error.message,
        code: error.code,
        actorUserId,
        actorEmail,
        cause: error,
      });

      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (
      error instanceof SchoolAdminAuthError ||
      error instanceof AuthError
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
      error: "Failed to update checklist item.",
      code: "internal_error",
      cause: error,
    });
  }
}
