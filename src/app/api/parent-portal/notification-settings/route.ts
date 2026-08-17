import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { apiError } from "@/lib/api/route-errors";
import { normalizeNotificationEmails } from "@/lib/notifications/family-notification-email-constants";
import {
  getFamilyNotificationEmailSettings,
  updateFamilyNotificationEmails,
} from "@/lib/notifications/family-notification-emails";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/parent-portal/notification-settings";

type PatchBody = {
  organizationId?: string;
  emails?: string[];
};

async function resolveAuthorizedFamily(
  supabase: ReturnType<typeof createClient>,
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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in to view notification settings.",
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
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in to update notification settings.",
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
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update notification settings.",
      code: "update_failed",
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
