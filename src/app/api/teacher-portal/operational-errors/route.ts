import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  sanitizeClientErrorFields,
  shouldNotifyClientError,
} from "@/lib/client-operational-error-input";
import { reportOperationalError } from "@/lib/operational-errors";
import {
  TeacherPortalAuthError,
} from "@/lib/staff/teacher-portal-access";
import { requireTeacherPortalUser } from "@/lib/staff/teacher-portal-access-server";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/operational-errors";

type OperationalErrorBody = {
  organizationId?: string;
  operation?: string;
  error?: string;
  code?: string;
  details?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  let body: OperationalErrorBody;
  try {
    body = (await request.json()) as OperationalErrorBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim();
  const fields = sanitizeClientErrorFields(body);
  const operation = fields?.operation;
  const error = fields?.error;

  if (!organizationId || !operation || !error) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, operation, and error are required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireTeacherPortalUser(supabase, organizationId, request);

    const { data: organization } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("id", organizationId)
      .maybeSingle();

    await reportOperationalError({
      supabase: createAdminClient(),
      surface: "teacher_portal",
      organizationId,
      organizationName: organization?.name ?? null,
      organizationSlug: organization?.slug ?? null,
      operation,
      error,
      code: fields?.code ?? null,
      details: fields?.details ?? null,
      entityType: fields?.entityType ?? null,
      entityId: fields?.entityId ?? null,
      metadata: fields?.metadata,
      // Server decides: client `notify` is ignored; throttled per user + organization.
      notify: shouldNotifyClientError(user.id, organizationId),
      actor: {
        type: "teacher",
        userId: user.id,
        email: user.email ?? null,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof TeacherPortalAuthError) {
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
      error: "Failed to report operational error.",
      code: "internal_error",
      cause: err,
    });
  }
}
