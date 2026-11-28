/**
 * A split-billing family with two children: one assignment ready, one waiting
 * on a payment-plan choice, plus an odd assignment whose enrollment belongs to
 * a student outside the family (the summary still names that child). Charges
 * are split between guardians, there is a saved card, a failed autopay and a
 * "yes" to the Idaho tax-credit checklist question.
 */

export const BILLING_FIXTURE_ORG_ID = "org-1";
export const BILLING_FIXTURE_FAMILY_ID = "fam-1";
export const BILLING_FIXTURE_USER_ID = "user-1";

const stamp = { created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-02T00:00:00Z" };

function charge(input: {
  id: string;
  assignmentId: string;
  dueDate: string;
  amountCents: number;
  status: string;
  guardianId?: string | null;
  paidCents?: number;
  installmentNumber?: number;
  chargeType?: string;
}) {
  return {
    id: input.id,
    organization_id: BILLING_FIXTURE_ORG_ID,
    assignment_id: input.assignmentId,
    family_id: BILLING_FIXTURE_FAMILY_ID,
    guardian_id: input.guardianId ?? null,
    label: `Tuition ${input.dueDate}`,
    base_amount_cents: input.amountCents,
    amount_cents: input.amountCents,
    paid_cents: input.paidCents ?? 0,
    currency: "USD",
    due_date: input.dueDate,
    status: input.status,
    charge_type: input.chargeType ?? "tuition",
    installment_number: input.installmentNumber ?? 1,
    metadata: {},
    sent_at: null,
    paid_at: null,
    ...stamp,
  };
}

function assignment(input: {
  id: string;
  enrollmentId: string;
  ratePlanId: string;
  rateTierId: string | null;
  paymentPlanId: string;
  status?: string;
  metadata?: Record<string, unknown>;
}) {
  return {
    id: input.id,
    organization_id: BILLING_FIXTURE_ORG_ID,
    enrollment_id: input.enrollmentId,
    family_id: BILLING_FIXTURE_FAMILY_ID,
    rate_plan_id: input.ratePlanId,
    rate_tier_id: input.rateTierId,
    payment_plan_id: input.paymentPlanId,
    assignment_source: "rules",
    assigned_by_user_id: null,
    effective_start: "2026-08-01",
    effective_end: null,
    status: input.status ?? "active",
    metadata: input.metadata ?? {},
    ...stamp,
  };
}

export function buildParentBillingFixtureTables(): Record<string, Record<string, unknown>[]> {
  return {
    guardians: [
      { id: "g-1", family_id: BILLING_FIXTURE_FAMILY_ID, user_id: BILLING_FIXTURE_USER_ID },
      { id: "g-2", family_id: BILLING_FIXTURE_FAMILY_ID, user_id: "user-2" },
    ],
    tuition_billing_splits: [
      { id: "split-1", organization_id: BILLING_FIXTURE_ORG_ID, family_id: BILLING_FIXTURE_FAMILY_ID, guardian_id: "g-1", share_bps: 6000, ...stamp },
      { id: "split-2", organization_id: BILLING_FIXTURE_ORG_ID, family_id: BILLING_FIXTURE_FAMILY_ID, guardian_id: "g-2", share_bps: 4000, ...stamp },
    ],
    students: [
      { id: "stu-1", organization_id: BILLING_FIXTURE_ORG_ID, family_id: BILLING_FIXTURE_FAMILY_ID, first_name: "Ada", last_name: "Lovelace" },
      { id: "stu-2", organization_id: BILLING_FIXTURE_ORG_ID, family_id: BILLING_FIXTURE_FAMILY_ID, first_name: "Ben", last_name: null },
      { id: "stu-9", organization_id: BILLING_FIXTURE_ORG_ID, family_id: "fam-9", first_name: "Zed", last_name: "Other" },
    ],
    enrollments: [
      { id: "enr-1", organization_id: BILLING_FIXTURE_ORG_ID, student_id: "stu-1", program_id: "prog-1", status: "enrolled", enrolled_at: "2026-07-01T00:00:00Z" },
      { id: "enr-2", organization_id: BILLING_FIXTURE_ORG_ID, student_id: "stu-2", program_id: "prog-1", status: "enrolled", enrolled_at: null },
      { id: "enr-3", organization_id: BILLING_FIXTURE_ORG_ID, student_id: "stu-2", program_id: "prog-2", status: "withdrawn", enrolled_at: null },
      { id: "enr-4", organization_id: BILLING_FIXTURE_ORG_ID, student_id: "stu-1", program_id: "prog-2", status: "enrolled", enrolled_at: "2026-07-02T00:00:00Z" },
      { id: "enr-9", organization_id: BILLING_FIXTURE_ORG_ID, student_id: "stu-9", program_id: "prog-1", status: "enrolled", enrolled_at: null },
    ],
    tuition_enrollment_assignments: [
      assignment({ id: "asg-1", enrollmentId: "enr-1", ratePlanId: "rp-1", rateTierId: "tier-1", paymentPlanId: "pp-1" }),
      assignment({
        id: "asg-2",
        enrollmentId: "enr-2",
        ratePlanId: "rp-2",
        rateTierId: null,
        paymentPlanId: "pp-2",
        metadata: { pendingPaymentPlanSelection: true },
      }),
      assignment({ id: "asg-9", enrollmentId: "enr-9", ratePlanId: "rp-1", rateTierId: null, paymentPlanId: "pp-1" }),
      assignment({ id: "asg-old", enrollmentId: "enr-3", ratePlanId: "rp-1", rateTierId: null, paymentPlanId: "pp-1", status: "ended" }),
    ],
    tuition_charges: [
      charge({ id: "ch-1", assignmentId: "asg-1", dueDate: "2026-09-01", amountCents: 50000, status: "paid", paidCents: 50000, installmentNumber: 1 }),
      charge({ id: "ch-2", assignmentId: "asg-1", dueDate: "2026-10-01", amountCents: 50000, status: "scheduled", installmentNumber: 2, guardianId: "g-1" }),
      charge({ id: "ch-3", assignmentId: "asg-1", dueDate: "2026-10-01", amountCents: 30000, status: "scheduled", installmentNumber: 2, guardianId: "g-2" }),
      charge({ id: "ch-4", assignmentId: "asg-9", dueDate: "2026-11-01", amountCents: 20000, status: "sent", installmentNumber: 1 }),
      charge({ id: "ch-5", assignmentId: "asg-1", dueDate: "2026-12-01", amountCents: 50000, status: "void", installmentNumber: 3 }),
    ],
    application_payments: [],
    tuition_adjustments: [],
    teacher_parent_form_responses: [],
    programs: [
      { id: "prog-1", organization_id: BILLING_FIXTURE_ORG_ID, name: "Main" },
      { id: "prog-2", organization_id: BILLING_FIXTURE_ORG_ID, name: "Enrichment" },
    ],
    tuition_rate_plans: [
      { id: "rp-1", organization_id: BILLING_FIXTURE_ORG_ID, program_id: "prog-1", name: "Standard", billing_basis: "annual", amount_cents: 1000000, currency: "USD", effective_start: "2026-08-01", effective_end: "2027-06-30", status: "active", metadata: {}, ...stamp },
      { id: "rp-2", organization_id: BILLING_FIXTURE_ORG_ID, program_id: "prog-1", name: "Flexible", billing_basis: "annual", amount_cents: 800000, currency: "USD", effective_start: null, effective_end: null, status: "active", metadata: {}, ...stamp },
    ],
    tuition_rate_tiers: [
      { id: "tier-1", organization_id: BILLING_FIXTURE_ORG_ID, rate_plan_id: "rp-1", code: "full", label: "Full time", amount_cents: 1000000, sort_order: 1, is_default: true, metadata: {}, ...stamp },
      { id: "tier-2", organization_id: BILLING_FIXTURE_ORG_ID, rate_plan_id: "rp-2", code: "part", label: "Part time", amount_cents: 600000, sort_order: 1, is_default: true, metadata: {}, ...stamp },
    ],
    tuition_payment_plans: [
      { id: "pp-1", organization_id: BILLING_FIXTURE_ORG_ID, rate_plan_id: "rp-1", name: "Monthly", installment_count: 10, installment_amount_cents: 100000, billing_day_of_month: 1, is_default: true, ...stamp },
      { id: "pp-2", organization_id: BILLING_FIXTURE_ORG_ID, rate_plan_id: "rp-2", name: "", installment_count: 1, installment_amount_cents: 600000, billing_day_of_month: null, is_default: true, ...stamp },
      { id: "pp-3", organization_id: BILLING_FIXTURE_ORG_ID, rate_plan_id: "rp-2", name: "Quarterly", installment_count: 4, installment_amount_cents: 150000, billing_day_of_month: 1, is_default: false, ...stamp },
    ],
    tuition_fee_components: [],
    tuition_billing_accounts: [
      {
        id: "acct-1",
        organization_id: BILLING_FIXTURE_ORG_ID,
        family_id: BILLING_FIXTURE_FAMILY_ID,
        autopay_enabled: false,
        default_payment_method_id: "pm_123",
        billing_email: null,
        status: "active",
        metadata: { autopayByGuardian: { "g-1": true } },
        ...stamp,
      },
    ],
    family_payment_methods: [
      { id: "fpm-1", billing_account_id: "acct-1", guardian_id: "g-1", is_default: true, stripe_payment_method_id: "pm_123", brand: "visa", last4: "4242", exp_month: 12, exp_year: 2030 },
    ],
    activity_events: [
      {
        id: "evt-1",
        organization_id: BILLING_FIXTURE_ORG_ID,
        action: "tuition.autopay_failed",
        metadata: { familyId: BILLING_FIXTURE_FAMILY_ID },
        summary: "Autopay failed for October tuition",
        created_at: "2026-10-01T12:00:00Z",
      },
    ],
    enrollment_checklists: [
      { id: "chk-1", organization_id: BILLING_FIXTURE_ORG_ID, enrollment_id: "enr-1", application_id: "app-1", template_id: "tpl-1" },
      { id: "chk-2", organization_id: BILLING_FIXTURE_ORG_ID, enrollment_id: "enr-2", application_id: "app-2", template_id: "tpl-1" },
    ],
    enrollment_checklist_items: [
      { id: "ii-1", checklist_id: "chk-1", item_key: "idaho_parent_choice_tax_credit", responses: { answer: "yes" }, status: "completed" },
    ],
  };
}
