import { NextResponse } from "next/server";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { apiError } from "@/lib/api/route-errors";
import { demoRequestRoleLabel } from "@/lib/demo-request-roles";
import { notifyMarketingLead } from "@/lib/discord";
import { sendCustomDemoRequestConfirmation, sendFreeToolPlanEmail } from "@/lib/emails";
import { sanitizeAttribution, type LeadAttribution } from "@/lib/marketing/attribution";
import { PARTIAL_BOOKING_DEDUPE_HOURS } from "@/lib/marketing/partial-booking-dedupe";
import {
  signPartialBookingContinuation,
  verifyPartialBookingContinuation,
} from "@/lib/marketing/partial-booking-continuation";
import { runAfterResponse } from "@/lib/next/run-after-response";
import {
  FREE_TOOL_PLAN_NAMES,
  FREE_TOOL_PLAN_PATHS,
  LEAD_ROLES,
  isFreeToolPlanId,
  normalizeWebsiteUrl,
  sanitizePlanLines,
} from "@/lib/marketing/lead-magnets";
import {
  enforcePublicFormSubmission,
  shouldNotifyPublicFormProtectionFailure,
} from "@/lib/public-forms/enforce-public-form-submission";
import { isPublicFormHoneypotTripped, readPublicFormHoneypot } from "@/lib/public-forms/honeypot";
import {
  MAX_PUBLIC_FORM_EMAIL_LENGTH,
  MAX_PUBLIC_FORM_NAME_LENGTH,
  MAX_PUBLIC_FORM_SCHOOL_NAME_FIELD_LENGTH,
  MAX_PUBLIC_FORM_SHORT_TEXT_LENGTH,
  MAX_PUBLIC_FORM_SOURCE_PAGE_PATH_LENGTH,
  exceedsMaxLength,
  fieldTooLongLabel,
} from "@/lib/public-forms/field-limits";
import { recordPublicFormSubmissionEvent } from "@/lib/public-forms/rate-limit";
import { getRequestIp } from "@/lib/public-forms/request-ip";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/marketing-leads";
const MAX_MESSAGE_LENGTH = 1000;
const MAX_DETAIL_LENGTH = 100;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_SET = new Set<string>(LEAD_ROLES);

type LeadBody = {
  magnet?: unknown;
  email?: unknown;
  name?: unknown;
  schoolName?: unknown;
  websiteUrl?: unknown;
  role?: unknown;
  message?: unknown;
  sourcePath?: unknown;
  /** Where the form was shown, e.g. "home-section", "popup:exit-intent". */
  placement?: unknown;
  toolId?: unknown;
  planLines?: unknown;
  attribution?: unknown;
  companyWebsite?: unknown;
  /** Returned on first partial_booking save; required to update the same draft. */
  partialLeadId?: unknown;
  partialLeadToken?: unknown;
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function attributionColumns(a: LeadAttribution) {
  return {
    utm_source: a.utmSource ?? null,
    utm_medium: a.utmMedium ?? null,
    utm_campaign: a.utmCampaign ?? null,
    utm_content: a.utmContent ?? null,
    utm_term: a.utmTerm ?? null,
    referrer: a.referrer ?? null,
    gclid: a.gclid ?? null,
    fbclid: a.fbclid ?? null,
    first_landing_path: a.firstLandingPath ?? null,
  };
}

function attributionSummary(a: LeadAttribution): string | null {
  const parts = [
    a.utmSource && `source: ${a.utmSource}`,
    a.utmMedium && `medium: ${a.utmMedium}`,
    a.utmCampaign && `campaign: ${a.utmCampaign}`,
    a.gclid && "Google Ads click",
    a.fbclid && "Meta ad click",
    a.referrer && `from ${a.referrer}`,
    a.firstLandingPath && `landed on ${a.firstLandingPath}`,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export async function POST(request: Request) {
  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body." });
  }

  const magnet = str(body.magnet);
  const email = str(body.email);
  const name = str(body.name);
  const schoolName = str(body.schoolName);
  const role = str(body.role);
  const message = str(body.message);
  const sourcePath = str(body.sourcePath).slice(0, MAX_PUBLIC_FORM_SOURCE_PAGE_PATH_LENGTH) || null;
  const placement = str(body.placement).slice(0, MAX_DETAIL_LENGTH) || null;
  const attribution = sanitizeAttribution(body.attribution);
  const honeypot = readPublicFormHoneypot(body as { companyWebsite?: unknown });

  if (magnet !== "custom_demo" && magnet !== "partial_booking" && magnet !== "tool_plan") {
    return apiError(ROUTE, { request, status: 400, error: "Invalid lead type." });
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    return apiError(ROUTE, { request, status: 400, error: "Please enter a valid email address." });
  }
  if (exceedsMaxLength(email, MAX_PUBLIC_FORM_EMAIL_LENGTH)) {
    return apiError(ROUTE, { request, status: 400, error: fieldTooLongLabel("Email") });
  }
  if (exceedsMaxLength(name, MAX_PUBLIC_FORM_NAME_LENGTH)) {
    return apiError(ROUTE, { request, status: 400, error: fieldTooLongLabel("Name") });
  }
  if (exceedsMaxLength(schoolName, MAX_PUBLIC_FORM_SCHOOL_NAME_FIELD_LENGTH)) {
    return apiError(ROUTE, { request, status: 400, error: fieldTooLongLabel("School name") });
  }
  if (exceedsMaxLength(message, MAX_MESSAGE_LENGTH)) {
    return apiError(ROUTE, { request, status: 400, error: fieldTooLongLabel("Message") });
  }
  if (role && !ROLE_SET.has(role)) {
    return apiError(ROUTE, { request, status: 400, error: "Invalid role." });
  }

  const admin = createAdminClient();
  const base = {
    // Stored lowercase so the booking route can match it exactly.
    email: email.toLowerCase(),
    name: name || null,
    school_name: schoolName || null,
    role: role || null,
    source_path: sourcePath,
    ...attributionColumns(attribution),
  };

  // ── Unfinished booking: saved quietly when the booking form's first step is completed. ──
  if (magnet === "partial_booking") {
    if (isPublicFormHoneypotTripped(honeypot)) {
      return apiError(ROUTE, { request, status: 400, error: "Invalid submission.", code: "honeypot", notify: false });
    }
    if (!name || !role) {
      return apiError(ROUTE, { request, status: 400, error: "Missing required fields." });
    }

    const protection = await enforcePublicFormSubmission({ request, form: "marketing_lead", email, companyWebsite: honeypot });
    if (!protection.ok) {
      return apiError(ROUTE, {
        request,
        status: protection.status,
        error: protection.error,
        code: protection.code,
        notify: shouldNotifyPublicFormProtectionFailure(protection),
      });
    }

    const partialLeadId = str(body.partialLeadId);
    const partialLeadToken = str(body.partialLeadToken);
    const since = new Date(Date.now() - PARTIAL_BOOKING_DEDUPE_HOURS * 3600_000).toISOString();
    const normalizedEmail = email.toLowerCase();
    const partialFields = {
      name: base.name,
      school_name: base.school_name,
      role: base.role,
      message: message.slice(0, MAX_MESSAGE_LENGTH) || null,
    };

    if (partialLeadId || partialLeadToken) {
      if (!partialLeadId || !partialLeadToken) {
        return apiError(ROUTE, { request, status: 400, error: "Invalid submission.", code: "partial_booking_continuation" });
      }
      if (!verifyPartialBookingContinuation(partialLeadId, email, partialLeadToken)) {
        return apiError(ROUTE, { request, status: 400, error: "Invalid submission.", code: "partial_booking_continuation" });
      }

      const { data: draft, error: draftError } = await admin
        .from("marketing_leads")
        .select("id, email, magnet, status, created_at")
        .eq("id", partialLeadId)
        .maybeSingle();
      if (draftError) {
        return apiError(ROUTE, { request, status: 500, error: "An unexpected error occurred.", cause: draftError });
      }
      if (
        !draft ||
        draft.magnet !== "partial_booking" ||
        draft.status !== "new" ||
        draft.email !== normalizedEmail ||
        draft.created_at < since
      ) {
        return apiError(ROUTE, { request, status: 400, error: "Invalid submission.", code: "partial_booking_continuation" });
      }

      const { error: updateError } = await admin.from("marketing_leads").update(partialFields).eq("id", draft.id);
      if (updateError) {
        return apiError(ROUTE, { request, status: 500, error: "An unexpected error occurred.", cause: updateError });
      }
      void recordPublicFormSubmissionEvent({ form: "marketing_lead", ip: getRequestIp(request), email, route: ROUTE, request });
      return NextResponse.json({ ok: true });
    }

    const { data: existing, error: lookupError } = await admin
      .from("marketing_leads")
      .select("id")
      .eq("magnet", "partial_booking")
      .eq("email", normalizedEmail)
      .eq("status", "new")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lookupError) {
      return apiError(ROUTE, { request, status: 500, error: "An unexpected error occurred.", cause: lookupError });
    }
    if (existing) {
      return NextResponse.json({ ok: true });
    }

    const { data: partialRow, error } = await admin
      .from("marketing_leads")
      .insert({
        ...base,
        message: message.slice(0, MAX_MESSAGE_LENGTH) || null,
        magnet: "partial_booking",
        magnet_detail: placement,
      })
      .select("id")
      .single();
    if (error || !partialRow) {
      return apiError(ROUTE, { request, status: 500, error: "An unexpected error occurred.", cause: error });
    }

    let partialLeadTokenOut: string;
    try {
      partialLeadTokenOut = signPartialBookingContinuation(partialRow.id, email);
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "An unexpected error occurred.",
        code: "partial_booking_signing_unconfigured",
        cause: err,
      });
    }

    void recordPublicFormSubmissionEvent({ form: "marketing_lead", ip: getRequestIp(request), email, route: ROUTE, request });

    // One alert per person per day: continuation updates never notify.
    runAfterResponse(async () => {
      try {
        await notifyMarketingLead({
          leadId: partialRow.id,
          magnet: "partial_booking",
          magnetDetail: placement,
          name,
          email,
          schoolName,
          roleLabel: demoRequestRoleLabel(role),
          message,
          sourcePath,
          attributionSummary: attributionSummary(attribution),
        });
      } catch (err) {
        void logNotificationFailure(admin, { operation: "marketing_lead_discord", error: err, metadata: { email, magnet } });
      }
    });
    return NextResponse.json({
      ok: true,
      partialLeadId: partialRow.id,
      partialLeadToken: partialLeadTokenOut,
    });
  }

  // ── Custom demo request and free tool plan: both notify and email. ──
  let websiteUrl: string | null = null;
  let toolId: string | null = null;
  let planLines: string[] = [];

  if (magnet === "custom_demo") {
    const rawWebsite = str(body.websiteUrl);
    if (!name || !schoolName) {
      return apiError(ROUTE, { request, status: 400, error: "Please fill in your name and school." });
    }
    // The website is optional; a typed one still has to be readable.
    if (rawWebsite) {
      if (exceedsMaxLength(rawWebsite, MAX_PUBLIC_FORM_SHORT_TEXT_LENGTH)) {
        return apiError(ROUTE, { request, status: 400, error: fieldTooLongLabel("Website") });
      }
      websiteUrl = normalizeWebsiteUrl(rawWebsite);
      if (!websiteUrl) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "That doesn't look like a website. Try yourschool.com, or leave it blank.",
        });
      }
    }
  } else {
    if (!isFreeToolPlanId(body.toolId)) {
      return apiError(ROUTE, { request, status: 400, error: "Invalid tool." });
    }
    toolId = body.toolId;
    planLines = sanitizePlanLines(body.planLines);
    if (!planLines.some((l) => l.trim())) {
      return apiError(ROUTE, { request, status: 400, error: "There are no results to send yet." });
    }
  }

  const protection = await enforcePublicFormSubmission({ request, form: "marketing_lead", email, companyWebsite: honeypot });
  if (!protection.ok) {
    return apiError(ROUTE, {
      request,
      status: protection.status,
      error: protection.error,
      code: protection.code,
      notify: shouldNotifyPublicFormProtectionFailure(protection),
    });
  }

  const magnetDetail = magnet === "tool_plan" ? toolId : placement;
  const { data: inserted, error: insertError } = await admin
    .from("marketing_leads")
    .insert({
      ...base,
      website_url: websiteUrl,
      message: message || null,
      magnet,
      magnet_detail: magnetDetail,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return apiError(ROUTE, { request, status: 500, error: "An unexpected error occurred.", cause: insertError });
  }

  void recordPublicFormSubmissionEvent({ form: "marketing_lead", ip: getRequestIp(request), email, route: ROUTE, request });

  runAfterResponse(async () => {
    try {
      await notifyMarketingLead({
        leadId: inserted.id,
        magnet,
        magnetDetail: magnet === "tool_plan" && toolId ? FREE_TOOL_PLAN_NAMES[toolId as keyof typeof FREE_TOOL_PLAN_NAMES] : magnetDetail,
        name,
        email,
        schoolName,
        websiteUrl,
        roleLabel: role ? demoRequestRoleLabel(role) : null,
        message,
        sourcePath,
        attributionSummary: attributionSummary(attribution),
      });
    } catch (err) {
      void logNotificationFailure(admin, { operation: "marketing_lead_discord", error: err, metadata: { email, magnet } });
    }
  });

  if (magnet === "custom_demo") {
    try {
      await sendCustomDemoRequestConfirmation({ name, email, schoolName, websiteUrl });
    } catch (err) {
      void logNotificationFailure(admin, {
        operation: "custom_demo_request_confirmation_email",
        error: err,
        metadata: { email, schoolName },
      });
    }
    return NextResponse.json({ ok: true });
  }

  const tool = toolId as keyof typeof FREE_TOOL_PLAN_NAMES;
  let sent = false;
  try {
    sent = await sendFreeToolPlanEmail({
      name: name || null,
      email,
      toolName: FREE_TOOL_PLAN_NAMES[tool],
      toolPath: FREE_TOOL_PLAN_PATHS[tool],
      lines: planLines,
    });
  } catch (err) {
    void logNotificationFailure(admin, { operation: "free_tool_plan_email", error: err, metadata: { email, toolId } });
    return apiError(ROUTE, {
      request,
      status: 502,
      error: "We couldn't send the email right now. Please try again in a moment.",
      notify: true,
      cause: err,
    });
  }

  if (!sent) {
    return apiError(ROUTE, {
      request,
      status: 502,
      error: "We couldn't send the email right now. Please try again in a moment.",
      notify: true,
    });
  }
  return NextResponse.json({ ok: true });
}
