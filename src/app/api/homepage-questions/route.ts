import { NextResponse } from "next/server";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { apiError } from "@/lib/api/route-errors";
import { notifyHomepageQuestion } from "@/lib/discord";
import { sendHomepageQuestionConfirmation } from "@/lib/emails";
import { enforcePublicFormSubmission } from "@/lib/public-forms/enforce-public-form-submission";
import {
  exceedsMaxLength,
  fieldTooLongLabel,
  MAX_PUBLIC_FORM_EMAIL_LENGTH,
  MAX_PUBLIC_FORM_MESSAGE_LENGTH,
  MAX_PUBLIC_FORM_NAME_LENGTH,
} from "@/lib/public-forms/field-limits";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/homepage-questions";
const HOMEPAGE_SLUG = "homepage";
const HOMEPAGE_NAME = "MudKitchen Homepage";
const SOURCE = "floating-widget";

interface HomepageQuestionBody {
  name?: string;
  email?: string;
  message?: string;
  turnstileToken?: string;
}

export async function POST(request: Request) {
  let body: HomepageQuestionBody;

  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body." });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !message) {
    return apiError(ROUTE, { request, status: 400, error: "Missing required fields." });
  }

  if (exceedsMaxLength(name, MAX_PUBLIC_FORM_NAME_LENGTH)) {
    return apiError(ROUTE, { request, status: 400, error: fieldTooLongLabel("Name") });
  }

  if (exceedsMaxLength(email, MAX_PUBLIC_FORM_EMAIL_LENGTH)) {
    return apiError(ROUTE, { request, status: 400, error: fieldTooLongLabel("Email") });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return apiError(ROUTE, { request, status: 400, error: "Invalid email address." });
  }

  if (exceedsMaxLength(message, MAX_PUBLIC_FORM_MESSAGE_LENGTH)) {
    return apiError(ROUTE, { request, status: 400, error: "Message is too long." });
  }

  const protection = await enforcePublicFormSubmission({
    request,
    form: "homepage_question",
    email,
    turnstileToken: body.turnstileToken,
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

  const { error } = await admin.from("demo_feedback").insert({
    school_slug: HOMEPAGE_SLUG,
    school_name: HOMEPAGE_NAME,
    name,
    email,
    message,
    source: SOURCE,
  });

  if (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "An unexpected error occurred.",
      cause: error,
    });
  }

  try {
    await notifyHomepageQuestion({ name, email, message });
  } catch (err) {
    void logNotificationFailure(admin, {
      operation: "homepage_question_discord",
      error: err,
      metadata: { email },
    });
  }

  try {
    await sendHomepageQuestionConfirmation({ name, email });
  } catch (err) {
    void logNotificationFailure(admin, {
      operation: "homepage_question_confirmation_email",
      error: err,
      metadata: { email },
    });
  }

  return NextResponse.json({ ok: true });
}
