import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  MAX_ROSTER_RECIPIENTS,
  sendFridayBranchClassRosterEmails,
} from "@/lib/friday-branch/friday-branch-roster-email";
import { normalizeNotificationEmails } from "@/lib/notifications/org-notification-settings";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/friday-branch/classes/[classId]/send-roster";

type RouteContext = {
  params: Promise<{ classId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { classId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const organizationId =
    typeof record?.organizationId === "string" ? record.organizationId.trim() : "";
  const rawEmails = Array.isArray(record?.emails) ? record.emails : [];
  const emails = normalizeNotificationEmails(
    rawEmails.filter((value): value is string => typeof value === "string"),
  );

  if (!organizationId || !classId?.trim()) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and classId are required.",
      code: "missing_fields",
    });
  }

  if (emails.length === 0) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "At least one valid email address is required.",
      code: "missing_fields",
    });
  }

  if (emails.length > MAX_ROSTER_RECIPIENTS) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: `You can send to at most ${MAX_ROSTER_RECIPIENTS} email addresses.`,
      code: "too_many_recipients",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);

    const admin = createAdminClient();
    const { sentCount } = await sendFridayBranchClassRosterEmails(admin, {
      organizationId,
      classId: classId.trim(),
      emails,
    });

    return NextResponse.json({ sentCount });
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

    const message =
      err instanceof Error ? err.message : "Failed to send Friday Branch roster.";

    if (message === "Friday Branch class not found.") {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: message,
        code: "not_found",
        cause: err,
      });
    }

    if (message === "No students signed up yet.") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: message,
        code: "empty_roster",
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: message,
      code: "internal_error",
      cause: err,
    });
  }
}
