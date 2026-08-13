import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyTuitionBillingCronSummary } from "@/lib/discord";
import { markOverdueCharges } from "@/lib/tuition/charge-generator";
import { processAutopayForOrganization } from "@/lib/tuition/autopay";
import {
  applyLateFeesForOrganization,
  getGraceDaysForSettings,
  getReminderDaysForSettings,
} from "@/lib/tuition/late-fees";
import { getTuitionOrgSettings } from "@/lib/tuition/org-settings";
import {
  ACTIVITY_ACTIONS,
  logTuitionActivity,
  summarizeBillingRunSummary,
  systemActivityContext,
} from "@/lib/tuition/tuition-activity";
import {
  AUTOPAY_LINES_GLOBAL_CAP,
  mergeAutopayLines,
  type AutopayLineItem,
} from "@/lib/tuition/autopay-cron-report";
import { sendTuitionDueReminders } from "@/lib/tuition/reminders";
import { evaluateRulesForOrganization } from "@/lib/tuition/rules-engine";

export type TuitionBillingCronSummary = {
  organizations: number;
  overdueCount: number;
  remindersSent: number;
  rulesEvaluated: number;
  lateFeesApplied: number;
  lateFeesNotified: number;
  autopayProcessed: number;
  autopayFailed: number;
  autopaySkipped: number;
  autopayDueCandidates: number;
  autopayLines: AutopayLineItem[];
  autopayLinesTruncated: boolean;
};

export type TuitionBillingCronDeps = {
  listLiveOrganizationIds?: (admin: SupabaseClient) => Promise<string[]>;
  getTuitionOrgSettings?: typeof getTuitionOrgSettings;
  markOverdueCharges?: typeof markOverdueCharges;
  sendTuitionDueReminders?: typeof sendTuitionDueReminders;
  applyLateFeesForOrganization?: typeof applyLateFeesForOrganization;
  evaluateRulesForOrganization?: typeof evaluateRulesForOrganization;
  processAutopayForOrganization?: typeof processAutopayForOrganization;
  notifySummary?: typeof notifyTuitionBillingCronSummary;
};

export function authorizeTuitionBillingCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

async function defaultListLiveOrganizationIds(
  admin: SupabaseClient,
): Promise<string[]> {
  const { data: organizations, error } = await admin
    .from("organizations")
    .select("id")
    .eq("status", "live");

  if (error) throw error;
  return (organizations ?? []).map((organization) => String(organization.id));
}

export async function runTuitionBillingCron(
  admin: SupabaseClient,
  deps: TuitionBillingCronDeps = {},
): Promise<TuitionBillingCronSummary> {
  const listLiveOrganizationIds =
    deps.listLiveOrganizationIds ?? defaultListLiveOrganizationIds;
  const loadSettings = deps.getTuitionOrgSettings ?? getTuitionOrgSettings;
  const markOverdue = deps.markOverdueCharges ?? markOverdueCharges;
  const sendReminders = deps.sendTuitionDueReminders ?? sendTuitionDueReminders;
  const applyLateFees =
    deps.applyLateFeesForOrganization ?? applyLateFeesForOrganization;
  const evaluateRules = deps.evaluateRulesForOrganization ?? evaluateRulesForOrganization;
  const processAutopay = deps.processAutopayForOrganization ?? processAutopayForOrganization;
  const notifySummary = deps.notifySummary ?? notifyTuitionBillingCronSummary;

  const organizationIds = await listLiveOrganizationIds(admin);

  let overdueCount = 0;
  let remindersSent = 0;
  let rulesEvaluated = 0;
  let lateFeesApplied = 0;
  let lateFeesNotified = 0;
  let autopayProcessed = 0;
  let autopayFailed = 0;
  let autopaySkipped = 0;
  let autopayDueCandidates = 0;
  let autopayLines: AutopayLineItem[] = [];
  let autopayLinesTruncated = false;

  for (const organizationId of organizationIds) {
    const settings = await loadSettings(admin, organizationId);
    const graceDays = getGraceDaysForSettings(settings);
    const reminderDaysList = getReminderDaysForSettings(settings);

    const orgOverdue = await markOverdue(admin, organizationId, graceDays);
    overdueCount += orgOverdue;

    let orgReminders = 0;
    for (const reminderDays of reminderDaysList) {
      const sent = await sendReminders(admin, organizationId, reminderDays);
      orgReminders += sent;
      remindersSent += sent;
    }

    const orgRules = await evaluateRules(admin, organizationId);
    rulesEvaluated += orgRules;

    const lateFeeResult = await applyLateFees(admin, organizationId);
    lateFeesApplied += lateFeeResult.applied;
    lateFeesNotified += lateFeeResult.notified;

    const autopayResult = await processAutopay(admin, organizationId);
    autopayProcessed += autopayResult.processed;
    autopayFailed += autopayResult.failed;
    autopaySkipped += autopayResult.skipped;
    autopayDueCandidates += autopayResult.dueCandidates;
    const merged = mergeAutopayLines(autopayLines, autopayResult.lines, AUTOPAY_LINES_GLOBAL_CAP);
    autopayLines = merged.lines;
    autopayLinesTruncated =
      autopayLinesTruncated || autopayResult.truncated || merged.truncated;

    void logTuitionActivity(admin, {
      organizationId,
      action: ACTIVITY_ACTIONS.TUITION_BILLING_RUN_COMPLETED,
      entityType: "organization",
      entityId: organizationId,
      summary: "Tuition billing run completed",
      changeSummary: summarizeBillingRunSummary({
        overdueCount: orgOverdue,
        remindersSent: orgReminders,
        rulesEvaluated: orgRules,
        lateFeesApplied: lateFeeResult.applied,
        lateFeesNotified: lateFeeResult.notified,
        autopayProcessed: autopayResult.processed,
        autopayFailed: autopayResult.failed,
        autopaySkipped: autopayResult.skipped,
      }),
      logWhenEmpty: true,
      context: systemActivityContext(),
    });

    if (lateFeeResult.applied > 0) {
      void logTuitionActivity(admin, {
        organizationId,
        action: ACTIVITY_ACTIONS.TUITION_LATE_FEE_APPLIED,
        entityType: "organization",
        entityId: organizationId,
        summary: `Applied ${lateFeeResult.applied} late fee${lateFeeResult.applied === 1 ? "" : "s"}`,
        changeSummary: {
          changedFields: ["lateFees"],
          changes: [
            `Applied ${lateFeeResult.applied} late fee${lateFeeResult.applied === 1 ? "" : "s"}`,
          ],
        },
        logWhenEmpty: true,
        context: systemActivityContext(),
      });
    }
  }

  const summary: TuitionBillingCronSummary = {
    organizations: organizationIds.length,
    overdueCount,
    remindersSent,
    rulesEvaluated,
    lateFeesApplied,
    lateFeesNotified,
    autopayProcessed,
    autopayFailed,
    autopaySkipped,
    autopayDueCandidates,
    autopayLines,
    autopayLinesTruncated,
  };

  try {
    await notifySummary(summary);
  } catch (error) {
    console.error("Tuition billing cron Discord notification failed:", error);
  }

  return summary;
}
