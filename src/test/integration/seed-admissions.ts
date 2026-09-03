import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildApplySystemSection,
  emptyApplyCustomSection,
} from "@/lib/admissions/apply-system-fields";
import { createApplicationPayment } from "@/lib/stripe/application-payments";
import { upsertOrganizationPaymentAccount } from "@/lib/stripe/organization-payment-account";
import { TEST_ORG_SLUG } from "../../../e2e/helpers/constants";

export const COMPLETE_STUDENT_RESPONSES = {
  student_first_name: "Integration",
  student_last_name: "Test",
  student_date_of_birth: "2020-07-20",
  student_grade: "k",
};

export type FeeEnabledFormSeed = {
  organizationId: string;
  programId: string;
  formVersionId: string;
  publicSlug: string;
};

export type DraftApplicationSeed = {
  applicationId: string;
  familyId: string;
  guardianId: string;
  organizationId: string;
  programId: string;
  formVersionId: string;
};

export type PendingPaymentSeed = {
  paymentId: string;
  checkoutSessionId: string;
  applicationId: string;
  organizationId: string;
};

export type EnrollmentChecklistPaymentSeed = {
  organizationId: string;
  applicationId: string;
  checklistId: string;
  checklistItemId: string;
  paymentId: string;
  checkoutSessionId: string;
};

async function getOrganizationId(admin: SupabaseClient): Promise<string> {
  const { data, error } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", TEST_ORG_SLUG)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) {
    throw new Error(
      `Integration seed aborted: organization "${TEST_ORG_SLUG}" not found. Run supabase db reset.`,
    );
  }

  return String(data.id);
}

async function ensureProgram(
  admin: SupabaseClient,
  organizationId: string,
): Promise<string> {
  const { data: existing, error: lookupError } = await admin
    .from("programs")
    .select("id")
    .eq("organization_id", organizationId)
    .limit(1)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing?.id) return String(existing.id);

  const { data: program, error: insertError } = await admin
    .from("programs")
    .insert({
      organization_id: organizationId,
      name: "Integration Test Program",
      type: "school_year",
      status: "open",
    })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return String(program.id);
}

export async function seedFeeEnabledForm(
  admin: SupabaseClient,
  options?: {
    requireAcknowledgment?: boolean;
    amountCents?: number;
  },
): Promise<FeeEnabledFormSeed> {
  const organizationId = await getOrganizationId(admin);
  const programId = await ensureProgram(admin, organizationId);
  const publicSlug = `integration-fee-${randomUUID().slice(0, 8)}`;

  const { data: maxVersionRow, error: versionLookupError } = await admin
    .from("application_form_versions")
    .select("version")
    .eq("organization_id", organizationId)
    .eq("program_id", programId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (versionLookupError) throw versionLookupError;
  const nextVersion = Number(maxVersionRow?.version ?? 0) + 1;

  const schema = {
    sections: [buildApplySystemSection(), emptyApplyCustomSection()],
    acknowledgments: options?.requireAcknowledgment
      ? [{ id: "ack-integration", label: "I agree to the terms." }]
      : [],
  };

  const { data: formVersion, error } = await admin
    .from("application_form_versions")
    .insert({
      organization_id: organizationId,
      program_id: programId,
      version: nextVersion,
      status: "published",
      title: "Integration Fee Form",
      public_slug: publicSlug,
      schema,
      fee_config: {
        enabled: true,
        label: "Application fee",
        amount_cents: options?.amountCents ?? 5000,
        required_to_submit: true,
      },
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;

  return {
    organizationId,
    programId,
    formVersionId: String(formVersion.id),
    publicSlug,
  };
}

export async function seedDraftApplication(
  admin: SupabaseClient,
  input: {
    form: FeeEnabledFormSeed;
    responses?: Record<string, unknown>;
    acknowledgments?: Record<string, boolean>;
    feeStatus?: "pending" | "not_required" | "paid";
  },
): Promise<DraftApplicationSeed> {
  const suffix = randomUUID().slice(0, 8);
  const email = `integration-parent-${suffix}@schoolstack.test`;

  const { data: family, error: familyError } = await admin
    .from("families")
    .insert({
      organization_id: input.form.organizationId,
      name: `Integration Family ${suffix}`,
      primary_email: email,
    })
    .select("id")
    .single();

  if (familyError) throw familyError;

  const { data: guardian, error: guardianError } = await admin
    .from("guardians")
    .insert({
      organization_id: input.form.organizationId,
      family_id: family.id,
      first_name: "Integration",
      last_name: "Parent",
      email,
      relationship: "parent",
    })
    .select("id")
    .single();

  if (guardianError) throw guardianError;

  const { data: application, error: applicationError } = await admin
    .from("applications")
    .insert({
      organization_id: input.form.organizationId,
      program_id: input.form.programId,
      form_version_id: input.form.formVersionId,
      family_id: family.id,
      primary_guardian_id: guardian.id,
      status: "draft",
      fee_status: input.feeStatus ?? "pending",
      responses: input.responses ?? COMPLETE_STUDENT_RESPONSES,
      acknowledgments: input.acknowledgments ?? {},
    })
    .select("id")
    .single();

  if (applicationError) throw applicationError;

  return {
    applicationId: String(application.id),
    familyId: String(family.id),
    guardianId: String(guardian.id),
    organizationId: input.form.organizationId,
    programId: input.form.programId,
    formVersionId: input.form.formVersionId,
  };
}

export async function seedPaymentAccount(
  admin: SupabaseClient,
  organizationId: string,
  options?: {
    stripeConnectAccountId?: string;
    chargesEnabled?: boolean;
  },
): Promise<void> {
  await upsertOrganizationPaymentAccount(admin, {
    organizationId,
    stripeConnectAccountId:
      options?.stripeConnectAccountId ?? `acct_test_${randomUUID().slice(0, 8)}`,
    onboardingStatus: "complete",
    chargesEnabled: options?.chargesEnabled ?? true,
    payoutsEnabled: true,
  });
}

export async function seedPendingPayment(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    applicationId: string;
    checkoutSessionId?: string;
    amountCents?: number;
  },
): Promise<PendingPaymentSeed> {
  const checkoutSessionId =
    input.checkoutSessionId ?? `cs_test_${randomUUID().slice(0, 12)}`;

  const payment = await createApplicationPayment(admin, {
    organizationId: input.organizationId,
    applicationId: input.applicationId,
    amountCents: input.amountCents ?? 5000,
    stripeCheckoutSessionId: checkoutSessionId,
    label: "Application fee",
  });

  return {
    paymentId: payment.id,
    checkoutSessionId,
    applicationId: input.applicationId,
    organizationId: input.organizationId,
  };
}

const INTEGRATION_ENROLLMENT_CHECKLIST_PATH = "integration-enrollment";
const INTEGRATION_PAYMENT_ITEM_KEY = "integration_payment";

async function ensureIntegrationEnrollmentChecklistTemplate(
  admin: SupabaseClient,
  organizationId: string,
  programId: string,
): Promise<{ templateId: string; templateItemId: string }> {
  const { data: existingTemplate, error: templateLookupError } = await admin
    .from("enrollment_checklist_templates")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("program_id", programId)
    .in("status", ["draft", "published"])
    .maybeSingle();

  if (templateLookupError) throw templateLookupError;

  let templateId = existingTemplate?.id ? String(existingTemplate.id) : null;

  if (!templateId) {
    const { data: template, error: templateError } = await admin
      .from("enrollment_checklist_templates")
      .insert({
        organization_id: organizationId,
        program_id: programId,
        name: "Integration Checklist",
        enrollment_path: INTEGRATION_ENROLLMENT_CHECKLIST_PATH,
        status: "published",
      })
      .select("id")
      .single();

    if (templateError) throw templateError;
    templateId = String(template.id);
  }

  const { data: existingTemplateItem, error: templateItemLookupError } = await admin
    .from("enrollment_checklist_template_items")
    .select("id")
    .eq("template_id", templateId)
    .eq("item_key", INTEGRATION_PAYMENT_ITEM_KEY)
    .maybeSingle();

  if (templateItemLookupError) throw templateItemLookupError;

  if (existingTemplateItem?.id) {
    return {
      templateId,
      templateItemId: String(existingTemplateItem.id),
    };
  }

  const { data: templateItem, error: templateItemError } = await admin
    .from("enrollment_checklist_template_items")
    .insert({
      template_id: templateId,
      organization_id: organizationId,
      item_key: INTEGRATION_PAYMENT_ITEM_KEY,
      sort_order: 0,
      label: "Enrollment fee",
      type: "payment",
      required: true,
      metadata: {
        payment: {
          label: "Enrollment fee",
          amountCents: 2500,
        },
      },
    })
    .select("id")
    .single();

  if (templateItemError) throw templateItemError;

  return {
    templateId,
    templateItemId: String(templateItem.id),
  };
}

export async function seedEnrollmentChecklistPayment(
  admin: SupabaseClient,
): Promise<EnrollmentChecklistPaymentSeed> {
  const form = await seedFeeEnabledForm(admin, { amountCents: 0 });
  const draft = await seedDraftApplication(admin, {
    form,
    feeStatus: "not_required",
  });

  const { data: student, error: studentError } = await admin
    .from("students")
    .insert({
      organization_id: form.organizationId,
      family_id: draft.familyId,
      first_name: "Checklist",
      last_name: "Student",
      date_of_birth: "2020-01-01",
      grade: "k",
      status: "prospect",
    })
    .select("id")
    .single();

  if (studentError) throw studentError;

  const { data: enrollment, error: enrollmentError } = await admin
    .from("enrollments")
    .insert({
      organization_id: form.organizationId,
      student_id: student.id,
      program_id: form.programId,
      status: "enrolled",
    })
    .select("id")
    .single();

  if (enrollmentError) throw enrollmentError;

  const { templateId, templateItemId } =
    await ensureIntegrationEnrollmentChecklistTemplate(
      admin,
      form.organizationId,
      form.programId,
    );

  const { data: checklist, error: checklistError } = await admin
    .from("enrollment_checklists")
    .insert({
      organization_id: form.organizationId,
      enrollment_id: enrollment.id,
      template_id: templateId,
      application_id: draft.applicationId,
      status: "in_progress",
    })
    .select("id")
    .single();

  if (checklistError) throw checklistError;

  const { data: checklistItem, error: checklistItemError } = await admin
    .from("enrollment_checklist_items")
    .insert({
      checklist_id: checklist.id,
      organization_id: form.organizationId,
      template_item_id: templateItemId,
      item_key: INTEGRATION_PAYMENT_ITEM_KEY,
      status: "not_started",
      payment_status: "pending",
    })
    .select("id")
    .single();

  if (checklistItemError) throw checklistItemError;

  const checkoutSessionId = `cs_test_${randomUUID().slice(0, 12)}`;

  const { data: payment, error: paymentError } = await admin
    .from("application_payments")
    .insert({
      organization_id: form.organizationId,
      application_id: draft.applicationId,
      amount_cents: 2500,
      currency: "USD",
      status: "pending",
      payment_type: "enrollment_checklist",
      enrollment_checklist_item_id: checklistItem.id,
      stripe_checkout_session_id: checkoutSessionId,
      label: "Enrollment fee",
    })
    .select("id")
    .single();

  if (paymentError) throw paymentError;

  return {
    organizationId: form.organizationId,
    applicationId: draft.applicationId,
    checklistId: String(checklist.id),
    checklistItemId: String(checklistItem.id),
    paymentId: String(payment.id),
    checkoutSessionId,
  };
}

export async function seedPaymentAccountForOrg(
  admin: SupabaseClient,
  stripeConnectAccountId: string,
  options?: { chargesEnabled?: boolean },
): Promise<string> {
  const organizationId = await getOrganizationId(admin);
  await seedPaymentAccount(admin, organizationId, {
    stripeConnectAccountId,
    chargesEnabled: options?.chargesEnabled ?? false,
  });
  return organizationId;
}

export type TuitionPaymentWebhookSeed = {
  organizationId: string;
  familyId: string;
  guardianId: string;
  billingAccountId: string;
  chargeId: string;
  assignmentId: string;
  paymentId: string;
  checkoutSessionId: string;
};

export async function seedTuitionPaymentWebhook(
  admin: SupabaseClient,
): Promise<TuitionPaymentWebhookSeed> {
  const form = await seedFeeEnabledForm(admin);
  const draft = await seedDraftApplication(admin, { form });

  const { data: student, error: studentError } = await admin
    .from("students")
    .insert({
      organization_id: draft.organizationId,
      family_id: draft.familyId,
      first_name: "Tuition",
      last_name: "Webhook",
      status: "active",
    })
    .select("id")
    .single();

  if (studentError) throw studentError;

  const { data: enrollment, error: enrollmentError } = await admin
    .from("enrollments")
    .insert({
      organization_id: draft.organizationId,
      student_id: student.id,
      program_id: draft.programId,
      status: "enrolled",
    })
    .select("id")
    .single();

  if (enrollmentError) throw enrollmentError;

  const { data: ratePlan, error: ratePlanError } = await admin
    .from("tuition_rate_plans")
    .insert({
      organization_id: draft.organizationId,
      program_id: draft.programId,
      name: "Integration Tuition Webhook",
      billing_basis: "annual",
      amount_cents: 720_000,
      status: "active",
      effective_start: "2026-08-01",
      effective_end: "2027-07-31",
    })
    .select("id")
    .single();

  if (ratePlanError) throw ratePlanError;

  const { data: paymentPlan, error: paymentPlanError } = await admin
    .from("tuition_payment_plans")
    .insert({
      organization_id: draft.organizationId,
      rate_plan_id: ratePlan.id,
      name: "Annual",
      installment_count: 1,
      installment_amount_cents: 720_000,
      billing_day_of_month: 1,
      is_default: true,
    })
    .select("id")
    .single();

  if (paymentPlanError) throw paymentPlanError;

  const { data: assignment, error: assignmentError } = await admin
    .from("tuition_enrollment_assignments")
    .insert({
      organization_id: draft.organizationId,
      enrollment_id: enrollment.id,
      family_id: draft.familyId,
      rate_plan_id: ratePlan.id,
      payment_plan_id: paymentPlan.id,
      status: "active",
    })
    .select("id")
    .single();

  if (assignmentError) throw assignmentError;

  const { data: charge, error: chargeError } = await admin
    .from("tuition_charges")
    .insert({
      organization_id: draft.organizationId,
      assignment_id: assignment.id,
      family_id: draft.familyId,
      label: "Aug Tuition",
      base_amount_cents: 720_000,
      amount_cents: 720_000,
      due_date: "2026-08-01",
      status: "sent",
      charge_type: "tuition",
      installment_number: 1,
    })
    .select("id")
    .single();

  if (chargeError) throw chargeError;

  const { data: billingAccount, error: billingAccountError } = await admin
    .from("tuition_billing_accounts")
    .insert({
      organization_id: draft.organizationId,
      family_id: draft.familyId,
    })
    .select("id")
    .single();

  if (billingAccountError) throw billingAccountError;

  const checkoutSessionId = `cs_test_${randomUUID().slice(0, 12)}`;

  const { data: payment, error: paymentError } = await admin
    .from("application_payments")
    .insert({
      organization_id: draft.organizationId,
      family_id: draft.familyId,
      tuition_charge_id: charge.id,
      payment_type: "tuition",
      label: "Aug Tuition",
      amount_cents: 720_000,
      status: "pending",
      stripe_checkout_session_id: checkoutSessionId,
    })
    .select("id")
    .single();

  if (paymentError) throw paymentError;

  return {
    organizationId: draft.organizationId,
    familyId: draft.familyId,
    guardianId: draft.guardianId,
    billingAccountId: String(billingAccount.id),
    chargeId: String(charge.id),
    assignmentId: String(assignment.id),
    paymentId: String(payment.id),
    checkoutSessionId,
  };
}
