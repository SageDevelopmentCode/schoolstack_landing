import { NextResponse } from "next/server";
import { schoolDemoRegistry } from "@/data/school-demos";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { apiError } from "@/lib/api/route-errors";
import { notifyDemoFeedback } from "@/lib/discord";
import { sendDemoFeedbackConfirmation } from "@/lib/emails";
import { enforcePublicFormSubmission } from "@/lib/public-forms/enforce-public-form-submission";
import {
  exceedsMaxLength,
  fieldTooLongLabel,
  MAX_PUBLIC_FORM_EMAIL_LENGTH,
  MAX_PUBLIC_FORM_MESSAGE_LENGTH,
  MAX_PUBLIC_FORM_NAME_LENGTH,
  MAX_PUBLIC_FORM_SCHOOL_NAME_LENGTH,
  MAX_PUBLIC_FORM_SCHOOL_SLUG_LENGTH,
  MAX_PUBLIC_FORM_SOURCE_LENGTH,
} from "@/lib/public-forms/field-limits";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/demo-feedback";

interface DemoFeedbackBody {
  schoolSlug?: string;
  schoolName?: string;
  name?: string;
  email?: string;
  message?: string;
  source?: string;
  turnstileToken?: string;
}

export async function POST(request: Request) {
  let body: DemoFeedbackBody;

  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body." });
  }

  const schoolSlug = body.schoolSlug?.trim() ?? "";
  const schoolName = body.schoolName?.trim() ?? "";
  const name = body.name?.trim() || null;
  const email = body.email?.trim() || null;
  const message = body.message?.trim() ?? "";

  if (!schoolSlug || !schoolName || !message) {
    return apiError(ROUTE, { request, status: 400, error: "Missing required fields." });
  }

  if (exceedsMaxLength(schoolSlug, MAX_PUBLIC_FORM_SCHOOL_SLUG_LENGTH)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: fieldTooLongLabel("School slug"),
    });
  }

  if (exceedsMaxLength(schoolName, MAX_PUBLIC_FORM_SCHOOL_NAME_LENGTH)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: fieldTooLongLabel("School name"),
    });
  }

  if (name && exceedsMaxLength(name, MAX_PUBLIC_FORM_NAME_LENGTH)) {
    return apiError(ROUTE, { request, status: 400, error: fieldTooLongLabel("Name") });
  }

  if (email && exceedsMaxLength(email, MAX_PUBLIC_FORM_EMAIL_LENGTH)) {
    return apiError(ROUTE, { request, status: 400, error: fieldTooLongLabel("Email") });
  }

  if (!schoolDemoRegistry[schoolSlug]) {
    return apiError(ROUTE, { request, status: 400, error: "Invalid school." });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return apiError(ROUTE, { request, status: 400, error: "Invalid email address." });
  }

  if (exceedsMaxLength(message, MAX_PUBLIC_FORM_MESSAGE_LENGTH)) {
    return apiError(ROUTE, { request, status: 400, error: "Message is too long." });
  }

  const isPrototypeWalkthrough = !name && !email;
  const source =
    body.source?.trim() ||
    (isPrototypeWalkthrough ? "prototype-walkthrough" : "demo-walkthrough");

  if (exceedsMaxLength(source, MAX_PUBLIC_FORM_SOURCE_LENGTH)) {
    return apiError(ROUTE, { request, status: 400, error: fieldTooLongLabel("Source") });
  }

  const protection = await enforcePublicFormSubmission({
    request,
    form: "demo_feedback",
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
    school_slug: schoolSlug,
    school_name: schoolName,
    name,
    email,
    message,
    source,
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
    await notifyDemoFeedback({
      schoolSlug,
      schoolName,
      name,
      email,
      message,
      source,
    });
  } catch (err) {
    void logNotificationFailure(admin, {
      operation: "demo_feedback_discord",
      error: err,
      metadata: { schoolSlug },
    });
  }

  if (name && email) {
    try {
      await sendDemoFeedbackConfirmation({ name, email, schoolName });
    } catch (err) {
      void logNotificationFailure(admin, {
        operation: "demo_feedback_confirmation_email",
        error: err,
        metadata: { schoolSlug, email },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
