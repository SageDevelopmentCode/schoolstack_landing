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
import {
  loadOrganizationName,
  resolvePortalSignInDiscordActorType,
} from "@/lib/auth/portal-sign-in-discord";
import { notifyRootedMeadowsPortalSignedIn } from "@/lib/discord";
import { reportOperationalError } from "@/lib/operational-errors";
import {
  isPlatformAdmin,
  userCanAccessSchoolAdmin,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/activity/auth-event";

const VALID_SURFACES = new Set<ActivitySurface>([
  "parent_portal",
  "public_apply",
  "login",
  "platform_admin",
  "school_admin",
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
  const canAccessSchoolAdmin =
    surface === "school_admin" && organizationId
      ? await userCanAccessSchoolAdmin(supabase, user.id, organizationId)
      : false;

  if (surface === "platform_admin") {
    if (!(await isPlatformAdmin(supabase, user.id))) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "Platform admin access is required.",
        code: "forbidden",
      });
    }
  } else if (
    organizationId &&
    !canAccessSchoolAdmin &&
    action !== ACTIVITY_ACTIONS.AUTH_SESSION_RESTORED
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

  const metadata = body.metadata;

  await recordAuthActivity(admin, {
    organizationId: organizationId ?? null,
    actorUserId: user.id,
    actorEmail: user.email ?? null,
    actorType: surface === "platform_admin" ? "platform_admin" : undefined,
    surface,
    action,
    metadata,
  });

  if (
    action === ACTIVITY_ACTIONS.AUTH_SIGNED_IN &&
    metadata?.freshSignIn === true &&
    surface === "platform_admin" &&
    user.email
  ) {
    try {
      await notifyRootedMeadowsPortalSignedIn({
        email: user.email,
        client: "web",
        surface: "platform_admin",
        actorType: "platform_admin",
        method: metadata.method,
        page: "/login",
      });
    } catch (error) {
      void reportOperationalError({
        supabase: admin,
        surface: "api",
        operation: "web_platform_admin_sign_in_discord",
        error: "Failed to send platform admin sign-in Discord notification.",
        notify: true,
        cause: error,
        actor: {
          type: "platform_admin",
          userId: user.id,
          email: user.email,
        },
        api: { route: ROUTE, method: "POST", status: 500 },
      });
    }
  }

  if (
    action === ACTIVITY_ACTIONS.AUTH_SIGNED_IN &&
    metadata?.freshSignIn === true &&
    surface === "school_admin" &&
    organizationId &&
    canAccessSchoolAdmin &&
    user.email
  ) {
    try {
      const actorType = await resolvePortalSignInDiscordActorType(
        supabase,
        user.id,
        "school_admin",
        "school_admin",
      );
      const schoolName = await loadOrganizationName(admin, organizationId);

      await notifyRootedMeadowsPortalSignedIn({
        email: user.email,
        client: "web",
        surface: "school_admin",
        actorType,
        schoolName,
        method: metadata.method,
        page: "/login",
      });
    } catch (error) {
      void reportOperationalError({
        supabase: admin,
        surface: "api",
        operation: "web_school_admin_sign_in_discord",
        error: "Failed to send school admin sign-in Discord notification.",
        notify: true,
        cause: error,
        organizationId,
        actor: {
          type: "school_admin",
          userId: user.id,
          email: user.email,
        },
        api: { route: ROUTE, method: "POST", status: 500 },
      });
    }
  }

  return new NextResponse(null, { status: 204 });
}
