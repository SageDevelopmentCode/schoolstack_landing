import type {
  TuitionAdjustment,
  TuitionBillingAccount,
  TuitionBillingSplit,
  TuitionCharge,
  TuitionEnrollmentAssignment,
  TuitionFeeComponent,
  TuitionPaymentPlan,
  TuitionRatePlan,
  TuitionRateTier,
  TuitionAdjustmentRule,
} from "./types";

export function rowToRatePlan(row: Record<string, unknown>): TuitionRatePlan {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    programId: row.program_id ? String(row.program_id) : null,
    name: String(row.name),
    billingBasis: row.billing_basis as TuitionRatePlan["billingBasis"],
    amountCents: Number(row.amount_cents),
    currency: String(row.currency ?? "USD"),
    effectiveStart:
      typeof row.effective_start === "string" ? row.effective_start : null,
    effectiveEnd:
      typeof row.effective_end === "string" ? row.effective_end : null,
    status: row.status as TuitionRatePlan["status"],
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function rowToRateTier(row: Record<string, unknown>): TuitionRateTier {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    ratePlanId: String(row.rate_plan_id),
    code: String(row.code),
    label: String(row.label),
    amountCents: Number(row.amount_cents),
    sortOrder: Number(row.sort_order ?? 0),
    isDefault: Boolean(row.is_default),
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function rowToPaymentPlan(row: Record<string, unknown>): TuitionPaymentPlan {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    ratePlanId: String(row.rate_plan_id),
    name: String(row.name),
    installmentCount: Number(row.installment_count),
    installmentAmountCents: Number(row.installment_amount_cents),
    billingDayOfMonth:
      typeof row.billing_day_of_month === "number"
        ? row.billing_day_of_month
        : null,
    isDefault: Boolean(row.is_default),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function rowToFeeComponent(row: Record<string, unknown>): TuitionFeeComponent {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    ratePlanId: String(row.rate_plan_id),
    code: String(row.code),
    label: String(row.label),
    amountCents: Number(row.amount_cents),
    currency: String(row.currency ?? "USD"),
    timing: row.timing as TuitionFeeComponent["timing"],
    required: Boolean(row.required),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function rowToBillingAccount(
  row: Record<string, unknown>,
): TuitionBillingAccount {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    familyId: String(row.family_id),
    autopayEnabled: Boolean(row.autopay_enabled),
    defaultPaymentMethodId:
      typeof row.default_payment_method_id === "string"
        ? row.default_payment_method_id
        : null,
    billingEmail:
      typeof row.billing_email === "string" ? row.billing_email : null,
    status: row.status as TuitionBillingAccount["status"],
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function parseAssignmentMetadata(
  value: unknown,
): TuitionEnrollmentAssignment["metadata"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const record = value as Record<string, unknown>;
  return {
    pendingPaymentPlanSelection: record.pendingPaymentPlanSelection === true,
  };
}

export function rowToAssignment(
  row: Record<string, unknown>,
): TuitionEnrollmentAssignment {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    enrollmentId: String(row.enrollment_id),
    familyId: String(row.family_id),
    ratePlanId: String(row.rate_plan_id),
    rateTierId:
      typeof row.rate_tier_id === "string" ? row.rate_tier_id : null,
    paymentPlanId: String(row.payment_plan_id),
    assignmentSource: row.assignment_source as TuitionEnrollmentAssignment["assignmentSource"],
    assignedByUserId:
      typeof row.assigned_by_user_id === "string"
        ? row.assigned_by_user_id
        : null,
    effectiveStart:
      typeof row.effective_start === "string" ? row.effective_start : null,
    effectiveEnd:
      typeof row.effective_end === "string" ? row.effective_end : null,
    status: row.status as TuitionEnrollmentAssignment["status"],
    metadata: parseAssignmentMetadata(row.metadata),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function rowToAdjustment(row: Record<string, unknown>): TuitionAdjustment {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    assignmentId: String(row.assignment_id),
    scope: row.scope as TuitionAdjustment["scope"],
    adjustmentType: row.adjustment_type as TuitionAdjustment["adjustmentType"],
    valuePercent:
      typeof row.value_percent === "number" || typeof row.value_percent === "string"
        ? Number(row.value_percent)
        : null,
    valueCents:
      typeof row.value_cents === "number" ? row.value_cents : null,
    reason: String(row.reason ?? ""),
    source: row.source as TuitionAdjustment["source"],
    ruleId: typeof row.rule_id === "string" ? row.rule_id : null,
    priority: Number(row.priority ?? 0),
    createdByUserId:
      typeof row.created_by_user_id === "string"
        ? row.created_by_user_id
        : null,
    effectiveStart:
      typeof row.effective_start === "string" ? row.effective_start : null,
    effectiveEnd:
      typeof row.effective_end === "string" ? row.effective_end : null,
    status: row.status as TuitionAdjustment["status"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function parseChargeMetadata(value: unknown): TuitionCharge["metadata"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const record = value as Record<string, unknown>;
  const metadata: TuitionCharge["metadata"] = {};
  if (typeof record.sourceChargeId === "string") {
    metadata.sourceChargeId = record.sourceChargeId;
  }
  if (typeof record.periodYear === "number") {
    metadata.periodYear = record.periodYear;
  }
  if (typeof record.periodMonth === "number") {
    metadata.periodMonth = record.periodMonth;
  }
  return metadata;
}

export function rowToCharge(row: Record<string, unknown>): TuitionCharge {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    assignmentId: String(row.assignment_id),
    familyId: String(row.family_id),
    guardianId:
      typeof row.guardian_id === "string" ? row.guardian_id : null,
    label: String(row.label),
    baseAmountCents: Number(row.base_amount_cents),
    amountCents: Number(row.amount_cents),
    paidCents: Number(row.paid_cents ?? 0),
    currency: String(row.currency ?? "USD"),
    dueDate: String(row.due_date),
    status: row.status as TuitionCharge["status"],
    chargeType: row.charge_type as TuitionCharge["chargeType"],
    installmentNumber:
      typeof row.installment_number === "number"
        ? row.installment_number
        : null,
    metadata: parseChargeMetadata(row.metadata),
    sentAt: typeof row.sent_at === "string" ? row.sent_at : null,
    paidAt: typeof row.paid_at === "string" ? row.paid_at : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function rowToBillingSplit(
  row: Record<string, unknown>,
): TuitionBillingSplit {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    familyId: String(row.family_id),
    guardianId: String(row.guardian_id),
    shareBps: Number(row.share_bps),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function rowToAdjustmentRule(
  row: Record<string, unknown>,
): TuitionAdjustmentRule {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    name: String(row.name),
    priority: Number(row.priority ?? 0),
    conditions:
      row.conditions && typeof row.conditions === "object" && !Array.isArray(row.conditions)
        ? (row.conditions as TuitionAdjustmentRule["conditions"])
        : {},
    adjustmentType: row.adjustment_type as TuitionAdjustmentRule["adjustmentType"],
    valuePercent:
      typeof row.value_percent === "number" || typeof row.value_percent === "string"
        ? Number(row.value_percent)
        : null,
    valueCents:
      typeof row.value_cents === "number" ? row.value_cents : null,
    reason: String(row.reason ?? ""),
    autoApply: Boolean(row.auto_apply),
    active: Boolean(row.active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
