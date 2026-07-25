import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { autoAssignTuitionForEnrollment } from "../../src/lib/tuition/assignments";
import { createAdjustmentRule } from "../../src/lib/tuition/rules-engine";
import { createRatePlanFromWizard } from "../../src/lib/tuition/setup-wizard";
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

test("sibling discount rule auto-applies when second child is assigned tuition", async () => {
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

  await createRatePlanFromWizard(admin, {
    organizationId,
    programId,
    name: `E2E Rules ${Date.now()}`,
    billingBasis: "annual",
    tiers: [{ label: "Standard", amount: "7200", isDefault: true }],
    effectiveStart: "2026-08-01",
    effectiveEnd: "2027-06-01",
    paymentCounts: [10],
    defaultPaymentCount: 10,
    fees: [],
  });

  const siblingRule = await createAdjustmentRule(admin, {
    organizationId,
    name: "Sibling discount E2E",
    priority: 10,
    conditions: {
      all: [{ field: "active_enrollments_in_family", op: "gte", value: 2 }],
    },
    adjustmentType: "percent_discount",
    valuePercent: 10,
    reason: "Sibling discount",
  });

  await admin
    .from("tuition_adjustment_rules")
    .update({ active: false })
    .eq("organization_id", organizationId)
    .neq("id", siblingRule.id);

  const stamp = Date.now();

  const isolatedEmail = `e2e-sibling-${stamp}@schoolstack.test`;
  const { data: isolatedFamily, error: familyError } = await admin
    .from("families")
    .insert({
      organization_id: organizationId,
      name: `Sibling Rule E2E ${stamp}`,
      primary_email: isolatedEmail,
    })
    .select("id")
    .single();

  if (familyError) throw familyError;

  const familyId = String(isolatedFamily!.id);

  async function createEnrolledStudent(firstName: string, lastName: string) {
    const { data: student, error: studentError } = await admin
      .from("students")
      .insert({
        organization_id: organizationId,
        family_id: familyId,
        first_name: firstName,
        last_name: lastName,
        status: "active",
      })
      .select("id")
      .single();

    if (studentError) throw studentError;

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

    if (enrollmentError) throw enrollmentError;

    return String(enrollment!.id);
  }

  const firstEnrollmentId = await createEnrolledStudent("SiblingA", `E2E${stamp}`);

  const firstAssignment = await autoAssignTuitionForEnrollment(admin, {
    organizationId,
    enrollmentId: firstEnrollmentId,
    familyId,
    programId,
  });
  expect(firstAssignment?.id).toBeTruthy();

  const { data: firstRuleAdjustments } = await admin
    .from("tuition_adjustments")
    .select("id")
    .eq("assignment_id", firstAssignment!.id)
    .eq("source", "rule");

  expect(firstRuleAdjustments?.length ?? 0).toBe(0);

  const secondEnrollmentId = await createEnrolledStudent("SiblingB", `E2E${stamp}`);

  const secondAssignment = await autoAssignTuitionForEnrollment(admin, {
    organizationId,
    enrollmentId: secondEnrollmentId,
    familyId,
    programId,
  });
  expect(secondAssignment?.id).toBeTruthy();

  const { data: secondRuleAdjustments } = await admin
    .from("tuition_adjustments")
    .select("id, rule_id, reason")
    .eq("assignment_id", secondAssignment!.id)
    .eq("source", "rule");

  expect(secondRuleAdjustments?.length).toBe(1);
  expect(secondRuleAdjustments![0]?.rule_id).toBe(siblingRule.id);
  expect(secondRuleAdjustments![0]?.reason).toMatch(/sibling discount/i);

  const { data: discountedCharges } = await admin
    .from("tuition_charges")
    .select("amount_cents, base_amount_cents, status")
    .eq("assignment_id", secondAssignment!.id)
    .eq("charge_type", "tuition")
    .in("status", ["scheduled", "sent"])
    .order("due_date", { ascending: true })
    .limit(1);

  expect(discountedCharges?.length).toBe(1);
  expect(discountedCharges![0]?.base_amount_cents).toBe(72000);
  expect(discountedCharges![0]?.amount_cents).toBe(64800);
});
