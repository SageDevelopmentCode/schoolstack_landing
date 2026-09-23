import { NextResponse } from "next/server";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { apiError } from "@/lib/api/route-errors";
import { notifyPublicSupportRequest } from "@/lib/discord";
import { sendPublicSupportRequestConfirmation } from "@/lib/emails";
import { enforcePublicFormSubmission } from "@/lib/public-forms/enforce-public-form-submission";
import { validatePublicSupportRequestBody } from "@/lib/public-support/public-support-validation";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/public-support-requests";
const DEFAULT_SOURCE_PAGE_PATH = "/support";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body." });
  }

  const validation = validatePublicSupportRequestBody(body);
  if (!validation.ok) {
    return apiError(ROUTE, { request, status: 400, error: validation.error });
  }

  const { name, email, topic, message, sourcePagePath, turnstileToken } =
    validation.value;
  const resolvedSourcePagePath = sourcePagePath ?? DEFAULT_SOURCE_PAGE_PATH;

  const protection = await enforcePublicFormSubmission({
    request,
    form: "public_support",
    email,
    turnstileToken,
  });
  if (!protection.ok) {
    return apiError(ROUTE, {
      request,
      status: protection.status,
      error: protection.error,
      code: protection.code,
      notify: false,
    });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("public_support_requests")
    .insert({
      submitter_name: name,
      submitter_email: email,
      topic,
      description: message,
      source_page_path: resolvedSourcePagePath,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "An unexpected error occurred.",
      cause: error,
    });
  }

  const requestId = data.id;

  try {
    await notifyPublicSupportRequest({
      requestId,
      submitterName: name,
      submitterEmail: email,
      topic,
      description: message,
      sourcePagePath: resolvedSourcePagePath,
    });
  } catch (err) {
    void logNotificationFailure(admin, {
      operation: "public_support_request_discord",
      error: err,
      metadata: { email, requestId },
    });
  }

  try {
    await sendPublicSupportRequestConfirmation({ name, email });
  } catch (err) {
    void logNotificationFailure(admin, {
      operation: "public_support_request_confirmation_email",
      error: err,
      metadata: { email, requestId },
    });
  }

  return NextResponse.json({ ok: true, id: requestId });
}
