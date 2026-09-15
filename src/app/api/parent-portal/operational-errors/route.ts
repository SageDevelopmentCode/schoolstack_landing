import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { apiError } from "@/lib/api/route-errors";
import { reportOperationalError } from "@/lib/operational-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/parent-portal/operational-errors";

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError(ROUTE, {
        request,
        status: 401,
        error: "You must be signed in.",
        code: "unauthorized",
      });
    }

    const allowed = await userHasEnrolledAccess(
      supabase,
      user.id,
      organizationId,
    );

    if (!allowed) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have parent portal access to this school.",
        code: "forbidden",
      });
    }

    const { data: organization } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("id", organizationId)
      .maybeSingle();

    await reportOperationalError({
      supabase: createAdminClient(),
      surface: "parent_portal",
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
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to report operational error.",
      code: "internal_error",
      cause: err,
    });
  }
}
