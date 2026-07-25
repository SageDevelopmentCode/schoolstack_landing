import { NextResponse } from "next/server";
import { markOverdueCharges } from "@/lib/tuition/charge-generator";
import { processAutopayForOrganization } from "@/lib/tuition/autopay";
import { sendTuitionDueReminders } from "@/lib/tuition/reminders";
import { evaluateRulesForOrganization } from "@/lib/tuition/rules-engine";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/cron/tuition-billing";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: organizations, error } = await admin
    .from("organizations")
    .select("id")
    .eq("status", "live");

  if (error) throw error;

  let overdueCount = 0;
  let remindersSent = 0;
  let rulesEvaluated = 0;
  let autopayProcessed = 0;
  let autopayFailed = 0;

  for (const organization of organizations ?? []) {
    const organizationId = String(organization.id);
    overdueCount += await markOverdueCharges(admin, organizationId, 5);
    remindersSent += await sendTuitionDueReminders(admin, organizationId, 3);
    rulesEvaluated += await evaluateRulesForOrganization(admin, organizationId);

    const autopayResult = await processAutopayForOrganization(admin, organizationId);
    autopayProcessed += autopayResult.processed;
    autopayFailed += autopayResult.failed;
  }

  return NextResponse.json({
    organizations: organizations?.length ?? 0,
    overdueCount,
    remindersSent,
    rulesEvaluated,
    autopayProcessed,
    autopayFailed,
  });
}

export async function POST(request: Request) {
  return GET(request);
}
