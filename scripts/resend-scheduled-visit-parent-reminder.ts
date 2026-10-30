/**
 * Resend a scheduled-visit parent reminder (day-before or day-of) for one visit.
 *
 * Usage:
 *   SCHEDULED_VISIT_ID=00dac712-e491-4b69-8041-9a281b698410 \
 *   npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-scheduled-visit-parent-reminder.ts
 *
 * Dry run (no send, no DB claim):
 *   DRY_RUN=1 SCHEDULED_VISIT_ID=... npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-scheduled-visit-parent-reminder.ts
 *
 * Day-of reminder:
 *   REMINDER_KIND=day_of SCHEDULED_VISIT_ID=... DRY_RUN=0 npx tsx ...
 */

import { resolve } from "node:path";
import { config } from "dotenv";

import {
  assertNoLocalhostInOutboundHtml,
  ensureProductionSiteUrlForOutboundEmail,
  logOutboundEmailSiteUrl,
} from "./lib/outbound-email-production-site";

config({ path: resolve(process.cwd(), ".env.local") });

const SCRIPT_PREFIX = "resend-scheduled-visit-parent-reminder";

function log(message: string) {
  console.log(`[${SCRIPT_PREFIX}] ${message}`);
}

function isDryRun(): boolean {
  const value = process.env.DRY_RUN?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function isZohoReady(): boolean {
  const disabled =
    process.env.DISABLE_OUTBOUND_EMAIL === "1" ||
    process.env.DISABLE_OUTBOUND_EMAIL === "true";
  if (disabled) return false;

  return !!(
    process.env.ZOHO_CLIENT_ID &&
    process.env.ZOHO_CLIENT_SECRET &&
    process.env.ZOHO_REDIRECT_URI &&
    process.env.ZOHO_REFRESH_TOKEN
  );
}

function parseReminderKind(): "day_before" | "day_of" {
  const raw = process.env.REMINDER_KIND?.trim().toLowerCase();
  if (raw === "day_of" || raw === "day-of") return "day_of";
  return "day_before";
}

async function main() {
  ensureProductionSiteUrlForOutboundEmail();
  logOutboundEmailSiteUrl(SCRIPT_PREFIX);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error(`[${SCRIPT_PREFIX}] Supabase credentials not configured in .env.local`);
    process.exit(1);
  }

  const visitId = process.env.SCHEDULED_VISIT_ID?.trim();
  if (!visitId) {
    console.error(`[${SCRIPT_PREFIX}] SCHEDULED_VISIT_ID is required`);
    process.exit(1);
  }

  const kind = parseReminderKind();
  const dryRun = isDryRun();

  if (dryRun) {
    log("DRY_RUN enabled — will not send email or update reminder timestamps");
  } else if (!isZohoReady()) {
    console.error(`[${SCRIPT_PREFIX}] Zoho email is not configured — cannot send`);
    process.exit(1);
  }

  const { createAdminClient } = await import("@/utils/supabase/admin");
  const { sendScheduledVisitParentReminderForVisit } = await import(
    "@/lib/admissions/scheduled-visit-reminders"
  );
  const { buildScheduledVisitDayBeforeReminderHtml, buildScheduledVisitDayOfReminderHtml } =
    await import("@/lib/emails");
  const { getOrganizationTimezone, formatOrganizationTimezoneLabel } = await import(
    "@/lib/admissions/admissions-availability"
  );
  const { formatDurationLabel } = await import("@/lib/admissions/admissions-availability");
  const { loadSchoolProfileBundle } = await import(
    "@/lib/school-admin/school-profile/load-school-profile"
  );
  const { buildSchoolVisitEmailDetailRows } = await import(
    "@/lib/school-admin/school-profile/school-visit-email-details"
  );

  const admin = createAdminClient();

  const { data: visitMeta } = await admin
    .from("admissions_scheduled_visits")
    .select("organization_id, duration_minutes")
    .eq("id", visitId)
    .maybeSingle();

  if (!visitMeta?.organization_id) {
    console.error(`[${SCRIPT_PREFIX}] Visit not found: ${visitId}`);
    process.exit(1);
  }

  const { data: org } = await admin
    .from("organizations")
    .select("name")
    .eq("id", visitMeta.organization_id)
    .maybeSingle();

  const timezone = await getOrganizationTimezone(admin, String(visitMeta.organization_id));
  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);
  const bundle = await loadSchoolProfileBundle(admin, String(visitMeta.organization_id));
  const locationDetails = buildSchoolVisitEmailDetailRows(bundle);
  const durationLabel = formatDurationLabel(Number(visitMeta.duration_minutes ?? 0));

  const sampleHtml =
    kind === "day_before"
      ? buildScheduledVisitDayBeforeReminderHtml({
          name: "Family",
          schoolName: String(org?.name ?? "School"),
          stepTitle: "Visit",
          whenLabel: "Tomorrow",
          timezoneLabel,
          durationLabel,
          locationDetails,
        })
      : buildScheduledVisitDayOfReminderHtml({
          name: "Family",
          schoolName: String(org?.name ?? "School"),
          stepTitle: "Visit",
          whenLabel: "Today",
          timezoneLabel,
          durationLabel,
          locationDetails,
        });

  assertNoLocalhostInOutboundHtml(sampleHtml);

  const result = await sendScheduledVisitParentReminderForVisit(admin, {
    visitId,
    kind,
    dryRun,
  });

  log(`Visit: ${visitId}`);
  log(`Kind: ${kind}`);
  log(`Step: ${result.stepTitle ?? "(unknown)"}`);
  log(`When: ${result.whenLabel ?? "(unknown)"}`);
  log(`Recipients: ${result.recipients.map((r) => `${r.name} <${r.email}>`).join(", ") || "(none)"}`);

  if (!result.ok) {
    console.error(`[${SCRIPT_PREFIX}] Failed: ${result.error ?? "unknown error"}`);
    process.exit(1);
  }

  if (dryRun) {
    log("Dry run complete — no email sent");
    return;
  }

  log("Reminder sent successfully");
}

main().catch((error) => {
  console.error(`[${SCRIPT_PREFIX}]`, error);
  process.exit(1);
});
