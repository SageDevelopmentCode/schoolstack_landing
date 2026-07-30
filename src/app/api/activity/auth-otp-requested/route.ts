import { NextResponse } from "next/server";
import {
  isValidAuthEmail,
  organizationExists,
  recordAuthActivity,
} from "@/lib/activity-auth-server";
import { apiError } from "@/lib/api/route-errors";
import { ACTIVITY_ACTIONS, type ActivitySurface, type AuthActivityMetadata } from "@/lib/activity-log";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/activity/auth-otp-requested";

const VALID_SURFACES = new Set<ActivitySurface>([
  "parent_portal",
  "public_apply",
  "login",
]);

const PRE_AUTH_ACTIONS = new Set<string>([
  ACTIVITY_ACTIONS.AUTH_OTP_REQUESTED,
  ACTIVITY_ACTIONS.AUTH_OTP_FAILED,
]);

type AuthOtpRequestedBody = {
  action?: string;
  email?: string;
  organizationId?: string;
  organizationSlug?: string;
  schoolName?: string;
  surface?: ActivitySurface;
  mode?: "create" | "login";
  page?: AuthActivityMetadata["page"];
  resent?: boolean;
  errorCode?: string;
};

function isAuthMode(value: string | undefined): value is "create" | "login" {
  return value === "create" || value === "login";
}

export async function POST(request: Request) {
  let body: AuthOtpRequestedBody;
  try {
    body = (await request.json()) as AuthOtpRequestedBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const email = body.email?.trim().toLowerCase();
  const surface = body.surface;
  const organizationId = body.organizationId?.trim();
  const mode = body.mode;
  const action = body.action?.trim() ?? ACTIVITY_ACTIONS.AUTH_OTP_REQUESTED;

  if (!PRE_AUTH_ACTIONS.has(action)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Unsupported pre-auth activity action.",
      code: "invalid_action",
    });
  }

  if (!isValidAuthEmail(email)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "A valid email is required.",
      code: "invalid_email",
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

  if (mode && !isAuthMode(mode)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "mode must be create or login.",
      code: "invalid_mode",
    });
  }

  const admin = createAdminClient();

  if (organizationId) {
    const exists = await organizationExists(admin, organizationId);
    if (!exists) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "organization_not_found",
      });
    }
  }

  await recordAuthActivity(admin, {
    organizationId: organizationId ?? null,
    actorEmail: email,
    surface,
    action,
    metadata: {
      method: "otp",
      mode: mode ?? "login",
      page: body.page,
      resent: body.resent === true,
      organizationSlug: body.organizationSlug?.trim(),
      errorCode: body.errorCode?.trim(),
    },
    severity:
      action === ACTIVITY_ACTIONS.AUTH_OTP_FAILED ? "warning" : "info",
  });

  return new NextResponse(null, { status: 204 });
}
