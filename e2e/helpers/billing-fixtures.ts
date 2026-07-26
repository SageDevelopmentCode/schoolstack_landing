import { expect, type Page } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assignmentNeedsPaymentPlanSelection,
  finalizeEnrollmentPaymentPlan,
  getAssignmentForEnrollment,
} from "../../src/lib/tuition/assignments";
import { regenerateFutureCharges } from "../../src/lib/tuition/charge-generator";
import { E2E_PARENT_EMAIL } from "../fixtures/constants";
import { TEST_ORG_SLUG } from "./constants";
import { getSeedManifest } from "./seed-manifest";

export async function getE2eParentFamily(
  admin: SupabaseClient,
  organizationId?: string,
): Promise<{ id: string; organizationId: string }> {
  const orgId = organizationId ?? getSeedManifest().organizationId;

  const { data: family, error } = await admin
    .from("families")
    .select("id")
    .eq("organization_id", orgId)
    .eq("primary_email", E2E_PARENT_EMAIL)
    .maybeSingle();

  if (error) throw error;
  if (!family?.id) {
    throw new Error(`E2E parent family not found for ${E2E_PARENT_EMAIL}`);
  }

  return { id: String(family.id), organizationId: orgId };
}

export async function resetFamilyBillingState(
  admin: SupabaseClient,
  familyId: string,
): Promise<void> {
  const { data: assignments, error: assignmentsError } = await admin
    .from("tuition_enrollment_assignments")
    .select("id")
    .eq("family_id", familyId);

  if (assignmentsError) throw assignmentsError;

  const assignmentIds = (assignments ?? []).map((row) => String(row.id));

  if (assignmentIds.length > 0) {
    const { error: adjustmentsError } = await admin
      .from("tuition_adjustments")
      .delete()
      .in("assignment_id", assignmentIds);

    if (adjustmentsError) throw adjustmentsError;
  }

  const { error: chargesError } = await admin
    .from("tuition_charges")
    .delete()
    .eq("family_id", familyId);

  if (chargesError) throw chargesError;

  const { error: deleteAssignmentsError } = await admin
    .from("tuition_enrollment_assignments")
    .delete()
    .eq("family_id", familyId);

  if (deleteAssignmentsError) throw deleteAssignmentsError;

  const { data: students, error: studentsError } = await admin
    .from("students")
    .select("id")
    .eq("family_id", familyId);

  if (studentsError) throw studentsError;

  const studentIds = (students ?? []).map((row) => String(row.id));

  if (studentIds.length > 0) {
    const { error: enrollmentsError } = await admin
      .from("enrollments")
      .delete()
      .in("student_id", studentIds);

    if (enrollmentsError) throw enrollmentsError;
  }

  const { error: deleteStudentsError } = await admin
    .from("students")
    .delete()
    .eq("family_id", familyId);

  if (deleteStudentsError) throw deleteStudentsError;
}

export async function waitForBillingPage(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
  await expect(page.getByText("Loading billing…")).not.toBeVisible({ timeout: 15_000 });
}

export async function gotoBillingPage(page: Page): Promise<void> {
  await page.goto(`/school/${TEST_ORG_SLUG}/parent/billing`);
  await waitForBillingPage(page);
}

export async function finalizeEnrollmentBilling(
  admin: SupabaseClient,
  enrollmentId: string,
): Promise<void> {
  const assignment = await getAssignmentForEnrollment(admin, enrollmentId);
  if (!assignment) {
    throw new Error(`No tuition assignment found for enrollment ${enrollmentId}`);
  }

  if (assignmentNeedsPaymentPlanSelection(assignment)) {
    await finalizeEnrollmentPaymentPlan(admin, {
      assignmentId: assignment.id,
      paymentPlanId: assignment.paymentPlanId,
    });
    return;
  }

  await regenerateFutureCharges(admin, assignment.id);
}
