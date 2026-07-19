import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthError,
  requireAuthenticatedUser,
  userOwnsApplication,
} from "@/lib/admissions/application-auth";
import {
  ApplicationMaterializationError,
  materializeApplicationStudent,
} from "@/lib/admissions/application-entity-materialization";
import { sendApplicationSubmittedNotifications } from "@/lib/admissions/application-notifications";
import {
  getApplicationForSubmit,
  loadPublishedFormForApplication,
  submitApplicationRecord,
  validateApplicationForSubmit,
} from "@/lib/admissions/application-submit";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/applications/[id]/submit";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: applicationId } = await context.params;

  try {
    const user = await requireAuthenticatedUser(supabase);
    const ownsApplication = await userOwnsApplication(
      supabase,
      user.id,
      applicationId,
    );

    if (!ownsApplication) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Application not found.",
        code: "not_found",
      });
    }

    const admin = createAdminClient();
    const application = await getApplicationForSubmit(admin, applicationId);

    if (!application) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Application not found.",
        code: "not_found",
      });
    }

    if (application.status !== "draft") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "This application has already been submitted.",
        code: "not_draft",
      });
    }

    const { schema, feeConfig } = await loadPublishedFormForApplication(
      admin,
      application,
    );

    if (feeConfig.enabled && application.feeStatus === "pending") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Please pay the application fee before submitting.",
        code: "fee_required",
      });
    }

    const validationError = validateApplicationForSubmit(schema, application);
    if (validationError) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: validationError.error,
        code: validationError.code,
      });
    }

    await materializeApplicationStudent(admin, applicationId);
    await submitApplicationRecord(admin, applicationId);
    void sendApplicationSubmittedNotifications(admin, applicationId);

    const { data: formRow } = await admin
      .from("application_form_versions")
      .select("title")
      .eq("id", application.formVersionId)
      .maybeSingle();

    void logActivityEvent(admin, {
      organizationId: application.organizationId,
      actorType: "parent",
      actorUserId: user.id,
      actorEmail: user.email,
      surface: "public_apply",
      action: ACTIVITY_ACTIONS.APPLICATION_SUBMITTED,
      entityType: "application",
      entityId: applicationId,
      summary: `Application submitted${formRow?.title ? ` for “${String(formRow.title)}”` : ""}`,
      metadata: {
        formVersionId: application.formVersionId,
        programId: application.programId,
        formTitle: formRow?.title ? String(formRow.title) : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (error instanceof ApplicationMaterializationError) {
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
      error: "Failed to submit application.",
      code: "internal_error",
      cause: error,
    });
  }
}
