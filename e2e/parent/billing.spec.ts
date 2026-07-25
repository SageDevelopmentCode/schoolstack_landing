import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { regenerateFutureCharges } from "../../src/lib/tuition/charge-generator";
import { E2E_PARENT_EMAIL } from "../fixtures/constants";
import { TEST_ORG_SLUG } from "../helpers/constants";
import { getSeedManifest } from "../helpers/seed-manifest";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase admin credentials for e2e tests.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws as never },
  });
}

test("parent billing page shows generated tuition charges", async ({ page }) => {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const organizationId = manifest.organizationId;

  const { data: family } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("primary_email", E2E_PARENT_EMAIL)
    .maybeSingle();

  expect(family?.id).toBeTruthy();

  const { data: program } = await admin
    .from("programs")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  const { data: student } = await admin
    .from("students")
    .insert({
      organization_id: organizationId,
      family_id: family!.id,
      first_name: "Billing",
      last_name: "Portal",
      status: "active",
    })
    .select("id")
    .single();

  const { data: enrollment } = await admin
    .from("enrollments")
    .insert({
      organization_id: organizationId,
      student_id: student!.id,
      program_id: program!.id,
      status: "enrolled",
    })
    .select("id")
    .single();

  const { data: ratePlan } = await admin
    .from("tuition_rate_plans")
    .insert({
      organization_id: organizationId,
      program_id: program!.id,
      name: "Parent Billing E2E",
      billing_basis: "annual",
      amount_cents: 500000,
      status: "active",
      effective_start: "2026-08-01",
      effective_end: "2027-05-31",
    })
    .select("id")
    .single();

  const { data: tier } = await admin
    .from("tuition_rate_tiers")
    .insert({
      organization_id: organizationId,
      rate_plan_id: ratePlan!.id,
      code: "standard",
      label: "Standard",
      amount_cents: 500000,
      sort_order: 0,
      is_default: true,
    })
    .select("id")
    .single();

  const { data: paymentPlan } = await admin
    .from("tuition_payment_plans")
    .insert({
      organization_id: organizationId,
      rate_plan_id: ratePlan!.id,
      name: "5 payments",
      installment_count: 5,
      installment_amount_cents: 100000,
      billing_day_of_month: 1,
      is_default: true,
    })
    .select("id")
    .single();

  const { data: assignment } = await admin
    .from("tuition_enrollment_assignments")
    .insert({
      organization_id: organizationId,
      enrollment_id: enrollment!.id,
      family_id: family!.id,
      rate_plan_id: ratePlan!.id,
      rate_tier_id: tier!.id,
      payment_plan_id: paymentPlan!.id,
      assignment_source: "default",
      status: "active",
      metadata: { pendingPaymentPlanSelection: false },
      effective_start: "2026-08-01",
    })
    .select("id")
    .single();

  await regenerateFutureCharges(admin, String(assignment!.id));

  await page.goto(`/school/${TEST_ORG_SLUG}/parent/billing`);
  await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
  await expect(page.getByText("Upcoming charges")).toBeVisible();
  await expect(page.getByText(/Tuition/)).toHaveCount(5);
});
