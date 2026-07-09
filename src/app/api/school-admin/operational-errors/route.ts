import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { reportOperationalError } from "@/lib/operational-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/operational-errors";

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

  if (!organizationId || !operation || !error) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, operation, and error are required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireSchoolAdminUser(supabase, organizationId);

    const { data: organization } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("id", organizationId)
      .maybeSingle();

    await reportOperationalError({
      supabase,
      surface: "school_admin",
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
        type: "school_admin",
        userId: user.id,
        email: user.email ?? null,
      },
    });

    return new NextResponse(null, { status: 204 });
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

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to report operational error.",
      code: "internal_error",
      cause: err,
    });
  }
}
