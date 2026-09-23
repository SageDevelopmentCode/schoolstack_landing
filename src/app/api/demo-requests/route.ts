import { NextResponse } from "next/server";
import { schoolDemoRegistry } from "@/data/school-demos";
import { isPastDate } from "@/lib/demo-scheduler";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { apiError } from "@/lib/api/route-errors";
import { notifyDemoBooking } from "@/lib/discord";
import { sendDemoBookingConfirmation } from "@/lib/emails";
import { enforcePublicFormSubmission } from "@/lib/public-forms/enforce-public-form-submission";
import {
  exceedsMaxLength,
  fieldTooLongLabel,
  MAX_PUBLIC_FORM_EMAIL_LENGTH,
  MAX_PUBLIC_FORM_NAME_LENGTH,
  MAX_PUBLIC_FORM_SCHEDULED_TIME_LENGTH,
  MAX_PUBLIC_FORM_SCHOOL_NAME_FIELD_LENGTH,
  MAX_PUBLIC_FORM_SHORT_TEXT_LENGTH,
} from "@/lib/public-forms/field-limits";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/demo-requests";

const VALID_ROLES = new Set([
  "starting",
  "running",
  "private",
  "program",
  "other",
]);

const VALID_PRIORITIES = new Set([
  "enrollment",
  "communication",
  "billing",
  "admissions",
  "operations",
  "full",
]);

interface DemoRequestBody {
  name?: string;
  email?: string;
  schoolName?: string;
  role?: string;
  launchTimeline?: string | null;
  studentCount?: string | null;
  currentSystems?: string;
  priorities?: string[];
  websiteUrl?: string;
  currentTools?: string;
  prepNotes?: string;
  conceptDemoSlug?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  turnstileToken?: string;
}

export async function POST(request: Request) {
  let body: DemoRequestBody;

  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body." });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const schoolName = body.schoolName?.trim() ?? "";
  const role = body.role?.trim() ?? "";
  const priorities = Array.isArray(body.priorities) ? body.priorities : [];
  const scheduledDate = body.scheduledDate?.trim() ?? "";
  const scheduledTime = body.scheduledTime?.trim() ?? "";

  if (!name || !email || !schoolName || !role || !scheduledDate || !scheduledTime) {
    return apiError(ROUTE, { request, status: 400, error: "Missing required fields." });
  }

  if (exceedsMaxLength(name, MAX_PUBLIC_FORM_NAME_LENGTH)) {
    return apiError(ROUTE, { request, status: 400, error: fieldTooLongLabel("Name") });
  }

  if (exceedsMaxLength(email, MAX_PUBLIC_FORM_EMAIL_LENGTH)) {
    return apiError(ROUTE, { request, status: 400, error: fieldTooLongLabel("Email") });
  }

  if (exceedsMaxLength(schoolName, MAX_PUBLIC_FORM_SCHOOL_NAME_FIELD_LENGTH)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: fieldTooLongLabel("School name"),
    });
  }

  if (exceedsMaxLength(scheduledTime, MAX_PUBLIC_FORM_SCHEDULED_TIME_LENGTH)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: fieldTooLongLabel("Scheduled time"),
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return apiError(ROUTE, { request, status: 400, error: "Invalid email address." });
  }

  if (!VALID_ROLES.has(role)) {
    return apiError(ROUTE, { request, status: 400, error: "Invalid role." });
  }

  if (priorities.length === 0 || !priorities.every((p) => VALID_PRIORITIES.has(p))) {
    return apiError(ROUTE, { request, status: 400, error: "Invalid priorities." });
  }

  const launchTimeline = body.launchTimeline?.trim() || null;
  const studentCount = body.studentCount?.trim() || null;
  const currentSystems = body.currentSystems?.trim() ?? "";
  const websiteUrl = body.websiteUrl?.trim() ?? "";
  const currentTools = body.currentTools?.trim() ?? "";
  const prepNotes = body.prepNotes?.trim() ?? "";
  const conceptDemoSlug = body.conceptDemoSlug?.trim() || null;

  if (exceedsMaxLength(currentSystems, MAX_PUBLIC_FORM_SHORT_TEXT_LENGTH)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: fieldTooLongLabel("Current systems"),
    });
  }

  if (exceedsMaxLength(websiteUrl, MAX_PUBLIC_FORM_SHORT_TEXT_LENGTH)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: fieldTooLongLabel("Website URL"),
    });
  }

  if (exceedsMaxLength(currentTools, MAX_PUBLIC_FORM_SHORT_TEXT_LENGTH)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: fieldTooLongLabel("Current tools"),
    });
  }

  if (exceedsMaxLength(prepNotes, MAX_PUBLIC_FORM_SHORT_TEXT_LENGTH)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: fieldTooLongLabel("Prep notes"),
    });
  }

  if (conceptDemoSlug && !schoolDemoRegistry[conceptDemoSlug]) {
    return apiError(ROUTE, { request, status: 400, error: "Invalid concept demo." });
  }

  if (isPastDate(scheduledDate)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Cannot book a date in the past.",
    });
  }

  const protection = await enforcePublicFormSubmission({
    request,
    form: "demo_request",
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

  const { data: slotRow, error: slotError } = await admin
    .from("demo_availability_slots")
    .select("id")
    .eq("date", scheduledDate)
    .eq("time_slot", scheduledTime)
    .maybeSingle();

  if (slotError) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "An unexpected error occurred.",
      cause: slotError,
    });
  }

  if (!slotRow) {
    return apiError(ROUTE, {
      request,
      status: 409,
      error: "That time slot is no longer available.",
    });
  }

  const { data: existingBooking, error: bookingCheckError } = await admin
    .from("demo_requests")
    .select("id")
    .eq("scheduled_date", scheduledDate)
    .eq("scheduled_time", scheduledTime)
    .eq("status", "scheduled")
    .maybeSingle();

  if (bookingCheckError) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "An unexpected error occurred.",
      cause: bookingCheckError,
    });
  }

  if (existingBooking) {
    return apiError(ROUTE, {
      request,
      status: 409,
      error: "That time slot has already been booked.",
    });
  }

  const { error } = await admin.from("demo_requests").insert({
    name,
    email,
    school_name: schoolName,
    role,
    launch_timeline: launchTimeline,
    student_count: studentCount,
    current_systems: currentSystems,
    priorities,
    website_url: websiteUrl,
    current_tools: currentTools,
    prep_notes: prepNotes,
    scheduled_date: scheduledDate,
    scheduled_time: scheduledTime,
  });

  if (error) {
    if (error.code === "23505") {
      return apiError(ROUTE, {
        request,
        status: 409,
        error: "That time slot has already been booked.",
      });
    }
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "An unexpected error occurred.",
      cause: error,
    });
  }

  try {
    await notifyDemoBooking({
      name,
      email,
      schoolName,
      role,
      launchTimeline,
      studentCount,
      currentSystems,
      priorities,
      websiteUrl,
      currentTools,
      prepNotes,
      conceptDemoSlug,
      scheduledDate,
      scheduledTime,
    });
  } catch (err) {
    void logNotificationFailure(admin, {
      operation: "demo_booking_discord",
      error: err,
      metadata: { email, schoolName },
    });
  }

  try {
    await sendDemoBookingConfirmation({
      name,
      email,
      schoolName,
      scheduledDate,
      scheduledTime,
    });
  } catch (err) {
    void logNotificationFailure(admin, {
      operation: "demo_booking_confirmation_email",
      error: err,
      metadata: { email, schoolName },
    });
  }

  return NextResponse.json({ ok: true });
}
