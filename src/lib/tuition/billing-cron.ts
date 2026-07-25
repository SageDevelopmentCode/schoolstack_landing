import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyTuitionBillingCronSummary } from "@/lib/discord";
import { markOverdueCharges } from "@/lib/tuition/charge-generator";
import { processAutopayForOrganization } from "@/lib/tuition/autopay";
import { sendTuitionDueReminders } from "@/lib/tuition/reminders";
import { evaluateRulesForOrganization } from "@/lib/tuition/rules-engine";

export type TuitionBillingCronSummary = {
  organizations: number;
  overdueCount: number;
  remindersSent: number;
  rulesEvaluated: number;
  autopayProcessed: number;
  autopayFailed: number;
};

export type TuitionBillingCronDeps = {
  listLiveOrganizationIds?: (admin: SupabaseClient) => Promise<string[]>;
  markOverdueCharges?: typeof markOverdueCharges;
  sendTuitionDueReminders?: typeof sendTuitionDueReminders;
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
  const markOverdue = deps.markOverdueCharges ?? markOverdueCharges;
  const sendReminders = deps.sendTuitionDueReminders ?? sendTuitionDueReminders;
  const evaluateRules = deps.evaluateRulesForOrganization ?? evaluateRulesForOrganization;
  const processAutopay = deps.processAutopayForOrganization ?? processAutopayForOrganization;
  const notifySummary = deps.notifySummary ?? notifyTuitionBillingCronSummary;

  const organizationIds = await listLiveOrganizationIds(admin);

  let overdueCount = 0;
  let remindersSent = 0;
  let rulesEvaluated = 0;
  let autopayProcessed = 0;
  let autopayFailed = 0;

  for (const organizationId of organizationIds) {
    overdueCount += await markOverdue(admin, organizationId, 5);
    remindersSent += await sendReminders(admin, organizationId, 3);
    rulesEvaluated += await evaluateRules(admin, organizationId);

    const autopayResult = await processAutopay(admin, organizationId);
    autopayProcessed += autopayResult.processed;
    autopayFailed += autopayResult.failed;
  }

  const summary: TuitionBillingCronSummary = {
    organizations: organizationIds.length,
    overdueCount,
    remindersSent,
    rulesEvaluated,
    autopayProcessed,
    autopayFailed,
  };

  try {
    await notifySummary(summary);
  } catch (error) {
    console.error("Tuition billing cron Discord notification failed:", error);
  }

  return summary;
}
