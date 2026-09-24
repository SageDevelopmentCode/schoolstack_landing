import { NextResponse } from "next/server";
import {
  AUTHENTICATED_AUTH_ACTIONS,
  recordAuthActivity,
} from "@/lib/activity-auth-server";
import { mergeActivityClientMetadata } from "@/lib/activity-client";
import {
  type ActivitySurface,
  type AuthActivityMetadata,
} from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  createClientFromRequest,
  getUserFromRequest,
  signedInErrorForRequest,
} from "@/lib/supabase/request-client";
import { authorizeMobileActivityEvent } from "./authorize-mobile-activity";

const ROUTE = "/api/mobile/activity-events";

type MobilePortalSurface = "parent_portal" | "school_admin" | "teacher_portal";

type MobileActivityBody = {
  action?: string;
  surface?: MobilePortalSurface;
  organizationId?: string;
  metadata?: AuthActivityMetadata;
};

const VALID_SURFACES = new Set<ActivitySurface>([
  "parent_portal",
  "school_admin",
  "teacher_portal",
]);

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (authError || !user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
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

  const authResult = await authorizeMobileActivityEvent(
    supabase,
    user.id,
    organizationId,
    surface,
    request,
  );

  if (!authResult.ok) {
    return apiError(ROUTE, {
      request,
      status: authResult.status,
      error: authResult.error,
      code: authResult.code,
      cause: authResult.cause,
    });
  }

  const metadata = mergeActivityClientMetadata(
    request,
    body.metadata,
  ) as AuthActivityMetadata;

  await recordAuthActivity(admin, {
    organizationId: organizationId ?? null,
    actorUserId: user.id,
    actorEmail: user.email ?? null,
    actorType: authResult.actorType,
    surface,
    action,
    metadata: {
      ...metadata,
      client: "mobile",
    },
  });

  return new NextResponse(null, { status: 204 });
}
