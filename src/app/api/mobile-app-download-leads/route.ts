import { NextResponse } from "next/server";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { apiError } from "@/lib/api/route-errors";
import { notifyMobileAppDownloadLead } from "@/lib/discord";
import { MOBILE_APP_DOWNLOAD_DEFAULT_SOURCE_PAGE_PATH } from "@/lib/mobile-app-download/constants";
import { validateMobileAppDownloadLeadBody } from "@/lib/mobile-app-download/mobile-app-download-validation";
import {
  enforcePublicFormSubmission,
  shouldNotifyPublicFormProtectionFailure,
} from "@/lib/public-forms/enforce-public-form-submission";
import { readPublicFormHoneypot } from "@/lib/public-forms/honeypot";
import { getRequestIp } from "@/lib/public-forms/request-ip";
import { recordPublicFormSubmissionEvent } from "@/lib/public-forms/rate-limit";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/mobile-app-download-leads";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body." });
  }

  const validation = validateMobileAppDownloadLeadBody(body);
  if (!validation.ok) {
    return apiError(ROUTE, { request, status: 400, error: validation.error });
  }

  const { name, email, sourcePagePath } = validation.value;
  const resolvedSourcePagePath =
    sourcePagePath ?? MOBILE_APP_DOWNLOAD_DEFAULT_SOURCE_PAGE_PATH;

  const protection = await enforcePublicFormSubmission({
    request,
    form: "mobile_app_download",
    email,
    companyWebsite: readPublicFormHoneypot(
      body && typeof body === "object" ? (body as Record<string, unknown>) : null,
    ),
  });
  if (!protection.ok) {
    return apiError(ROUTE, {
      request,
      status: protection.status,
      error: protection.error,
      code: protection.code,
      notify: shouldNotifyPublicFormProtectionFailure(protection),
    });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("mobile_app_download_leads")
    .insert({
      name,
      email,
      platform: "android",
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

  const leadId = data.id;

  void recordPublicFormSubmissionEvent({
    form: "mobile_app_download",
    ip: getRequestIp(request),
    email,
    route: ROUTE,
    request,
  });

  try {
    await notifyMobileAppDownloadLead({
      leadId,
      name,
      email,
      sourcePagePath: resolvedSourcePagePath,
    });
  } catch (err) {
    void logNotificationFailure(admin, {
      operation: "mobile_app_download_lead_discord",
      error: err,
      metadata: { email, leadId },
    });
  }

  return NextResponse.json({ ok: true, id: leadId });
}
