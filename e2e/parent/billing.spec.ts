import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { regenerateFutureCharges } from "../../src/lib/tuition/charge-generator";
import { TEST_ORG_SLUG } from "../helpers/constants";
import {
  getE2eParentFamily,
  gotoBillingPage,
  resetFamilyBillingState,
  waitForBillingPage,
} from "../helpers/billing-fixtures";
import { getSeedManifest } from "../helpers/seed-manifest";

test.describe.configure({ mode: "serial" });

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
  const family = await getE2eParentFamily(admin, organizationId);
  await resetFamilyBillingState(admin, family.id);

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
      family_id: family.id,
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
      family_id: family.id,
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

  await gotoBillingPage(page);
  await expect(page.getByText("Upcoming charges")).toBeVisible();
  await expect(page.getByText(/Tuition/)).toHaveCount(5);
});

test("parent billing page shows readiness guidance when charges are missing", async ({
  page,
}) => {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const organizationId = manifest.organizationId;
  const family = await getE2eParentFamily(admin, organizationId);
  await resetFamilyBillingState(admin, family.id);

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
      family_id: family.id,
      first_name: "Readiness",
      last_name: "Parent",
      status: "active",
    })
    .select("id")
    .single();

  await admin.from("enrollments").insert({
    organization_id: organizationId,
    student_id: student!.id,
    program_id: program!.id,
    status: "enrolled",
  });

  await gotoBillingPage(page);
  await expect(page.getByTestId("parent-billing-readiness")).toBeVisible();
  await expect(
    page.getByText(/Tuition has not been assigned yet|Choose your payment schedule/i),
  ).toBeVisible();
});

test("parent billing page lets family choose payment schedule inline", async ({
  page,
}) => {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const organizationId = manifest.organizationId;
  const family = await getE2eParentFamily(admin, organizationId);
  await resetFamilyBillingState(admin, family.id);

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
      family_id: family.id,
      first_name: "Schedule",
      last_name: "Picker",
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
      name: "Parent Schedule Picker E2E",
      billing_basis: "annual",
      amount_cents: 720000,
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
      amount_cents: 720000,
      sort_order: 0,
      is_default: true,
    })
    .select("id")
    .single();

  const { data: paymentPlans } = await admin
    .from("tuition_payment_plans")
    .insert([
      {
        organization_id: organizationId,
        rate_plan_id: ratePlan!.id,
        name: "10 payments",
        installment_count: 10,
        installment_amount_cents: 72000,
        billing_day_of_month: 1,
        is_default: true,
      },
      {
        organization_id: organizationId,
        rate_plan_id: ratePlan!.id,
        name: "Pay in full",
        installment_count: 1,
        installment_amount_cents: 720000,
        billing_day_of_month: 1,
        is_default: false,
      },
    ])
    .select("id, installment_count");

  const defaultPlanId = String(
    paymentPlans!.find((plan) => plan.installment_count === 10)!.id,
  );

  await admin.from("tuition_enrollment_assignments").insert({
    organization_id: organizationId,
    enrollment_id: enrollment!.id,
    family_id: family.id,
    rate_plan_id: ratePlan!.id,
    rate_tier_id: tier!.id,
    payment_plan_id: defaultPlanId,
    assignment_source: "default",
    status: "active",
    metadata: { pendingPaymentPlanSelection: true },
    effective_start: "2026-08-01",
  });

  await gotoBillingPage(page);
  await expect(page.getByTestId("parent-billing-schedule-warning")).toBeVisible();
  await expect(
    page.getByText("Action needed: choose a payment schedule"),
  ).toBeVisible();
  await expect(page.getByTestId("parent-billing-needs-schedule-badge")).toBeVisible();
  await expect(page.getByTestId("parent-tuition-plan-selector")).toBeVisible();
  await expect(page.getByText("Pay in full")).toBeVisible();
  await page.getByText("Pay in full").click();
  await page.getByRole("button", { name: "Confirm payment schedule" }).click();

  await expect(page.getByText("Upcoming charges")).toBeVisible();
  await expect(page.getByText(/Tuition/)).toHaveCount(1);
});

test("parent billing page uses child tabs for multiple pending schedules", async ({
  page,
}) => {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const organizationId = manifest.organizationId;
  const family = await getE2eParentFamily(admin, organizationId);
  await resetFamilyBillingState(admin, family.id);

  const { data: program } = await admin
    .from("programs")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  const { data: ratePlan } = await admin
    .from("tuition_rate_plans")
    .insert({
      organization_id: organizationId,
      program_id: program!.id,
      name: "Multi Child Billing E2E",
      billing_basis: "annual",
      amount_cents: 720000,
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
      amount_cents: 720000,
      sort_order: 0,
      is_default: true,
    })
    .select("id")
    .single();

  const { data: paymentPlans } = await admin
    .from("tuition_payment_plans")
    .insert([
      {
        organization_id: organizationId,
        rate_plan_id: ratePlan!.id,
        name: "10 payments",
        installment_count: 10,
        installment_amount_cents: 72000,
        billing_day_of_month: 1,
        is_default: true,
      },
      {
        organization_id: organizationId,
        rate_plan_id: ratePlan!.id,
        name: "Pay in full",
        installment_count: 1,
        installment_amount_cents: 720000,
        billing_day_of_month: 1,
        is_default: false,
      },
    ])
    .select("id, installment_count");

  const defaultPlanId = String(
    paymentPlans!.find((plan) => plan.installment_count === 10)!.id,
  );

  for (const [firstName, lastName] of [
    ["Julia", "Tabs"],
    ["Caleb", "Tabs"],
  ] as const) {
    const { data: student } = await admin
      .from("students")
      .insert({
        organization_id: organizationId,
        family_id: family.id,
        first_name: firstName,
        last_name: lastName,
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

    await admin.from("tuition_enrollment_assignments").insert({
      organization_id: organizationId,
      enrollment_id: enrollment!.id,
      family_id: family.id,
      rate_plan_id: ratePlan!.id,
      rate_tier_id: tier!.id,
      payment_plan_id: defaultPlanId,
      assignment_source: "default",
      status: "active",
      metadata: { pendingPaymentPlanSelection: true },
      effective_start: "2026-08-01",
    });
  }

  await gotoBillingPage(page);
  await expect(page.getByTestId("parent-billing-schedule-warning")).toBeVisible();
  await expect(
    page.getByText("Action needed: choose payment schedules (2 children)"),
  ).toBeVisible();
  await expect(page.getByTestId("parent-billing-summary")).toBeVisible();
  await expect(page.getByText("Estimated annual tuition")).toBeVisible();
  await expect(page.getByTestId("parent-billing-child-tabs")).toBeVisible();
  await expect(
    page.getByTestId("parent-billing-summary").getByTestId("parent-billing-needs-schedule-badge"),
  ).toHaveCount(2);
  await expect(
    page.getByTestId("parent-billing-child-tabs").getByTestId("parent-billing-needs-schedule-badge"),
  ).toHaveCount(2);
  await expect(page.getByTestId("parent-tuition-plan-selector")).toHaveCount(1);
  await expect(page.getByRole("tab", { name: /Julia/ })).toBeVisible();
  await expect(page.getByRole("tab", { name: /Caleb/ })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Julia's payment schedule" }),
  ).toBeVisible();

  await page.getByTestId("parent-schedule-preview-button").click();
  await expect(page.getByTestId("parent-schedule-preview-modal")).toBeVisible();
  await expect(page.getByText("Installment timeline")).toBeVisible();
  await expect(page.getByText("Estimated due dates")).toBeVisible();
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByTestId("parent-schedule-preview-modal")).not.toBeVisible();

  await page.getByRole("tab", { name: /Caleb/ }).click();
  await expect(page.getByTestId("parent-tuition-plan-selector")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Caleb's payment schedule" }),
  ).toBeVisible();
  await expect(page.getByText("Annual tuition $7,200")).toBeVisible();
});

test("parent billing page shows per-charge adjustment breakdown", async ({ page }) => {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const organizationId = manifest.organizationId;
  const family = await getE2eParentFamily(admin, organizationId);
  await resetFamilyBillingState(admin, family.id);

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
      family_id: family.id,
      first_name: "Adjusted",
      last_name: "Billing",
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
      name: "Adjustment E2E",
      billing_basis: "annual",
      amount_cents: 720000,
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
      amount_cents: 720000,
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
      name: "10 payments",
      installment_count: 10,
      installment_amount_cents: 72000,
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
      family_id: family.id,
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

  await admin.from("tuition_adjustments").insert({
    organization_id: organizationId,
    assignment_id: assignment!.id,
    adjustment_type: "percent_discount",
    value_percent: 10,
    reason: "Sibling discount",
    scope: "installment",
    source: "manual",
    status: "active",
    priority: 0,
  });

  await regenerateFutureCharges(admin, String(assignment!.id));

  await gotoBillingPage(page);
  const breakdown = page.getByTestId("parent-billing-charge-breakdown").first();
  await expect(breakdown).toBeVisible();
  await expect(page.getByText(/sibling discount/i).first()).toBeVisible();
  await expect(breakdown.getByText("Base amount")).toBeVisible();
  await expect(breakdown.getByText("You pay")).toBeVisible();
  await expect(page.getByText("$648").first()).toBeVisible();
});

test("parent billing deep link highlights the target charge", async ({ page }) => {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const organizationId = manifest.organizationId;
  const family = await getE2eParentFamily(admin, organizationId);
  await resetFamilyBillingState(admin, family.id);

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
      family_id: family.id,
      first_name: "DeepLink",
      last_name: "Billing",
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
      name: "Deep Link E2E",
      billing_basis: "annual",
      amount_cents: 720000,
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
      amount_cents: 720000,
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
      name: "10 payments",
      installment_count: 10,
      installment_amount_cents: 72000,
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
      family_id: family.id,
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

  const generated = await regenerateFutureCharges(admin, String(assignment!.id));
  const chargeId = generated[0]?.id;
  expect(chargeId).toBeTruthy();

  await page.goto(`/school/${TEST_ORG_SLUG}/parent/billing?charge=${chargeId}`);
  await waitForBillingPage(page);
  await expect(page.getByTestId("parent-billing-charge-row").first()).toBeVisible();
  await expect(
    page.locator(`[data-charge-id="${chargeId}"]`).first(),
  ).toBeVisible();
});

test("parent billing summary supports per-student pay and child drill-down", async ({
  page,
}) => {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const organizationId = manifest.organizationId;
  const family = await getE2eParentFamily(admin, organizationId);
  await resetFamilyBillingState(admin, family.id);

  const { data: program } = await admin
    .from("programs")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  const { data: ratePlan } = await admin
    .from("tuition_rate_plans")
    .insert({
      organization_id: organizationId,
      program_id: program!.id,
      name: "Multi Child Pay E2E",
      billing_basis: "annual",
      amount_cents: 720000,
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
      amount_cents: 720000,
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
      name: "10 payments",
      installment_count: 10,
      installment_amount_cents: 72000,
      billing_day_of_month: 1,
      is_default: true,
    })
    .select("id")
    .single();

  const enrollmentIds: string[] = [];

  for (const [firstName, lastName] of [
    ["Julia", "Summary"],
    ["Caleb", "Summary"],
  ] as const) {
    const { data: student } = await admin
      .from("students")
      .insert({
        organization_id: organizationId,
        family_id: family.id,
        first_name: firstName,
        last_name: lastName,
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

    enrollmentIds.push(String(enrollment!.id));

    const { data: assignment } = await admin
      .from("tuition_enrollment_assignments")
      .insert({
        organization_id: organizationId,
        enrollment_id: enrollment!.id,
        family_id: family.id,
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
  }

  await gotoBillingPage(page);
  await expect(page.getByTestId("parent-billing-summary")).toBeVisible();
  await expect(page.getByTestId("parent-billing-multi-charge-hint")).toBeVisible();
  await expect(
    page.getByTestId("parent-billing-family-pay-now"),
  ).toHaveText(/Pay combined/);
  await expect(
    page.getByTestId(`parent-billing-child-pay-${enrollmentIds[0]}`),
  ).toBeVisible();
  await expect(
    page.getByTestId(`parent-billing-child-pay-${enrollmentIds[1]}`),
  ).toBeVisible();

  await page
    .getByTestId(`parent-billing-child-summary-select-${enrollmentIds[1]}`)
    .click();
  await expect(page.getByTestId("parent-billing-child-detail-modal")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Caleb/ })).toBeVisible();
  await page.getByLabel("Close").first().click();
  await expect(page.getByTestId("parent-billing-child-detail-modal")).toHaveCount(0);

  await page.getByTestId("parent-billing-family-pay-now").click();
  await expect(page.getByRole("heading", { name: "How would you like to pay?" })).toBeVisible();
  await expect(page.getByText(/Combined tuition \(2 students\)/)).toBeVisible();
  await expect(page.getByText(/\$4,320/)).toBeVisible();

  await page
    .getByTestId(`parent-billing-child-pay-${enrollmentIds[0]}`)
    .click();
  await expect(page.getByRole("heading", { name: "How would you like to pay?" })).toBeVisible();
});
