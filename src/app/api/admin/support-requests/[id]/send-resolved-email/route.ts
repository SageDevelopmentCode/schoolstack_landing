import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  buildEmailNotificationContext,
  sendAdminSupportRequestResolved,
} from "@/lib/emails";
import { reportOperationalError } from "@/lib/operational-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/support-requests/[id]/send-resolved-email";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: requestId } = await context.params;

  try {
    const adminUser = await requirePlatformAdminUser(supabase, request);
    const admin = createAdminClient();

    const { data: ticket, error: loadError } = await admin
      .from("admin_support_requests")
      .select(
        "id, organization_id, organization_slug, organization_name, submitter_email, topic, status",
      )
      .eq("id", requestId)
      .maybeSingle();

    if (loadError) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load support request.",
        cause: loadError,
      });
    }

    if (!ticket) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Support request not found.",
        code: "not_found",
      });
    }

    const emailResult = await sendAdminSupportRequestResolved({
      submitterEmail: ticket.submitter_email,
      schoolName: ticket.organization_name,
      topic: ticket.topic,
      notificationContext: buildEmailNotificationContext({
        organizationId: ticket.organization_id,
        organizationSlug: ticket.organization_slug,
        surface: "web",
        entityType: "admin_support_request",
        entityId: requestId,
      }),
    });

    if (!emailResult.success) {
      return apiError(ROUTE, {
        request,
        status: 502,
        error: emailResult.error ?? "Failed to send resolved email.",
        code: "email_failed",
      });
    }

    const { data: updated, error: updateError } = await admin
      .from("admin_support_requests")
      .update({ status: "completed" })
      .eq("id", requestId)
      .select("updated_at")
      .single();

    if (updateError || !updated) {
      await reportOperationalError({
        supabase: admin,
        surface: "api",
        operation: "admin_support_request_mark_completed_after_email",
        error:
          "Resolved email sent but failed to mark support request completed.",
        code: "status_update_failed",
        organizationId: ticket.organization_id,
        organizationName: ticket.organization_name,
        organizationSlug: ticket.organization_slug,
        entityType: "admin_support_request",
        entityId: requestId,
        cause: updateError,
        actor: {
          type: "school_admin",
          userId: adminUser.id,
          email: adminUser.email ?? undefined,
        },
        api: { route: ROUTE, method: "POST", status: 500 },
      });

      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Email was sent but updating the ticket failed.",
        code: "status_update_failed",
        cause: updateError,
      });
    }

    return NextResponse.json({
      ok: true,
      updated_at: String(updated.updated_at),
    });
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

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to send resolved email.",
      code: "internal_error",
      cause: error,
    });
  }
}
