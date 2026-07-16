import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  activityActionForStatusChange,
  activitySummaryForStatusChange,
  ApplicationStatusTransitionError,
  assertApplicationStatusTransition,
  isApplicationStatus,
  type ApplicationStatus,
} from "@/lib/admissions/application-status-transitions";
import {
  activitySummaryForWithdrawalRestore,
  buildWithdrawalRestoreAction,
  resolveWithdrawalRestoreStatus,
} from "@/lib/admissions/application-withdrawal-restore";
import { logActivityEvent } from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/applications/[id]/status";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type StatusUpdateBody = {
  status?: string;
  note?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: applicationId } = await context.params;

  let body: StatusUpdateBody;
  try {
    body = (await request.json()) as StatusUpdateBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const nextStatus = body.status?.trim();
  if (!nextStatus) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Status is required.",
      code: "missing_status",
    });
  }

  try {
    const admin = createAdminClient();
    const { data: application, error } = await admin
      .from("applications")
      .select("id, organization_id, status")
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
    );

    const currentStatus = String(application.status);

    if (currentStatus === "withdrawn") {
      const restoreTarget = await resolveWithdrawalRestoreStatus(
        admin,
        applicationId,
      );
      if (!restoreTarget) {
        throw new ApplicationStatusTransitionError(
          "Cannot determine a status to restore this application to.",
          "invalid_transition",
          400,
        );
      }
      if (nextStatus !== restoreTarget) {
        throw new ApplicationStatusTransitionError(
          `Cannot move from "withdrawn" to "${nextStatus}".`,
          "invalid_transition",
          400,
        );
      }
    } else {
      assertApplicationStatusTransition(currentStatus, nextStatus);
    }

    const { data: updated, error: updateError } = await admin
      .from("applications")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .select("id, status, updated_at")
      .single();

    if (updateError || !updated) {
      throw updateError ?? new Error("Failed to update application status.");
    }

    const toStatus = nextStatus as ApplicationStatus;
    const note = body.note?.trim();
    const isWithdrawalRestore = currentStatus === "withdrawn";

    await logActivityEvent(admin, {
      organizationId: String(application.organization_id),
      actorType: "school_admin",
      actorUserId: user.id,
      actorEmail: user.email ?? null,
      surface: "school_admin",
      action: isWithdrawalRestore
        ? "application.status_changed"
        : activityActionForStatusChange(toStatus),
      entityType: "application",
      entityId: applicationId,
      summary: isWithdrawalRestore
        ? activitySummaryForWithdrawalRestore(toStatus)
        : activitySummaryForStatusChange(toStatus),
      metadata: {
        fromStatus: currentStatus,
        toStatus,
        ...(note ? { note } : {}),
      },
    });

    return NextResponse.json({
      id: String(updated.id),
      status: String(updated.status),
      updatedAt: String(updated.updated_at),
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

    if (error instanceof ApplicationStatusTransitionError) {
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
      error: "Failed to update application status.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: applicationId } = await context.params;

  try {
    const admin = createAdminClient();
    const { data: application, error } = await admin
      .from("applications")
      .select("id, organization_id, status")
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

    await requireSchoolAdminUser(supabase, String(application.organization_id));

    const currentStatus = String(application.status);
    const { getAllowedStatusTransitions, getApplicationDecisionActions } =
      await import("@/lib/admissions/application-status-transitions");

    let decisionActions = getApplicationDecisionActions(currentStatus);
    let restoreTarget: ApplicationStatus | null = null;

    if (currentStatus === "withdrawn") {
      restoreTarget = await resolveWithdrawalRestoreStatus(admin, applicationId);
      decisionActions = restoreTarget
        ? [buildWithdrawalRestoreAction(restoreTarget)]
        : [];
    }

    return NextResponse.json({
      id: applicationId,
      status: currentStatus,
      allowedTransitions: isApplicationStatus(currentStatus)
        ? getAllowedStatusTransitions(currentStatus)
        : [],
      restoreTarget,
      decisionActions,
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
      error: "Failed to load application status.",
      code: "internal_error",
      cause: error,
    });
  }
}
