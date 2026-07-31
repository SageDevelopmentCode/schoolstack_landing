export type BillingBasis = "annual" | "monthly" | "weekly" | "per_session";
export type RatePlanStatus = "draft" | "active" | "archived";
export type FeeTiming = "enrollment" | "first_installment" | "annual";
export type AssignmentSource = "default" | "manual" | "rule" | "import";
export type AssignmentStatus = "active" | "paused" | "ended";
export type AdjustmentType =
  | "percent_discount"
  | "fixed_discount"
  | "custom_amount"
  | "waiver";
export type AdjustmentScope = "installment" | "annual_total" | "fee_component";
export type AdjustmentSource =
  | "manual"
  | "rule"
  | "checklist_response"
  | "import";
export type AdjustmentStatus = "active" | "revoked";
export type ChargeStatus =
  | "scheduled"
  | "sent"
  | "paid"
  | "overdue"
  | "waived"
  | "void";
export type ChargeType = "tuition" | "fee" | "adjustment_credit" | "late_fee";
export type BillingAccountStatus = "active" | "hold" | "collections";

export type TuitionRatePlan = {
  id: string;
  organizationId: string;
  programId: string | null;
  name: string;
  billingBasis: BillingBasis;
  amountCents: number;
  currency: string;
  effectiveStart: string | null;
  effectiveEnd: string | null;
  status: RatePlanStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type TuitionRateTier = {
  id: string;
  organizationId: string;
  ratePlanId: string;
  code: string;
  label: string;
  amountCents: number;
  sortOrder: number;
  isDefault: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type TuitionPaymentPlan = {
  id: string;
  organizationId: string;
  ratePlanId: string;
  name: string;
  installmentCount: number;
  installmentAmountCents: number;
  billingDayOfMonth: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TuitionFeeComponent = {
  id: string;
  organizationId: string;
  ratePlanId: string;
  code: string;
  label: string;
  amountCents: number;
  currency: string;
  timing: FeeTiming;
  required: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TuitionBillingAccount = {
  id: string;
  organizationId: string;
  familyId: string;
  autopayEnabled: boolean;
  defaultPaymentMethodId: string | null;
  billingEmail: string | null;
  status: BillingAccountStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type TuitionAssignmentMetadata = {
  pendingPaymentPlanSelection?: boolean;
};

export type TuitionEnrollmentAssignment = {
  id: string;
  organizationId: string;
  enrollmentId: string;
  familyId: string;
  ratePlanId: string;
  rateTierId: string | null;
  paymentPlanId: string;
  assignmentSource: AssignmentSource;
  assignedByUserId: string | null;
  effectiveStart: string | null;
  effectiveEnd: string | null;
  status: AssignmentStatus;
  metadata: TuitionAssignmentMetadata;
  createdAt: string;
  updatedAt: string;
};

export type FamilyAssignmentSummary = {
  assignmentId: string;
  enrollmentId: string;
  studentName: string | null;
  ratePlanName: string;
  tierLabel: string | null;
  paymentPlanLabel: string;
  pendingPaymentPlanSelection: boolean;
};

export type TuitionAdjustment = {
  id: string;
  organizationId: string;
  assignmentId: string;
  scope: AdjustmentScope;
  adjustmentType: AdjustmentType;
  valuePercent: number | null;
  valueCents: number | null;
  reason: string;
  source: AdjustmentSource;
  ruleId: string | null;
  priority: number;
  createdByUserId: string | null;
  effectiveStart: string | null;
  effectiveEnd: string | null;
  status: AdjustmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type TuitionChargeMetadata = {
  sourceChargeId?: string;
  periodYear?: number;
  periodMonth?: number;
};

export type TuitionCharge = {
  id: string;
  organizationId: string;
  assignmentId: string;
  familyId: string;
  guardianId: string | null;
  label: string;
  baseAmountCents: number;
  amountCents: number;
  paidCents: number;
  currency: string;
  dueDate: string;
  status: ChargeStatus;
  chargeType: ChargeType;
  installmentNumber: number | null;
  metadata: TuitionChargeMetadata;
  sentAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TuitionLateFeeOverride = {
  id: string;
  organizationId: string;
  year: number;
  month: number;
  lateFeeDayOfMonth: number;
  createdAt: string;
  updatedAt: string;
};

export type TuitionBillingSplit = {
  id: string;
  organizationId: string;
  familyId: string;
  guardianId: string;
  shareBps: number;
  createdAt: string;
  updatedAt: string;
};

export type BillingSplitInput = {
  guardianId: string;
  shareBps: number;
};

export type TuitionBillingAccountMetadata = {
  autopayByGuardian?: Record<string, boolean>;
  creditByGuardian?: Record<string, number>;
  creditBalanceCents?: number;
};

export type TuitionAdjustmentRule = {
  id: string;
  organizationId: string;
  name: string;
  priority: number;
  conditions: RuleConditions;
  adjustmentType: AdjustmentType;
  valuePercent: number | null;
  valueCents: number | null;
  reason: string;
  autoApply: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RuleCondition =
  | { field: "active_enrollments_in_family"; op: "gte" | "eq"; value: number }
  | { field: "enrollment.program_id"; op: "eq"; value: string }
  | { field: "guardian_has_role"; op: "eq"; value: string }
  | {
      field: "checklist_response";
      item_key: string;
      response_value: string;
    };

export type RuleConditions = {
  all?: RuleCondition[];
  any?: RuleCondition[];
};

export type TuitionOrgSettings = {
  graceDays?: number;
  lateFeeAmountCents?: number;
  lateFeeDayOfMonth?: number;
  lateFeeRecurring?: boolean;
  lateFeeEnabled?: boolean;
  reminderDaysBefore?: number[];
};

export type FamilyBillingReadinessState =
  | "ready"
  | "needs_assignment"
  | "needs_payment_plan"
  | "no_charges";

export type UnassignedEnrollmentSummary = {
  enrollmentId: string;
  studentName: string;
  programName: string;
};

export type GuardianAutopayStatus = {
  guardianId: string;
  name: string;
  autopayEnabled: boolean;
  hasPaymentMethod: boolean;
};

export type FamilyBillingSummary = {
  familyId: string;
  familyName: string;
  primaryEmail: string | null;
  children: string[];
  programs: string[];
  balanceDueCents: number;
  paidYtdCents: number;
  nextDue: { date: string; amountCents: number; label: string } | null;
  autopayEnabled: boolean;
  autopayStatus: "off" | "on" | "partial";
  guardianAutopay: GuardianAutopayStatus[];
  hasPaymentMethod: boolean;
  lastAutopayFailedAt: string | null;
  status: "current" | "overdue" | "invoice_sent";
  assignmentIds: string[];
  assignments: FamilyAssignmentSummary[];
  unassignedEnrollments: UnassignedEnrollmentSummary[];
  readiness: FamilyBillingReadinessState;
  billingSplitSummary: string | null;
  hasBillingSplit: boolean;
};

export type RatePlanWithDetails = TuitionRatePlan & {
  paymentPlans: TuitionPaymentPlan[];
  feeComponents: TuitionFeeComponent[];
  tiers: TuitionRateTier[];
  programName?: string | null;
};
