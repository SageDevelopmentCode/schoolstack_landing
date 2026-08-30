import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  buildOrganizationNotificationRecipients,
  maybeMigrateApplicationNotificationEmails,
  parseOrganizationNotificationSettings,
  resolveOrganizationAdminEmails,
  validateOrganizationNotificationSettings,
  type OrganizationNotificationSettings,
} from "@/lib/notifications/org-notification-settings";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/notifications/settings";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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
    await requireSchoolAdminUser(supabase, organizationId, request);

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("organization_settings")
      .select("notifications")
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: error.message,
        cause: error,
      });
    }

    let settings = parseOrganizationNotificationSettings(
      data?.notifications as Record<string, unknown> | null | undefined,
    );

    if (data) {
      settings = await maybeMigrateApplicationNotificationEmails(
        admin,
        organizationId,
        settings,
      );
    }

    const orgAdminEmails = await resolveOrganizationAdminEmails(
      admin,
      organizationId,
    );
    const recipients = buildOrganizationNotificationRecipients(
      settings,
      orgAdminEmails,
    );

    return NextResponse.json({ settings, recipients });
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
      error: "Failed to load notification settings.",
      code: "internal_error",
      cause: err,
    });
  }
}

function parsePatchBody(
  body: unknown,
): OrganizationNotificationSettings | null {
  if (!body || typeof body !== "object") return null;
  return parseOrganizationNotificationSettings(body as Record<string, unknown>);
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const organizationId =
    typeof record?.organizationId === "string"
      ? record.organizationId.trim()
      : "";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  const settings = parsePatchBody(record?.settings);
  if (!settings) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid notification settings.",
      code: "invalid_body",
    });
  }

  const validationError = validateOrganizationNotificationSettings(settings);
  if (validationError) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: validationError,
      code: "invalid_settings",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);

    const admin = createAdminClient();
    const { data: existing, error: existingError } = await admin
      .from("organization_settings")
      .select("organization_id")
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (existingError) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: existingError.message,
        cause: existingError,
      });
    }

    if (existing) {
      const { error: updateError } = await admin
        .from("organization_settings")
        .update({ notifications: settings })
        .eq("organization_id", organizationId);

      if (updateError) {
        return apiError(ROUTE, {
          request,
          status: 500,
          error: updateError.message,
          cause: updateError,
        });
      }
    } else {
      const { error: insertError } = await admin.from("organization_settings").insert({
        organization_id: organizationId,
        notifications: settings,
      });

      if (insertError) {
        return apiError(ROUTE, {
          request,
          status: 500,
          error: insertError.message,
          cause: insertError,
        });
      }
    }

    const orgAdminEmails = await resolveOrganizationAdminEmails(
      admin,
      organizationId,
    );
    const recipients = buildOrganizationNotificationRecipients(
      settings,
      orgAdminEmails,
    );

    return NextResponse.json({ settings, recipients });
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
      error: "Failed to save notification settings.",
      code: "internal_error",
      cause: err,
    });
  }
}
