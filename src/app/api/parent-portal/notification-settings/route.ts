import { NextResponse } from "next/server";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import { logParentPortalActivity } from "@/lib/parent-portal/parent-portal-activity";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { normalizeNotificationEmails } from "@/lib/notifications/family-notification-email-constants";
import {
  getFamilyNotificationEmailSettings,
  updateFamilyNotificationEmails,
} from "@/lib/notifications/family-notification-emails";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/notification-settings";
const FORBIDDEN_MESSAGE =
  "You do not have access to notification settings for this school.";

type PatchBody = {
  organizationId?: string;
  emails?: string[];
};

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    forbiddenMessage: FORBIDDEN_MESSAGE,
    fallbackErrorMessage: "Failed to load notification settings.",
  },
  async ({ request, user, familyId }) => {
    try {
      if (!familyId) {
        return apiError(ROUTE, {
          request,
          status: 403,
          error: FORBIDDEN_MESSAGE,
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
  },
);

export const PATCH = withParentPortalRoute<PatchBody>(
  {
    route: ROUTE,
    organizationFrom: "body",
    forbiddenMessage: FORBIDDEN_MESSAGE,
    fallbackErrorMessage: "Failed to update notification settings.",
  },
  async ({ request, user, organizationId, familyId, body }) => {
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

    if (!familyId) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: FORBIDDEN_MESSAGE,
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
        summary:
          normalized.emails.length === 0
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
  },
);
