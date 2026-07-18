import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthError,
  requireAuthenticatedUser,
  userOwnsApplication,
} from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { reportOperationalError } from "@/lib/operational-errors";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/operational-errors";

type OperationalErrorBody = {
  organizationId?: string;
  operation?: string;
  error?: string;
  code?: string;
  details?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  notify?: boolean;
};

async function userCanReportApplyError(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  organizationId: string,
  applicationId?: string | null,
): Promise<boolean> {
  if (applicationId) {
    return userOwnsApplication(supabase, userId, applicationId);
  }

  const { data, error } = await supabase
    .from("organization_memberships")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (data) return true;

  const { data: guardian, error: guardianError } = await supabase
    .from("guardians")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (guardianError) throw guardianError;
  return Boolean(guardian);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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
  const operation = body.operation?.trim();
  const error = body.error?.trim();
  const applicationId =
    body.entityType === "application" ? body.entityId?.trim() : undefined;

  if (!organizationId || !operation || !error) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, operation, and error are required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireAuthenticatedUser(supabase);
    const canReport = await userCanReportApplyError(
      supabase,
      user.id,
      organizationId,
      applicationId,
    );

    if (!canReport) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to report errors for this application.",
        code: "forbidden",
      });
    }

    const { data: organization } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("id", organizationId)
      .maybeSingle();

    await reportOperationalError({
      supabase,
      surface: "public_apply",
      organizationId,
      organizationName: organization?.name ?? null,
      organizationSlug: organization?.slug ?? null,
      operation,
      error,
      code: body.code ?? null,
      details: body.details ?? null,
      entityType: body.entityType ?? null,
      entityId: body.entityId ?? null,
      metadata: body.metadata,
      notify: body.notify ?? true,
      actor: {
        type: "parent",
        userId: user.id,
        email: user.email ?? null,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof AuthError) {
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
