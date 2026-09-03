import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  bootstrapApplicant,
  BootstrapApplicantError,
} from "@/lib/admissions/applicant-bootstrap";
import { recordAuthActivity } from "@/lib/activity-auth-server";
import {
  ACTIVITY_ACTIONS,
  isRecentlyCreatedAuthUser,
  logActivityEvent,
} from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import {
  notifyRootedMeadowsParentApplicationStarted,
  type ApplyAuthMode,
} from "@/lib/discord";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { resolveBootstrapNames } from "@/lib/admissions/resolve-bootstrap-names";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/applicant-bootstrap";

type BootstrapRequestBody = {
  organizationId?: string;
  formVersionId?: string;
  firstName?: string;
  lastName?: string;
  schoolName?: string;
  formTitle?: string;
  mode?: ApplyAuthMode;
  forceNew?: boolean;
  entryIntent?: "apply" | "schedule_campus_tour";
};

function isApplyAuthMode(value: string): value is ApplyAuthMode {
  return value === "create" || value === "login";
}

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
      error: "You must be signed in to continue.",
      code: "unauthenticated",
    });
  }

  let body: BootstrapRequestBody;
  try {
    body = (await request.json()) as BootstrapRequestBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim();
  const formVersionId = body.formVersionId?.trim();

  if (!organizationId || !formVersionId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and formVersionId are required.",
      code: "missing_fields",
    });
  }

  const email = user.email;
  if (!email) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Your account has no email address.",
      code: "missing_email",
    });
  }

  try {
    const admin = createAdminClient();
    const entryIntent =
      body.entryIntent === "schedule_campus_tour" ? "schedule_campus_tour" : "apply";

    const { firstName, lastName } = resolveBootstrapNames({
      bodyFirstName: body.firstName,
      bodyLastName: body.lastName,
      userMetadata: user.user_metadata,
    });

    const result = await bootstrapApplicant(admin, {
      userId: user.id,
      email,
      organizationId,
      formVersionId,
      firstName,
      lastName,
      forceNew: body.forceNew === true,
      entryIntent,
    });

    const authMode =
      body.mode && isApplyAuthMode(body.mode) ? body.mode : "login";
    const authMetadata = {
      method: "otp" as const,
      mode: authMode,
      page: "/forms/apply" as const,
    };

    void recordAuthActivity(admin, {
      organizationId,
      actorUserId: user.id,
      actorEmail: email,
      surface: "public_apply",
      action: ACTIVITY_ACTIONS.AUTH_OTP_VERIFIED,
      metadata: authMetadata,
    });

    const { data: authUserData } = await admin.auth.admin.getUserById(user.id);
    const isNewAccount =
      authMode === "create" &&
      isRecentlyCreatedAuthUser(authUserData.user?.created_at);

    void recordAuthActivity(admin, {
      organizationId,
      actorUserId: user.id,
      actorEmail: email,
      surface: "public_apply",
      action: isNewAccount
        ? ACTIVITY_ACTIONS.AUTH_ACCOUNT_CREATED
        : ACTIVITY_ACTIONS.AUTH_SIGNED_IN,
      metadata: authMetadata,
    });

    if (result.createdNewApplication && result.applicationId) {
      void logActivityEvent(admin, {
        organizationId,
        actorType: "parent",
        actorUserId: user.id,
        actorEmail: email,
        surface: "public_apply",
        action: ACTIVITY_ACTIONS.APPLICATION_STARTED,
        entityType: "application",
        entityId: result.applicationId,
        summary: `Application started${body.formTitle?.trim() ? ` for “${body.formTitle.trim()}”` : ""}`,
        metadata: {
          formVersionId,
          formTitle: body.formTitle?.trim() ?? null,
        },
      });
    }

    if (
      result.action === "resume" &&
      result.createdNewApplication &&
      body.schoolName?.trim() &&
      body.mode &&
      isApplyAuthMode(body.mode) &&
      result.applicationId
    ) {
      try {
        await notifyRootedMeadowsParentApplicationStarted({
          schoolName: body.schoolName.trim(),
          email,
          mode: body.mode,
          applicationId: result.applicationId,
          formTitle: body.formTitle,
          firstName: firstName ?? body.firstName,
          lastName: lastName ?? body.lastName,
        });
      } catch (discordError) {
        console.error("applicant-bootstrap Discord notify failed:", discordError);
        await logNotificationFailure(admin, {
          organizationId,
          operation: "parent_application_started_discord",
          entityType: "application",
          entityId: result.applicationId,
          error: discordError,
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof BootstrapApplicantError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Something went wrong. Please try again.",
      code: "internal_error",
      cause: error,
    });
  }
}
