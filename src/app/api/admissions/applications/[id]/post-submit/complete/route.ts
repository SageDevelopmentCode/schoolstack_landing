import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AdmissionsBookingError,
  markPostSubmitStepCompleteManually,
  undoManualPostSubmitStepCompletion,
} from "@/lib/admissions/admissions-booking";
import { postSubmitActionLabel } from "@/lib/admissions/post-submit-templates";
import { parseApplicationFormPostSubmitConfig } from "@/lib/admissions/application-form-schema";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/admissions/applications/[id]/post-submit/complete";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CompleteBody = {
  actionId?: string;
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

async function resolveStepTitle(
  admin: ReturnType<typeof createAdminClient>,
  applicationId: string,
  actionId: string,
): Promise<string> {
  const { data, error } = await admin
    .from("applications")
    .select(
      `
      application_form_versions!inner (
        post_submit_config
      )
    `,
    )
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw error;

  const formVersion = data?.application_form_versions as
    | { post_submit_config?: unknown }
    | { post_submit_config?: unknown }[]
    | null;
  const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
  const config = parseApplicationFormPostSubmitConfig(form?.post_submit_config);
  const action = config.actions.find((entry) => entry.id === actionId);
  return action ? postSubmitActionLabel(action) : "Post-application step";
}

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: applicationId } = await context.params;

  let body: CompleteBody;
  try {
    body = (await request.json()) as CompleteBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_request",
    });
  }

  const actionId = body.actionId?.trim();
  if (!actionId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "actionId is required.",
      code: "invalid_request",
    });
  }

  try {
    const user = await requireAuthenticatedUser(supabase);
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

    const booking = await markPostSubmitStepCompleteManually(admin, {
      organizationId,
      applicationId,
      actionId,
      actorUserId: user.id,
    });

    const stepTitle = await resolveStepTitle(admin, applicationId, actionId);

    void logActivityEvent(admin, {
      organizationId,
      actorType: "school_admin",
      actorUserId: user.id,
      actorEmail: user.email,
      surface: "school_admin",
      action: ACTIVITY_ACTIONS.POST_SUBMIT_STEP_COMPLETED_MANUALLY,
      entityType: "admissions_scheduled_visit",
      entityId: booking.id,
      summary: `Marked "${stepTitle}" complete`,
      metadata: {
        applicationId,
        actionId,
        actionType: booking.actionType,
      },
    });

    return NextResponse.json({
      booking: {
        schedulingMode: booking.schedulingMode,
        scheduledDate: booking.scheduledDate,
        completedManuallyAt: booking.completedManuallyAt,
      },
    });
  } catch (error) {
    if (error instanceof AuthError || error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }

    if (error instanceof AdmissionsBookingError) {
      const status =
        error.code === "already_scheduled"
          ? 409
          : error.code === "not_found" || error.code === "action_not_found"
            ? 404
            : 400;
      return apiError(ROUTE, {
        request,
        status,
        error: error.message,
        code: error.code,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to mark post-application step complete.",
      cause: error,
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: applicationId } = await context.params;

  let body: CompleteBody;
  try {
    body = (await request.json()) as CompleteBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_request",
    });
  }

  const actionId = body.actionId?.trim();
  if (!actionId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "actionId is required.",
      code: "invalid_request",
    });
  }

  try {
    const user = await requireAuthenticatedUser(supabase);
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

    const stepTitle = await resolveStepTitle(admin, applicationId, actionId);

    await undoManualPostSubmitStepCompletion(admin, {
      organizationId,
      applicationId,
      actionId,
    });

    void logActivityEvent(admin, {
      organizationId,
      actorType: "school_admin",
      actorUserId: user.id,
      actorEmail: user.email,
      surface: "school_admin",
      action: ACTIVITY_ACTIONS.POST_SUBMIT_STEP_MANUAL_COMPLETION_UNDONE,
      entityType: "application",
      entityId: applicationId,
      summary: `Undid manual completion for "${stepTitle}"`,
      metadata: {
        applicationId,
        actionId,
      },
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

    if (error instanceof AdmissionsBookingError) {
      const status =
        error.code === "not_found" || error.code === "not_manual_completion"
          ? 404
          : 400;
      return apiError(ROUTE, {
        request,
        status,
        error: error.message,
        code: error.code,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to undo manual post-application step completion.",
      cause: error,
    });
  }
}
