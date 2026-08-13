import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
  type ActivitySeverity,
  type ActivitySurface,
  type ActorType,
} from "@/lib/activity-log";
import { formatCents } from "./pricing";
import type {
  BillingSplitInput,
  TuitionAdjustment,
  TuitionAdjustmentRule,
  TuitionEnrollmentAssignment,
  TuitionLateFeeOverride,
  TuitionOrgSettings,
  TuitionRatePlan,
} from "./types";

export type TuitionChangeSummary = {
  changedFields: string[];
  changes: string[];
};

export type TuitionActivityContext = {
  actorType: ActorType;
  actorUserId?: string | null;
  actorEmail?: string | null;
  actorName?: string | null;
  surface: ActivitySurface;
};

export type TuitionActivityOptions = {
  context?: TuitionActivityContext;
  skip?: boolean;
};

export type LogTuitionActivityInput = {
  organizationId: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  summary: string;
  changeSummary?: TuitionChangeSummary;
  metadata?: Record<string, unknown>;
  severity?: ActivitySeverity;
  logWhenEmpty?: boolean;
  context?: TuitionActivityContext;
};

export type BillingRunCounts = {
  overdueCount?: number;
  remindersSent?: number;
  rulesEvaluated?: number;
  lateFeesApplied?: number;
  lateFeesNotified?: number;
  autopayProcessed?: number;
  autopayFailed?: number;
  autopaySkipped?: number;
  autopayDueCandidates?: number;
};

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

export function schoolAdminActivityContext(user: {
  id: string;
  email?: string | null;
}): TuitionActivityContext {
  return {
    actorType: "school_admin",
    actorUserId: user.id,
    actorEmail: user.email ?? null,
    surface: "school_admin",
  };
}

export function systemActivityContext(): TuitionActivityContext {
  return {
    actorType: "system",
    surface: "system",
  };
}

export function parentActivityContext(user: {
  id: string;
  email?: string | null;
}): TuitionActivityContext {
  return {
    actorType: "parent",
    actorUserId: user.id,
    actorEmail: user.email ?? null,
    surface: "parent_portal",
  };
}

export async function logTuitionActivity(
  supabase: SupabaseClient,
  input: LogTuitionActivityInput,
): Promise<string | null> {
  const changeSummary = input.changeSummary ?? {
    changedFields: [],
    changes: [],
  };

  if (
    changeSummary.changes.length === 0 &&
    !input.logWhenEmpty
  ) {
    return null;
  }

  const context = input.context;
  return logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: context?.actorType ?? "school_admin",
    actorUserId: context?.actorUserId,
    actorEmail: context?.actorEmail,
    actorName: context?.actorName,
    surface: context?.surface ?? "school_admin",
    action: input.action,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    summary: input.summary,
    metadata: {
      ...input.metadata,
      changedFields: changeSummary.changedFields,
      changes: changeSummary.changes,
    },
    severity: input.severity ?? "info",
  });
}

export function summarizeRatePlanChanges(
  before: TuitionRatePlan | null,
  after: TuitionRatePlan,
): TuitionChangeSummary {
  if (!before) {
    return {
      changedFields: ["created"],
      changes: [
        `Created rate plan “${after.name}” (${formatCents(after.amountCents)} ${after.billingBasis})`,
      ],
    };
  }

  const changedFields: string[] = [];
  const changes: string[] = [];

  if (before.name !== after.name) {
    changedFields.push("name");
    changes.push(`Renamed rate plan from “${before.name}” to “${after.name}”`);
  }
  if (before.amountCents !== after.amountCents) {
    changedFields.push("amountCents");
    changes.push(
      `Annual amount changed from ${formatCents(before.amountCents)} to ${formatCents(after.amountCents)}`,
    );
  }
  if (before.billingBasis !== after.billingBasis) {
    changedFields.push("billingBasis");
    changes.push(
      `Billing basis changed from ${before.billingBasis} to ${after.billingBasis}`,
    );
  }
  if (before.status !== after.status) {
    changedFields.push("status");
    changes.push(`Status changed from ${before.status} to ${after.status}`);
  }
  if (before.programId !== after.programId) {
    changedFields.push("programId");
    changes.push("Updated linked program");
  }
  if (
    (before.effectiveStart ?? "") !== (after.effectiveStart ?? "") ||
    (before.effectiveEnd ?? "") !== (after.effectiveEnd ?? "")
  ) {
    changedFields.push("effectiveDates");
    changes.push("Updated effective dates");
  }

  return { changedFields, changes };
}

export function summarizeRatePlanChildChanges(input: {
  tierCount?: number;
  paymentPlanCount?: number;
  feeCount?: number;
  paymentCounts?: number[];
}): string[] {
  const changes: string[] = [];
  if (input.tierCount != null) {
    changes.push(`Configured ${input.tierCount} rate tier${input.tierCount === 1 ? "" : "s"}`);
  }
  if (input.paymentPlanCount != null) {
    changes.push(
      `Configured ${input.paymentPlanCount} payment schedule option${input.paymentPlanCount === 1 ? "" : "s"}`,
    );
  } else if (input.paymentCounts?.length) {
    changes.push(
      `Payment options: ${input.paymentCounts.join(", ")} installment${input.paymentCounts.length === 1 ? "" : "s"}`,
    );
  }
  if (input.feeCount != null) {
    changes.push(`Configured ${input.feeCount} fee component${input.feeCount === 1 ? "" : "s"}`);
  }
  return changes;
}

export function summarizeAssignmentChanges(
  before: TuitionEnrollmentAssignment | null,
  after: TuitionEnrollmentAssignment,
  labels?: {
    ratePlanName?: string;
    tierLabel?: string;
    paymentPlanName?: string;
    familyName?: string;
    studentName?: string;
  },
): TuitionChangeSummary {
  if (!before) {
    const subject = labels?.studentName ?? labels?.familyName ?? "enrollment";
    return {
      changedFields: ["created"],
      changes: [
        `Assigned tuition to ${subject}${labels?.ratePlanName ? ` (${labels.ratePlanName})` : ""}`,
      ],
    };
  }

  const changedFields: string[] = [];
  const changes: string[] = [];

  if (before.ratePlanId !== after.ratePlanId) {
    changedFields.push("ratePlanId");
    changes.push(
      labels?.ratePlanName
        ? `Changed rate plan to “${labels.ratePlanName}”`
        : "Changed rate plan",
    );
  }
  if (before.rateTierId !== after.rateTierId) {
    changedFields.push("rateTierId");
    changes.push(
      labels?.tierLabel
        ? `Changed rate tier to “${labels.tierLabel}”`
        : "Changed rate tier",
    );
  }
  if (before.paymentPlanId !== after.paymentPlanId) {
    changedFields.push("paymentPlanId");
    changes.push(
      labels?.paymentPlanName
        ? `Changed payment plan to “${labels.paymentPlanName}”`
        : "Changed payment plan",
    );
  }
  if (before.status !== after.status) {
    changedFields.push("status");
    changes.push(`Assignment status changed from ${before.status} to ${after.status}`);
  }
  if (
    stableJson(before.metadata) !== stableJson(after.metadata) &&
    !changedFields.includes("paymentPlanId")
  ) {
    changedFields.push("metadata");
    if (after.metadata.pendingPaymentPlanSelection === false) {
      changes.push("Payment plan selection finalized");
    }
  }

  return { changedFields, changes };
}

export function summarizeOrgSettingsChanges(
  before: TuitionOrgSettings,
  after: TuitionOrgSettings,
): TuitionChangeSummary {
  const changedFields: string[] = [];
  const changes: string[] = [];

  if (before.graceDays !== after.graceDays) {
    changedFields.push("graceDays");
    changes.push(
      `Grace period changed from ${before.graceDays ?? "default"} to ${after.graceDays ?? "default"} days`,
    );
  }
  if (before.lateFeeEnabled !== after.lateFeeEnabled) {
    changedFields.push("lateFeeEnabled");
    changes.push(
      after.lateFeeEnabled ? "Enabled late fees" : "Disabled late fees",
    );
  }
  if (before.lateFeeAmountCents !== after.lateFeeAmountCents) {
    changedFields.push("lateFeeAmountCents");
    changes.push(
      `Late fee amount changed from ${formatCents(before.lateFeeAmountCents ?? 0)} to ${formatCents(after.lateFeeAmountCents ?? 0)}`,
    );
  }
  if (before.lateFeeDayOfMonth !== after.lateFeeDayOfMonth) {
    changedFields.push("lateFeeDayOfMonth");
    changes.push(
      `Late fee day of month changed from ${before.lateFeeDayOfMonth ?? "default"} to ${after.lateFeeDayOfMonth ?? "default"}`,
    );
  }
  if (before.lateFeeRecurring !== after.lateFeeRecurring) {
    changedFields.push("lateFeeRecurring");
    changes.push(
      after.lateFeeRecurring
        ? "Late fees are now recurring"
        : "Late fees are no longer recurring",
    );
  }
  if (
    stableJson(before.reminderDaysBefore) !==
    stableJson(after.reminderDaysBefore)
  ) {
    changedFields.push("reminderDaysBefore");
    changes.push("Updated payment reminder schedule");
  }

  return { changedFields, changes };
}

export function summarizeAdjustmentRuleChanges(
  before: TuitionAdjustmentRule | null,
  after: TuitionAdjustmentRule,
): TuitionChangeSummary {
  if (!before) {
    return {
      changedFields: ["created"],
      changes: [`Created adjustment rule “${after.name}”`],
    };
  }

  const changedFields: string[] = [];
  const changes: string[] = [];

  if (before.name !== after.name) {
    changedFields.push("name");
    changes.push(`Renamed rule from “${before.name}” to “${after.name}”`);
  }
  if (before.priority !== after.priority) {
    changedFields.push("priority");
    changes.push(`Priority changed from ${before.priority} to ${after.priority}`);
  }
  if (before.active !== after.active) {
    changedFields.push("active");
    changes.push(after.active ? "Activated rule" : "Deactivated rule");
  }
  if (before.autoApply !== after.autoApply) {
    changedFields.push("autoApply");
    changes.push(
      after.autoApply ? "Enabled auto-apply" : "Disabled auto-apply",
    );
  }
  if (stableJson(before.conditions) !== stableJson(after.conditions)) {
    changedFields.push("conditions");
    changes.push("Updated rule conditions");
  }

  return { changedFields, changes };
}

export function summarizeAdjustmentCreated(
  adjustment: TuitionAdjustment,
  labels?: { familyName?: string; studentName?: string },
): TuitionChangeSummary {
  const subject = labels?.studentName ?? labels?.familyName ?? "assignment";
  const value =
    adjustment.valuePercent != null
      ? `${adjustment.valuePercent}%`
      : adjustment.valueCents != null
        ? formatCents(adjustment.valueCents)
        : adjustment.adjustmentType;

  return {
    changedFields: ["created"],
    changes: [
      `Added ${adjustment.adjustmentType.replace(/_/g, " ")} (${value}) for ${subject}: ${adjustment.reason}`,
    ],
  };
}

export function summarizeBillingSplitChanges(input: {
  enabled: boolean;
  beforeSplits?: BillingSplitInput[];
  afterSplits?: BillingSplitInput[];
  familyName?: string;
}): TuitionChangeSummary {
  const family = input.familyName ?? "family";

  if (!input.enabled) {
    return {
      changedFields: ["billingSplits"],
      changes: [`Disabled split billing for ${family}`],
    };
  }

  const changes = [`Updated split billing for ${family}`];
  if (input.afterSplits?.length) {
    changes.push(
      `${input.afterSplits.length} guardians with custom shares`,
    );
  }

  return {
    changedFields: ["billingSplits"],
    changes,
  };
}

export function summarizePaymentAction(input: {
  kind: "manual" | "completed" | "refunded" | "invoice_sent";
  amountCents: number;
  chargeLabel: string;
  familyName?: string;
  method?: string;
  recipientEmail?: string;
}): TuitionChangeSummary {
  const family = input.familyName ? ` for ${input.familyName}` : "";
  const amount = formatCents(input.amountCents);

  switch (input.kind) {
    case "manual":
      return {
        changedFields: ["payment"],
        changes: [
          `Recorded manual payment of ${amount}${family} for “${input.chargeLabel}”${input.method ? ` (${input.method})` : ""}`,
        ],
      };
    case "completed":
      return {
        changedFields: ["payment"],
        changes: [`Online tuition payment of ${amount}${family} for “${input.chargeLabel}”`],
      };
    case "refunded":
      return {
        changedFields: ["payment"],
        changes: [`Refunded ${amount}${family} for “${input.chargeLabel}”`],
      };
    case "invoice_sent":
      return {
        changedFields: ["invoice"],
        changes: [
          `Sent invoice for “${input.chargeLabel}” (${amount})${input.recipientEmail ? ` to ${input.recipientEmail}` : ""}`,
        ],
      };
  }
}

export function summarizeBillingRunSummary(
  counts: BillingRunCounts,
  input?: { manual?: boolean },
): TuitionChangeSummary {
  const changes: string[] = [];
  const prefix = input?.manual ? "Manual billing run" : "Billing run";

  if (counts.overdueCount) {
    changes.push(`Marked ${counts.overdueCount} charge${counts.overdueCount === 1 ? "" : "s"} overdue`);
  }
  if (counts.remindersSent) {
    changes.push(`Sent ${counts.remindersSent} payment reminder${counts.remindersSent === 1 ? "" : "s"}`);
  }
  if (counts.rulesEvaluated) {
    changes.push(`Evaluated adjustment rules for ${counts.rulesEvaluated} assignment${counts.rulesEvaluated === 1 ? "" : "s"}`);
  }
  if (counts.lateFeesApplied) {
    changes.push(`Applied ${counts.lateFeesApplied} late fee${counts.lateFeesApplied === 1 ? "" : "s"}`);
  }
  if (counts.autopayProcessed) {
    changes.push(`Processed ${counts.autopayProcessed} autopay charge${counts.autopayProcessed === 1 ? "" : "s"}`);
  }
  if (counts.autopayFailed) {
    changes.push(`${counts.autopayFailed} autopay charge${counts.autopayFailed === 1 ? "" : "s"} failed`);
  }
  if (counts.autopaySkipped) {
    changes.push(`Skipped ${counts.autopaySkipped} autopay candidate${counts.autopaySkipped === 1 ? "" : "s"}`);
  }

  if (changes.length === 0) {
    changes.push(`${prefix} completed with no changes`);
  }

  return {
    changedFields: ["billingRun"],
    changes,
  };
}

export function summarizeLateFeeOverrideChange(
  override: TuitionLateFeeOverride,
  action: "updated" | "deleted",
): TuitionChangeSummary {
  const period = `${override.year}-${String(override.month).padStart(2, "0")}`;
  if (action === "deleted") {
    return {
      changedFields: ["lateFeeOverride"],
      changes: [`Removed late fee override for ${period}`],
    };
  }
  return {
    changedFields: ["lateFeeOverride"],
    changes: [
      `Set late fee day to ${override.lateFeeDayOfMonth} for ${period}`,
    ],
  };
}

export function summarizeAutopayToggle(input: {
  enabled: boolean;
  familyName?: string;
  paymentMethodLabel?: string;
}): TuitionChangeSummary {
  const family = input.familyName ?? "family";
  if (input.enabled) {
    return {
      changedFields: ["autopay"],
      changes: [
        `Enabled autopay for ${family}${input.paymentMethodLabel ? ` (${input.paymentMethodLabel})` : ""}`,
      ],
    };
  }
  return {
    changedFields: ["autopay"],
    changes: [`Disabled autopay for ${family}`],
  };
}

export function summarizeAutopayCharge(input: {
  succeeded: boolean;
  chargeLabel: string;
  amountCents: number;
  familyName?: string;
  errorMessage?: string;
}): TuitionChangeSummary {
  const family = input.familyName ? ` for ${input.familyName}` : "";
  const amount = formatCents(input.amountCents);
  if (input.succeeded) {
    return {
      changedFields: ["autopay"],
      changes: [`Autopay charged ${amount}${family} for “${input.chargeLabel}”`],
    };
  }
  return {
    changedFields: ["autopay"],
    changes: [
      `Autopay failed for “${input.chargeLabel}” (${amount})${family}${input.errorMessage ? `: ${input.errorMessage}` : ""}`,
    ],
  };
}

export function summarizePaymentMethodSaved(input: {
  familyName?: string;
  last4?: string;
  brand?: string;
}): TuitionChangeSummary {
  const family = input.familyName ?? "family";
  const card =
    input.brand && input.last4
      ? `${input.brand} •••• ${input.last4}`
      : input.last4
        ? `•••• ${input.last4}`
        : "payment method";
  return {
    changedFields: ["paymentMethod"],
    changes: [`Saved ${card} for ${family}`],
  };
}

export function summarizeBackfillResult(input: {
  assignedCount: number;
  failedCount: number;
  total: number;
}): TuitionChangeSummary {
  const changes = [
    `Assigned tuition to ${input.assignedCount} of ${input.total} enrollment${input.total === 1 ? "" : "s"}`,
  ];
  if (input.failedCount > 0) {
    changes.push(`${input.failedCount} assignment${input.failedCount === 1 ? "" : "s"} failed`);
  }
  return {
    changedFields: ["backfill"],
    changes,
  };
}

export function summarizeFinancialAidImport(input: {
  imported: number;
  skipped: number;
}): TuitionChangeSummary {
  const changes: string[] = [];
  if (input.imported > 0) {
    changes.push(
      `Imported ${input.imported} financial aid adjustment${input.imported === 1 ? "" : "s"}`,
    );
  }
  if (input.skipped > 0) {
    changes.push(`Skipped ${input.skipped} row${input.skipped === 1 ? "" : "s"}`);
  }
  return {
    changedFields: ["import"],
    changes,
  };
}

export { ACTIVITY_ACTIONS };
