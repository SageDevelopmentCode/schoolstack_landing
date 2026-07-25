import { NextResponse } from "next/server";
import {
  authorizeTuitionBillingCronRequest,
  runTuitionBillingCron,
} from "@/lib/tuition/billing-cron";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  if (!authorizeTuitionBillingCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const summary = await runTuitionBillingCron(admin);

  return NextResponse.json(summary);
}

export async function POST(request: Request) {
  return GET(request);
}
