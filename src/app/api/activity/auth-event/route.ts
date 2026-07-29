import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AUTHENTICATED_AUTH_ACTIONS,
  recordAuthActivity,
  userHasActiveOrgMembership,
} from "@/lib/activity-auth-server";
import { apiError } from "@/lib/api/route-errors";
import {
  ACTIVITY_ACTIONS,
  type ActivitySurface,
  type AuthActivityMetadata,
} from "@/lib/activity-log";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/activity/auth-event";

const VALID_SURFACES = new Set<ActivitySurface>([
  "parent_portal",
  "public_apply",
  "login",
]);

type AuthEventRequestBody = {
  action?: string;
  organizationId?: string;
  surface?: ActivitySurface;
  metadata?: AuthActivityMetadata;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
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

  let body: AuthEventRequestBody;
  try {
    body = (await request.json()) as AuthEventRequestBody;
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

  await recordAuthActivity(admin, {
    organizationId: organizationId ?? null,
    actorUserId: user.id,
    actorEmail: user.email ?? null,
    surface,
    action,
    metadata: body.metadata,
  });

  return new NextResponse(null, { status: 204 });
}
