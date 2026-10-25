import { NextResponse } from "next/server";
import { mergeActivityClientMetadata } from "@/lib/activity-client";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
  type ActivitySurface,
} from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import { isMobilePreviewRequest } from "@/lib/mobile-preview-header";
import {
  normalizeMobileFeatureKey,
  shouldRecordMobileFeatureVisit,
} from "@/lib/mobile-feature-visit-policy";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  createClientFromRequest,
  getUserFromRequest,
  signedInErrorForRequest,
} from "@/lib/supabase/request-client";
import {
  authorizeMobileActivityEvent,
  type MobilePortalSurface,
} from "../activity-events/authorize-mobile-activity";

const ROUTE = "/api/mobile/feature-visits";

const MAX_PATHNAME_LENGTH = 200;

type MobileFeatureVisitBody = {
  organizationId?: string;
  surface?: MobilePortalSurface;
  featureKey?: string;
  pathname?: string;
  programSlug?: string;
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

  const isPreview = isMobilePreviewRequest(request);
  if (isPreview) {
    return new NextResponse(null, { status: 204 });
  }

  let body: MobileFeatureVisitBody;
  try {
    body = (await request.json()) as MobileFeatureVisitBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const surface = body.surface;
  if (!surface || surface === "platform_admin" || !VALID_SURFACES.has(surface)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "A valid portal surface is required.",
      code: "invalid_surface",
    });
  }

  const featureKey = normalizeMobileFeatureKey(body.featureKey);
  if (!featureKey) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "A valid featureKey is required.",
      code: "invalid_feature_key",
    });
  }

  const organizationId = body.organizationId?.trim();
  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "invalid_organization",
    });
  }

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

  if (
    !shouldRecordMobileFeatureVisit({
      isPreview: false,
      actorType: authResult.actorType,
    })
  ) {
    return new NextResponse(null, { status: 204 });
  }

  const pathname = body.pathname?.trim().slice(0, MAX_PATHNAME_LENGTH);
  const programSlug = body.programSlug?.trim().slice(0, 120);

  const metadata = mergeActivityClientMetadata(request, {
    featureKey,
    ...(pathname ? { pathname } : {}),
    ...(programSlug ? { programSlug } : {}),
    client: "mobile",
  });

  const admin = createAdminClient();
  await logActivityEvent(admin, {
    organizationId,
    actorType: authResult.actorType,
    actorUserId: user.id,
    actorEmail: user.email ?? null,
    surface,
    action: ACTIVITY_ACTIONS.MOBILE_FEATURE_VISITED,
    entityType: "mobile_feature",
    entityId: featureKey,
    summary: `Opened ${featureKey} (MudKitchen mobile)`,
    metadata,
  });

  return new NextResponse(null, { status: 204 });
}
