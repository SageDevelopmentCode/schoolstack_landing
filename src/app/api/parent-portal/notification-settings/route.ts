import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import { logParentPortalActivity } from "@/lib/parent-portal/parent-portal-activity";
import { normalizeNotificationEmails } from "@/lib/notifications/family-notification-email-constants";
import {
  getFamilyNotificationEmailSettings,
  updateFamilyNotificationEmails,
} from "@/lib/notifications/family-notification-emails";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/notification-settings";

type PatchBody = {
  organizationId?: string;
  emails?: string[];
};

async function resolveAuthorizedFamily(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<string | null> {
  const hasEnrolledAccess = await userHasEnrolledAccess(
    supabase,
    userId,
    organizationId,
  );
  if (!hasEnrolledAccess) return null;

  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  return familyIds[0] ?? null;
}

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);

  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
      code: "unauthorized",
    });
  }

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const familyId = await resolveAuthorizedFamily(
      supabase,
      user.id,
      organizationId,
    );

    if (!familyId) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to notification settings for this school.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const settings = await getFamilyNotificationEmailSettings(admin, {
      familyId,
      loginEmail: user.email?.trim() ?? null,
    });

    return NextResponse.json({
      familyId,
      ...settings,
    });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load notification settings.",
      cause: error,
      code: "internal_error",
    });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClientFromRequest(request);

  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
      code: "unauthorized",
    });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  if (!Array.isArray(body.emails)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "emails must be an array.",
      code: "invalid_body",
    });
  }

  const normalized = normalizeNotificationEmails(body.emails);
  if (normalized.error) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: normalized.error,
      code: "invalid_emails",
    });
  }

  const familyId = await resolveAuthorizedFamily(
    supabase,
    user.id,
    organizationId,
  );

  if (!familyId) {
    return apiError(ROUTE, {
      request,
      status: 403,
      error: "You do not have access to notification settings for this school.",
      code: "forbidden",
    });
  }

  const admin = createAdminClient();

  try {
    await updateFamilyNotificationEmails(admin, familyId, normalized.emails);

    const { data: family } = await admin
      .from("families")
      .select("name")
      .eq("id", familyId)
      .maybeSingle();
    const familyName =
      typeof family?.name === "string" ? family.name.trim() : null;

    void logParentPortalActivity(admin, {
      organizationId,
      actorUserId: user.id,
      actorEmail: user.email ?? null,
      action: ACTIVITY_ACTIONS.PARENT_NOTIFICATION_SETTINGS_UPDATED,
      summary: normalized.emails.length === 0
        ? "Reset notification email settings"
        : "Updated notification email settings",
      entityType: "family",
      entityId: familyId,
      metadata: {
        familyId,
        familyName,
        emailCount: normalized.emails.length,
      },
      request,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update notification settings.";
    const isValidationError =
      message.includes("valid email") ||
      message.includes("Family not found") ||
      message.includes("required");
    return apiError(ROUTE, {
      request,
      status: isValidationError ? 400 : 500,
      error: message,
      code: isValidationError ? "update_failed" : "internal_error",
      cause: error,
    });
  }

  const settings = await getFamilyNotificationEmailSettings(admin, {
    familyId,
    loginEmail: user.email?.trim() ?? null,
  });

  return NextResponse.json({
    familyId,
    ...settings,
  });
}
