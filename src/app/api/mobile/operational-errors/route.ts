import { NextResponse } from "next/server";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { mergeActivityClientMetadata } from "@/lib/activity-client";
import { apiError } from "@/lib/api/route-errors";
import { reportMobileOperationalError } from "@/lib/operational-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/mobile/operational-errors";

type MobilePortalSurface = "parent_portal" | "school_admin";

type OperationalErrorBody = {
  surface?: MobilePortalSurface;
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

  const surface = body.surface;
  const organizationId = body.organizationId?.trim();
  const operation = body.operation?.trim();
  const error = body.error?.trim();

  if (!surface || (surface !== "parent_portal" && surface !== "school_admin")) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "A valid surface is required.",
      code: "invalid_surface",
    });
  }

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

    if (surface === "parent_portal") {
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
    } else {
      await requireSchoolAdminUser(supabase, organizationId);
    }

    const { data: organization } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("id", organizationId)
      .maybeSingle();

    const clientMetadata = mergeActivityClientMetadata(request, body.metadata);

    await reportMobileOperationalError({
      supabase,
      surface,
      organizationId,
      organizationName: organization?.name ?? null,
      organizationSlug: organization?.slug ?? null,
      operation,
      error,
      code: body.code ?? null,
      details: body.details ?? null,
      entityType: body.entityType ?? null,
      entityId: body.entityId ?? null,
      metadata: clientMetadata,
      notify: body.notify ?? true,
      actor: {
        type: surface === "school_admin" ? "school_admin" : "parent",
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
