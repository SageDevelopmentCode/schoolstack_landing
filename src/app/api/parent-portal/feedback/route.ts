import { NextResponse } from "next/server";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { apiError } from "@/lib/api/route-errors";
import { notifyParentPortalFeedback } from "@/lib/discord";
import {
  enforceUserFormRateLimit,
  recordUserFormSubmission,
} from "@/lib/public-forms/enforce-user-form-submission";
import { createAdminClient } from "@/utils/supabase/admin";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";

const ROUTE = "/api/parent-portal/feedback";
const MAX_MESSAGE_LENGTH = 5000;
const MAX_SHORT_FIELD_LENGTH = 200;
const MAX_PAGE_PATH_LENGTH = 500;

const ALLOWED_FEEDBACK_TYPES = new Set(["feature_request", "feedback", "bug"]);

interface ParentPortalFeedbackBody {
  organizationId?: string;
  schoolSlug?: string;
  schoolName?: string;
  featureKey?: string;
  featureLabel?: string;
  feedbackType?: string;
  message?: string;
  pagePath?: string;
}

export const POST = withParentPortalRoute<ParentPortalFeedbackBody>(
  {
    route: ROUTE,
    organizationFrom: "body",
    forbiddenMessage:
      "You do not have access to submit feedback for this school.",
    missingOrganizationMessage: "Missing required fields.",
    fallbackErrorMessage: "An unexpected error occurred.",
  },
  async ({ request, supabase, user, organizationId, body }) => {
    // Non-strings become "" (so required fields fail validation) and long values are capped.
    const readString = (value: unknown, maxLength: number): string =>
      typeof value === "string" ? value.trim().slice(0, maxLength) : "";

    const schoolSlug = readString(body.schoolSlug, MAX_SHORT_FIELD_LENGTH);
    const schoolName = readString(body.schoolName, MAX_SHORT_FIELD_LENGTH);
    const featureKey = readString(body.featureKey, MAX_SHORT_FIELD_LENGTH);
    const featureLabel = readString(body.featureLabel, MAX_SHORT_FIELD_LENGTH);
    const feedbackType = readString(body.feedbackType, 50) || "feature_request";
    // Not capped here: over-length messages get a 400 below instead of being cut off silently.
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const pagePath = readString(body.pagePath, MAX_PAGE_PATH_LENGTH) || null;

    if (
      !organizationId ||
      !schoolSlug ||
      !schoolName ||
      !featureKey ||
      !featureLabel ||
      !message
    ) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Missing required fields.",
        code: "missing_fields",
      });
    }

    if (!ALLOWED_FEEDBACK_TYPES.has(feedbackType)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid feedback type.",
        code: "invalid_feedback_type",
      });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Message is too long.",
        code: "message_too_long",
      });
    }

    const rateLimit = await enforceUserFormRateLimit({
      form: "parent_portal_feedback",
      email: user.email,
    });
    if (!rateLimit.ok) {
      return apiError(ROUTE, {
        request,
        status: rateLimit.status,
        error: rateLimit.error,
        code: rateLimit.code,
      });
    }

    const submitterName =
      (typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name.trim()
        : "") ||
      (typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name.trim()
        : "") ||
      null;
    const submitterEmail = user.email?.trim() || null;

    const { error } = await supabase.from("parent_portal_feedback").insert({
      organization_id: organizationId,
      school_slug: schoolSlug,
      school_name: schoolName,
      user_id: user.id,
      submitter_name: submitterName,
      submitter_email: submitterEmail,
      feature_key: featureKey,
      feature_label: featureLabel,
      feedback_type: feedbackType,
      message,
      page_path: pagePath,
    });

    if (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "An unexpected error occurred.",
        cause: error,
      });
    }

    void recordUserFormSubmission({
      form: "parent_portal_feedback",
      email: user.email,
      route: ROUTE,
      request,
    });

    try {
      await notifyParentPortalFeedback({
        schoolSlug,
        schoolName,
        organizationId,
        submitterName,
        submitterEmail,
        featureKey,
        featureLabel,
        feedbackType,
        message,
        pagePath,
      });
    } catch (err) {
      void logNotificationFailure(createAdminClient(), {
        organizationId,
        operation: "parent_portal_feedback_discord",
        error: err,
        metadata: { schoolSlug, featureKey },
      });
    }

    return NextResponse.json({ ok: true });
  },
);
