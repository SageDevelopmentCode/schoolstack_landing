import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  authorizeTuitionBillingCronRequest,
  runTuitionBillingCron,
} from "@/lib/tuition/billing-cron";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/cron/tuition-billing";

export async function GET(request: Request) {
  if (!authorizeTuitionBillingCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  try {
    const summary = await runTuitionBillingCron(admin);
    return NextResponse.json(summary);
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Tuition billing cron failed",
      cause: error,
    });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
