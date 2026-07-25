import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { materializeApplicationStudent } from "../../src/lib/admissions/application-entity-materialization";
import { autoAssignTuitionForEnrollment, computeInstallmentAmountCents } from "../../src/lib/tuition/assignments";
import { regenerateFutureCharges } from "../../src/lib/tuition/charge-generator";
import { createRatePlanFromWizard } from "../../src/lib/tuition/setup-wizard";
import { AUTH_STATE_PATHS } from "../fixtures/constants";
import { E2E_PARENT_EMAIL } from "../fixtures/constants";
import { TEST_ORG_SLUG, ADMIN_TUITION_PATH } from "../helpers/constants";
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

async function ensureSmokeRatePlan(
  admin: ReturnType<typeof createAdminClient>,
  organizationId: string,
  programId: string,
) {
  const planName = `E2E Smoke ${Date.now()}`;
  const ratePlan = await createRatePlanFromWizard(admin, {
    organizationId,
    programId,
    name: planName,
    billingBasis: "annual",
    tiers: [{ label: "Standard", amount: "7200", isDefault: true }],
    effectiveStart: "2026-08-01",
    effectiveEnd: "2027-06-01",
    paymentCounts: [10],
    defaultPaymentCount: 10,
    fees: [],
  });

  return ratePlan;
}

async function seedParentApplicationForSmoke(
  admin: ReturnType<typeof createAdminClient>,
  input: {
    organizationId: string;
    programId: string;
    formVersionId: string;
    familyId: string;
    guardianId: string;
    userId: string;
    studentName: string;
  },
) {
  const [studentFirstName, ...studentLastParts] = input.studentName.split(" ");
  const studentLastName = studentLastParts.join(" ") || "Student";

  const { data: application, error } = await admin
    .from("applications")
    .insert({
      organization_id: input.organizationId,
      program_id: input.programId,
      form_version_id: input.formVersionId,
      family_id: input.familyId,
      primary_guardian_id: input.guardianId,
      created_by_user_id: input.userId,
      status: "submitted",
      submitted_at: new Date().toISOString(),
      responses: {
        student_first_name: studentFirstName,
        student_last_name: studentLastName,
        student_date_of_birth: "2018-05-15",
        student_grade: "1",
      },
    })
    .select("id")
    .single();

  if (error) throw error;
  return String(application!.id);
}

test("full tuition setup to parent billing smoke", async ({
  page,
  browser,
  request,
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

  expect(program?.id).toBeTruthy();
  const programId = String(program!.id);

  await ensureSmokeRatePlan(admin, organizationId, programId);

  await page.goto(ADMIN_TUITION_PATH);
  await expect(page.getByRole("heading", { name: "Tuition" })).toBeVisible();

  const { data: family } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("primary_email", E2E_PARENT_EMAIL)
    .maybeSingle();

  expect(family?.id).toBeTruthy();

  const { data: guardian } = await admin
    .from("guardians")
    .select("id, user_id")
    .eq("organization_id", organizationId)
    .eq("family_id", family!.id)
    .limit(1)
    .maybeSingle();

  expect(guardian?.id).toBeTruthy();

  const applicationId = await seedParentApplicationForSmoke(admin, {
    organizationId,
    programId,
    formVersionId: manifest.forms.default,
    familyId: String(family!.id),
    guardianId: String(guardian!.id),
    userId: String(guardian!.user_id),
    studentName: `Smoke Child ${Date.now()}`,
  });

  await materializeApplicationStudent(admin, applicationId);

  const acceptResponse = await request.patch(
    `/api/admissions/applications/${applicationId}/status`,
    { data: { status: "accepted" } },
  );
  expect(acceptResponse.status()).toBe(200);

  const enrollResponse = await request.post(
    `/api/admissions/applications/${applicationId}/mark-enrolled`,
    { data: { note: "E2E tuition smoke" } },
  );
  expect(enrollResponse.status()).toBe(200);

  const enrollBody = (await enrollResponse.json()) as { enrollmentId?: string };
  expect(enrollBody.enrollmentId).toBeTruthy();

  const { data: assignment } = await admin
    .from("tuition_enrollment_assignments")
    .select("id")
    .eq("enrollment_id", enrollBody.enrollmentId!)
    .eq("status", "active")
    .maybeSingle();

  expect(assignment?.id).toBeTruthy();

  const parentContext = await browser.newContext({
    storageState: AUTH_STATE_PATHS.parent,
  });
  const parentPage = await parentContext.newPage();

  await parentPage.goto(`/school/${TEST_ORG_SLUG}/parent/billing`);
  await expect(parentPage.getByRole("heading", { name: "Billing" })).toBeVisible();
  await expect(parentPage.getByText("Upcoming charges")).toBeVisible();
  await expect(parentPage.getByTestId("parent-billing-charge-row").first()).toBeVisible();
  await expect(parentPage.getByText(/first payment of \$/i)).toBeVisible();

  await parentContext.close();
});

test("tuition assignment PATCH requires admin", async ({ playwright, baseURL }) => {
  const admin = createAdminClient();
  const manifest = getSeedManifest();
  const organizationId = manifest.organizationId;

  const { data: program } = await admin
    .from("programs")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  expect(program?.id).toBeTruthy();
  const programId = String(program!.id);
  await ensureSmokeRatePlan(admin, organizationId, programId);

  const { data: family } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  expect(family?.id).toBeTruthy();

  const { data: student } = await admin
    .from("students")
    .insert({
      organization_id: organizationId,
      family_id: family!.id,
      first_name: "Patch",
      last_name: "Guard",
      status: "active",
    })
    .select("id")
    .single();

  const { data: enrollment } = await admin
    .from("enrollments")
    .insert({
      organization_id: organizationId,
      student_id: student!.id,
      program_id: programId,
      status: "enrolled",
    })
    .select("id")
    .single();

  const assignment = await autoAssignTuitionForEnrollment(admin, {
    organizationId,
    enrollmentId: String(enrollment!.id),
    familyId: String(family!.id),
    programId,
  });

  expect(assignment?.id).toBeTruthy();

  const context = await playwright.request.newContext({
    baseURL,
    storageState: AUTH_STATE_PATHS.nonAdmin,
  });

  const response = await context.patch(
    `/api/tuition/assignments/${assignment!.id}`,
    {
      data: { paymentPlanId: assignment!.paymentPlanId },
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

  const payload = (await response.json()) as {
    charge?: { status?: string };
    emailed?: boolean;
  };
  expect(payload.charge?.status).toBe("sent");
  expect(typeof payload.emailed).toBe("boolean");

  await adminContext.dispose();
});

test("tuition dashboard auto-syncs assignments for newly enrolled students", async ({
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

  await ensureSmokeRatePlan(admin, organizationId, String(program!.id));

  await page.goto(ADMIN_TUITION_PATH);
  await expect(page.getByRole("heading", { name: "Tuition" })).toBeVisible();

  const { data: assignment } = await admin
    .from("tuition_enrollment_assignments")
    .select("id")
    .eq("enrollment_id", enrollment!.id)
    .eq("status", "active")
    .maybeSingle();

  expect(assignment?.id).toBeTruthy();
});

test("sync-assignments API creates tuition assignments for enrolled students", async ({
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

  expect(program?.id).toBeTruthy();
  await ensureSmokeRatePlan(admin, organizationId, String(program!.id));

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

  const { data: assignmentBefore } = await admin
    .from("tuition_enrollment_assignments")
    .select("id")
    .eq("enrollment_id", enrollment!.id)
    .maybeSingle();

  expect(assignmentBefore).toBeNull();

  const adminContext = await playwright.request.newContext({
    baseURL,
    storageState: AUTH_STATE_PATHS.schoolAdmin,
  });

  const response = await adminContext.post("/api/tuition/sync-assignments", {
    data: { organizationId },
  });

  expect(response.status()).toBe(200);

  const { data: assignment } = await admin
    .from("tuition_enrollment_assignments")
    .select("id")
    .eq("enrollment_id", enrollment!.id)
    .eq("status", "active")
    .maybeSingle();

  expect(assignment?.id).toBeTruthy();

  await adminContext.dispose();
});

test("tuition setup panel opens from header button with three steps", async ({
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

  expect(program?.id).toBeTruthy();
  await ensureSmokeRatePlan(admin, organizationId, String(program!.id));

  await page.goto(ADMIN_TUITION_PATH);
  await expect(page.getByRole("heading", { name: "Tuition" })).toBeVisible();

  await page.getByTestId("tuition-setup-button").click();
  const panel = page.getByTestId("tuition-setup-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Publish a rate plan")).toBeVisible();
  await expect(panel.getByText("Families choose payment schedules")).toBeVisible();
  await expect(panel.getByText("Generate billing schedules")).toBeVisible();
});
