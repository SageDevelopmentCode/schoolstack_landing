import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { notifyParentPortalFeedback } from "@/lib/discord";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/parent-portal/feedback";
const MAX_MESSAGE_LENGTH = 5000;

const ALLOWED_FEEDBACK_TYPES = new Set([
  "feature_request",
  "feedback",
  "bug",
]);

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

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in to submit feedback.",
      code: "unauthorized",
    });
  }

  let body: ParentPortalFeedbackBody;

  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  const schoolSlug = body.schoolSlug?.trim() ?? "";
  const schoolName = body.schoolName?.trim() ?? "";
  const featureKey = body.featureKey?.trim() ?? "";
  const featureLabel = body.featureLabel?.trim() ?? "";
  const feedbackType = body.feedbackType?.trim() || "feature_request";
  const message = body.message?.trim() ?? "";
  const pagePath = body.pagePath?.trim() || null;

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

  const hasEnrolledAccess = await userHasEnrolledAccess(
    supabase,
    user.id,
    organizationId,
  );

  if (!hasEnrolledAccess) {
    return apiError(ROUTE, {
      request,
      status: 403,
      error: "You do not have access to submit feedback for this school.",
      code: "forbidden",
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
      error: error.message,
      cause: error,
    });
  }

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
    console.error("Discord notification error:", err);
  }

  return NextResponse.json({ ok: true });
}
