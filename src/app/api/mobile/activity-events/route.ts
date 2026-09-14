import { NextResponse } from "next/server";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import {
  AUTHENTICATED_AUTH_ACTIONS,
  recordAuthActivity,
  userHasActiveOrgMembership,
} from "@/lib/activity-auth-server";
import { mergeActivityClientMetadata } from "@/lib/activity-client";
import {
  ACTIVITY_ACTIONS,
  type ActivitySurface,
  type AuthActivityMetadata,
} from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/mobile/activity-events";

type MobilePortalSurface = "parent_portal" | "school_admin";

type MobileActivityBody = {
  action?: string;
  surface?: MobilePortalSurface;
  organizationId?: string;
  metadata?: AuthActivityMetadata;
};

const VALID_SURFACES = new Set<ActivitySurface>([
  "parent_portal",
  "school_admin",
]);

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in to log this activity.",
      code: "unauthenticated",
    });
  }

  let body: MobileActivityBody;
  try {
    body = (await request.json()) as MobileActivityBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const action = body.action?.trim();
  const surface = body.surface;

  if (!action || !AUTHENTICATED_AUTH_ACTIONS.has(action)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Unsupported auth activity action.",
      code: "invalid_action",
    });
  }

  if (!surface || !VALID_SURFACES.has(surface)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "A valid surface is required.",
      code: "invalid_surface",
    });
  }

  const organizationId = body.organizationId?.trim();
  const admin = createAdminClient();

  if (organizationId && action !== ACTIVITY_ACTIONS.AUTH_SESSION_RESTORED) {
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
      try {
        await requireSchoolAdminUser(supabase, organizationId);
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
        throw err;
      }
    }
  } else if (
    organizationId &&
    action === ACTIVITY_ACTIONS.AUTH_SESSION_RESTORED
  ) {
    const hasMembership = await userHasActiveOrgMembership(
      admin,
      user.id,
      organizationId,
    );

    if (!hasMembership) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to this school.",
        code: "forbidden",
      });
    }
  }

  const metadata = mergeActivityClientMetadata(
    request,
    body.metadata,
  ) as AuthActivityMetadata;

  await recordAuthActivity(admin, {
    organizationId: organizationId ?? null,
    actorUserId: user.id,
    actorEmail: user.email ?? null,
    actorType: surface === "school_admin" ? "school_admin" : "parent",
    surface,
    action,
    metadata: {
      ...metadata,
      client: "mobile",
    },
  });

  return new NextResponse(null, { status: 204 });
}
