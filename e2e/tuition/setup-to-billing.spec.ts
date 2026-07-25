import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { computeInstallmentAmountCents } from "../../src/lib/tuition/assignments";
import { regenerateFutureCharges } from "../../src/lib/tuition/charge-generator";
import { AUTH_STATE_PATHS } from "../fixtures/constants";
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

test("tuition assignment PATCH requires admin", async ({ playwright, baseURL }) => {
  const context = await playwright.request.newContext({
    baseURL,
    storageState: AUTH_STATE_PATHS.nonAdmin,
  });

  const response = await context.patch(
    "/api/tuition/assignments/00000000-0000-0000-0000-000000000099",
    {
      data: { paymentPlanId: "00000000-0000-0000-0000-000000000001" },
    },
  );

  expect(response.status()).toBe(403);
  await context.dispose();
});

test("tier-aware charges are generated after payment plan selection", async () => {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const organizationId = manifest.organizationId;

  const { data: program, error: programError } = await admin
    .from("programs")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  expect(programError).toBeNull();
  expect(program?.id).toBeTruthy();
  const programId = String(program!.id);

  const { data: family, error: familyError } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  expect(familyError).toBeNull();
  expect(family?.id).toBeTruthy();
  const familyId = String(family!.id);

  const { data: student, error: studentError } = await admin
    .from("students")
    .insert({
      organization_id: organizationId,
      family_id: familyId,
      first_name: "Tuition",
      last_name: "E2E",
      status: "active",
    })
    .select("id")
    .single();

  expect(studentError).toBeNull();

  const { data: enrollment, error: enrollmentError } = await admin
    .from("enrollments")
    .insert({
      organization_id: organizationId,
      student_id: student!.id,
      program_id: programId,
      status: "enrolled",
    })
    .select("id")
    .single();

  expect(enrollmentError).toBeNull();
  const enrollmentId = String(enrollment!.id);

  const { data: ratePlan, error: ratePlanError } = await admin
    .from("tuition_rate_plans")
    .insert({
      organization_id: organizationId,
      program_id: programId,
      name: "E2E Tuition Plan",
      billing_basis: "annual",
      amount_cents: 720000,
      status: "active",
      effective_start: "2026-08-01",
      effective_end: "2027-05-31",
    })
    .select("id")
    .single();

  expect(ratePlanError).toBeNull();
  const ratePlanId = String(ratePlan!.id);

  const { data: tiers, error: tiersError } = await admin
    .from("tuition_rate_tiers")
    .insert([
      {
        organization_id: organizationId,
        rate_plan_id: ratePlanId,
        code: "standard",
        label: "Standard",
        amount_cents: 720000,
        sort_order: 0,
        is_default: true,
      },
      {
        organization_id: organizationId,
        rate_plan_id: ratePlanId,
        code: "reduced",
        label: "Reduced",
        amount_cents: 600000,
        sort_order: 1,
        is_default: false,
      },
    ])
    .select("id, code");

  expect(tiersError).toBeNull();
  const reducedTierId = String(tiers!.find((tier) => tier.code === "reduced")!.id);

  const { data: paymentPlans, error: paymentPlansError } = await admin
    .from("tuition_payment_plans")
    .insert([
      {
        organization_id: organizationId,
        rate_plan_id: ratePlanId,
        name: "10 payments",
        installment_count: 10,
        installment_amount_cents: 72000,
        billing_day_of_month: 1,
        is_default: true,
      },
      {
        organization_id: organizationId,
        rate_plan_id: ratePlanId,
        name: "Pay in full",
        installment_count: 1,
        installment_amount_cents: 720000,
        billing_day_of_month: 1,
        is_default: false,
      },
    ])
    .select("id, installment_count");

  expect(paymentPlansError).toBeNull();
  const tenPayPlanId = String(
    paymentPlans!.find((plan) => plan.installment_count === 10)!.id,
  );

  const { data: assignment, error: assignmentError } = await admin
    .from("tuition_enrollment_assignments")
    .insert({
      organization_id: organizationId,
      enrollment_id: enrollmentId,
      family_id: familyId,
      rate_plan_id: ratePlanId,
      rate_tier_id: reducedTierId,
      payment_plan_id: tenPayPlanId,
      assignment_source: "default",
      status: "active",
      metadata: { pendingPaymentPlanSelection: false },
      effective_start: "2026-08-01",
    })
    .select("id")
    .single();

  expect(assignmentError).toBeNull();
  const assignmentId = String(assignment!.id);

  const charges = await regenerateFutureCharges(admin, assignmentId);
  const tuitionCharges = charges.filter((charge) => charge.chargeType === "tuition");

  expect(tuitionCharges.length).toBe(10);
  expect(tuitionCharges[0]?.baseAmountCents).toBe(
    computeInstallmentAmountCents(600000, 10),
  );
});

test("enrollment payment plan selection generates charges", async ({ playwright, baseURL }) => {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const organizationId = manifest.organizationId;

  const { data: program } = await admin
    .from("programs")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  const { data: family } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("primary_email", E2E_PARENT_EMAIL)
    .maybeSingle();

  expect(program?.id).toBeTruthy();
  expect(family?.id).toBeTruthy();

  const { data: student } = await admin
    .from("students")
    .insert({
      organization_id: organizationId,
      family_id: family!.id,
      first_name: "Plan",
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
      name: "Plan Picker Tuition",
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

  const payInFullPlanId = String(
    paymentPlans!.find((plan) => plan.installment_count === 1)!.id,
  );

  const { data: assignment } = await admin
    .from("tuition_enrollment_assignments")
    .insert({
      organization_id: organizationId,
      enrollment_id: enrollment!.id,
      family_id: family!.id,
      rate_plan_id: ratePlan!.id,
      rate_tier_id: tier!.id,
      payment_plan_id: paymentPlans![0]!.id,
      assignment_source: "default",
      status: "active",
      metadata: { pendingPaymentPlanSelection: true },
      effective_start: "2026-08-01",
    })
    .select("id")
    .single();

  const parentContext = await playwright.request.newContext({
    baseURL,
    storageState: AUTH_STATE_PATHS.parent,
  });

  const response = await parentContext.post(
    `/api/tuition/enrollments/${enrollment!.id}/payment-plan`,
    { data: { paymentPlanId: payInFullPlanId } },
  );

  expect(response.status()).toBe(200);

  const { data: charges } = await admin
    .from("tuition_charges")
    .select("id, charge_type, base_amount_cents")
    .eq("assignment_id", assignment!.id)
    .eq("charge_type", "tuition");

  expect(charges?.length).toBe(1);
  expect(charges?.[0]?.base_amount_cents).toBe(720000);

  await parentContext.dispose();
});

test("admin can mark a charge sent as invoice", async ({ playwright, baseURL }) => {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const organizationId = manifest.organizationId;

  const { data: family } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

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
      first_name: "Invoice",
      last_name: "Test",
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
      name: "Invoice Test Plan",
      billing_basis: "annual",
      amount_cents: 120000,
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
      amount_cents: 120000,
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
      name: "1 payment",
      installment_count: 1,
      installment_amount_cents: 120000,
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

  const generated = await regenerateFutureCharges(admin, String(assignment!.id));
  const chargeId = generated[0]?.id;
  expect(chargeId).toBeTruthy();

  const adminContext = await playwright.request.newContext({
    baseURL,
    storageState: AUTH_STATE_PATHS.schoolAdmin,
  });

  const response = await adminContext.post(`/api/tuition/charges/${chargeId}/send`);
  expect(response.status()).toBe(200);

  const payload = (await response.json()) as { charge?: { status?: string } };
  expect(payload.charge?.status).toBe("sent");

  await adminContext.dispose();
});

test("tuition dashboard shows readiness banner when enrollments lack assignments", async ({
  page,
}) => {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const organizationId = manifest.organizationId;

  const { data: program } = await admin
    .from("programs")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  const { data: family } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  const { data: student } = await admin
    .from("students")
    .insert({
      organization_id: organizationId,
      family_id: family!.id,
      first_name: "Readiness",
      last_name: "Banner",
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

  expect(enrollment?.id).toBeTruthy();

  await page.goto(`/school/${TEST_ORG_SLUG}/admin/tuition`);
  await expect(page.getByTestId("tuition-readiness-banner")).toBeVisible();
  await expect(
    page.getByText(/still need tuition assignments|need a tuition assignment/i),
  ).toBeVisible();
});

test("assign-unassigned API creates tuition assignments for enrolled students", async ({
  playwright,
  baseURL,
}) => {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const organizationId = manifest.organizationId;

  const { data: program } = await admin
    .from("programs")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  const { data: family } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  const { data: student } = await admin
    .from("students")
    .insert({
      organization_id: organizationId,
      family_id: family!.id,
      first_name: "Assign",
      last_name: "Unassigned",
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

  const adminContext = await playwright.request.newContext({
    baseURL,
    storageState: AUTH_STATE_PATHS.schoolAdmin,
  });

  const response = await adminContext.post("/api/tuition/assign-unassigned", {
    data: { organizationId },
  });

  expect(response.status()).toBe(200);

  const payload = (await response.json()) as {
    assignedCount?: number;
    results?: Array<{ enrollmentId: string; assignmentId: string | null }>;
  };

  const created = (payload.results ?? []).find(
    (result) => result.enrollmentId === enrollment!.id,
  );
  expect(created?.assignmentId).toBeTruthy();
  expect((payload.assignedCount ?? 0) >= 1).toBe(true);

  await adminContext.dispose();
});
