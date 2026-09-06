import type { SupabaseClient } from "@supabase/supabase-js";
import { chargeRemainingCents } from "./billing-splits";
import { getChargeById } from "./charges";
import { rowToCharge } from "./row-mappers";
import type { TuitionBillingAccountMetadata, TuitionCharge } from "./types";

const OPEN_CHARGE_STATUSES = new Set(["scheduled", "sent", "overdue"]);
const OPEN_LATE_FEE_STATUSES = ["scheduled", "sent", "overdue"] as const;

export function billingPeriodFromDueDate(dueDate: string): {
  year: number;
  month: number;
} {
  const date = new Date(`${dueDate}T00:00:00Z`);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  };
}

async function voidOpenLateFeesForPaidTuitionPeriod(
  supabase: SupabaseClient,
  charge: TuitionCharge,
): Promise<void> {
  if (charge.chargeType !== "tuition") return;

  const { year, month } = billingPeriodFromDueDate(charge.dueDate);

  const { data: openLateFees, error } = await supabase
    .from("tuition_charges")
    .select("id, metadata")
    .eq("assignment_id", charge.assignmentId)
    .eq("charge_type", "late_fee")
    .in("status", [...OPEN_LATE_FEE_STATUSES]);

  if (error) throw error;

  const orphanLateFeeIds = (openLateFees ?? [])
    .filter((row) => {
      const metadata = row.metadata;
      if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
        return false;
      }
      const record = metadata as Record<string, unknown>;
      return record.periodYear === year && record.periodMonth === month;
    })
    .map((row) => String(row.id));

  if (orphanLateFeeIds.length === 0) return;

  const { error: voidError } = await supabase
    .from("tuition_charges")
    .update({ status: "void" })
    .in("id", orphanLateFeeIds);

  if (voidError) throw voidError;
}

export type InstallmentChargeBalance = {
  amountCents: number;
  paidCents: number;
};

export type InstallmentRedistributionPreview = {
  futureInstallmentCount: number;
  projectedAmountsCents: number[];
  newTotalRemainingCents: number;
  creditBalanceCents: number;
  fullyPaid: boolean;
};

export function previewInstallmentRedistribution(input: {
  openCharges: InstallmentChargeBalance[];
  surplusCents: number;
}): InstallmentRedistributionPreview {
  if (input.surplusCents <= 0 || input.openCharges.length === 0) {
    const remainingBalances = input.openCharges.map((charge) =>
      Math.max(0, charge.amountCents - charge.paidCents),
    );
    return {
      futureInstallmentCount: input.openCharges.length,
      projectedAmountsCents: remainingBalances,
      newTotalRemainingCents: remainingBalances.reduce((sum, value) => sum + value, 0),
      creditBalanceCents: 0,
      fullyPaid: false,
    };
  }

  const remainingBalances = input.openCharges.map((charge) =>
    Math.max(0, charge.amountCents - charge.paidCents),
  );
  const totalRemaining = remainingBalances.reduce((sum, value) => sum + value, 0);
  const newTotalRemaining = Math.max(0, totalRemaining - input.surplusCents);
  const creditBalanceCents = Math.max(0, input.surplusCents - totalRemaining);

  if (newTotalRemaining === 0) {
    return {
      futureInstallmentCount: input.openCharges.length,
      projectedAmountsCents: input.openCharges.map((charge) => charge.paidCents),
      newTotalRemainingCents: 0,
      creditBalanceCents,
      fullyPaid: true,
    };
  }

  const count = input.openCharges.length;
  const baseAmount = Math.floor(newTotalRemaining / count);
  let remainder = newTotalRemaining - baseAmount * count;

  const projectedAmountsCents = input.openCharges.map((charge) => {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder -= 1;
    return charge.paidCents + baseAmount + extra;
  });

  return {
    futureInstallmentCount: count,
    projectedAmountsCents,
    newTotalRemainingCents: newTotalRemaining,
    creditBalanceCents: 0,
    fullyPaid: false,
  };
}

export function previewTuitionPaymentRedistribution(input: {
  currentChargeRemainingCents: number;
  paymentAmountCents: number;
  futureOpenCharges: InstallmentChargeBalance[];
}): InstallmentRedistributionPreview & { surplusCents: number } {
  const surplusCents = Math.max(
    0,
    input.paymentAmountCents - input.currentChargeRemainingCents,
  );
  const preview = previewInstallmentRedistribution({
    openCharges: input.futureOpenCharges,
    surplusCents,
  });
  return { ...preview, surplusCents };
}

export type SettleTuitionPaymentInput = {
  chargeId: string;
  amountCents: number;
  payerUserId?: string | null;
  paymentId?: string | null;
};

export type SettleTuitionPaymentResult = {
  charge: TuitionCharge;
  appliedCents: number;
  surplusCents: number;
  redistributed: boolean;
};

function parseBillingMetadata(
  metadata: Record<string, unknown>,
): TuitionBillingAccountMetadata {
  const autopayByGuardian =
    metadata.autopayByGuardian &&
    typeof metadata.autopayByGuardian === "object" &&
    !Array.isArray(metadata.autopayByGuardian)
      ? (metadata.autopayByGuardian as Record<string, boolean>)
      : undefined;

  const creditByGuardian =
    metadata.creditByGuardian &&
    typeof metadata.creditByGuardian === "object" &&
    !Array.isArray(metadata.creditByGuardian)
      ? Object.fromEntries(
          Object.entries(metadata.creditByGuardian).map(([key, value]) => [
            key,
            Number(value),
          ]),
        )
      : undefined;

  return {
    autopayByGuardian,
    creditByGuardian,
    creditBalanceCents:
      typeof metadata.creditBalanceCents === "number"
        ? metadata.creditBalanceCents
        : undefined,
  };
}

async function storeGuardianCredit(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    guardianId: string | null;
    surplusCents: number;
  },
): Promise<void> {
  if (input.surplusCents <= 0) return;

  const { data: account, error } = await supabase
    .from("tuition_billing_accounts")
    .select("*")
    .eq("organization_id", input.organizationId)
    .eq("family_id", input.familyId)
    .maybeSingle();

  if (error) throw error;

  const existingMetadata =
    account?.metadata &&
    typeof account.metadata === "object" &&
    !Array.isArray(account.metadata)
      ? (account.metadata as Record<string, unknown>)
      : {};

  const parsed = parseBillingMetadata(existingMetadata);
  const creditByGuardian = { ...(parsed.creditByGuardian ?? {}) };
  const creditKey = input.guardianId ?? "family";
  creditByGuardian[creditKey] = (creditByGuardian[creditKey] ?? 0) + input.surplusCents;

  const nextMetadata = {
    ...existingMetadata,
    creditByGuardian,
    creditBalanceCents:
      (parsed.creditBalanceCents ?? 0) + input.surplusCents,
  };

  if (account) {
    const { error: updateError } = await supabase
      .from("tuition_billing_accounts")
      .update({ metadata: nextMetadata })
      .eq("id", account.id);
    if (updateError) throw updateError;
    return;
  }

  const { error: insertError } = await supabase
    .from("tuition_billing_accounts")
    .insert({
      organization_id: input.organizationId,
      family_id: input.familyId,
      metadata: nextMetadata,
    });
  if (insertError) throw insertError;
}

export async function redistributeOpenInstallments(
  supabase: SupabaseClient,
  input: {
    assignmentId: string;
    guardianId: string | null;
    surplusCents: number;
    organizationId: string;
    familyId: string;
  },
): Promise<boolean> {
  if (input.surplusCents <= 0) return false;

  let query = supabase
    .from("tuition_charges")
    .select("*")
    .eq("assignment_id", input.assignmentId)
    .in("status", [...OPEN_CHARGE_STATUSES]);

  if (input.guardianId) {
    query = query.eq("guardian_id", input.guardianId);
  } else {
    query = query.is("guardian_id", null);
  }

  const { data: openCharges, error } = await query.order("due_date", {
    ascending: true,
  });
  if (error) throw error;
  if (!openCharges?.length) {
    await storeGuardianCredit(supabase, input);
    return false;
  }

  const chargeBalances: InstallmentChargeBalance[] = openCharges.map((charge) => ({
    amountCents: Number(charge.amount_cents),
    paidCents: Number(charge.paid_cents ?? 0),
  }));

  const preview = previewInstallmentRedistribution({
    openCharges: chargeBalances,
    surplusCents: input.surplusCents,
  });

  if (preview.creditBalanceCents > 0) {
    await storeGuardianCredit(supabase, {
      ...input,
      surplusCents: preview.creditBalanceCents,
    });
  }

  for (let index = 0; index < openCharges.length; index++) {
    const charge = openCharges[index]!;
    const nextAmountCents = preview.projectedAmountsCents[index]!;

    const { error: updateError } = await supabase
      .from("tuition_charges")
      .update({ amount_cents: nextAmountCents })
      .eq("id", charge.id);
    if (updateError) throw updateError;
  }

  return true;
}

export async function settleTuitionPayment(
  supabase: SupabaseClient,
  input: SettleTuitionPaymentInput,
): Promise<SettleTuitionPaymentResult> {
  const charge = await getChargeById(supabase, input.chargeId);
  if (!charge) {
    throw new Error("Charge not found.");
  }

  const remainingCents = chargeRemainingCents(charge);
  if (remainingCents <= 0) {
    return {
      charge,
      appliedCents: 0,
      surplusCents: input.amountCents,
      redistributed: false,
    };
  }

  const appliedCents = Math.min(input.amountCents, remainingCents);
  const surplusCents = Math.max(0, input.amountCents - remainingCents);
  const nextPaidCents = charge.paidCents + appliedCents;
  const isFullyPaid = nextPaidCents >= charge.amountCents;

  const patch: Record<string, unknown> = {
    paid_cents: nextPaidCents,
  };

  if (isFullyPaid) {
    patch.status = "paid";
    patch.paid_at = new Date().toISOString();
  }

  const { data: updatedRow, error: updateError } = await supabase
    .from("tuition_charges")
    .update(patch)
    .eq("id", charge.id)
    .select("*")
    .single();

  if (updateError) throw updateError;

  const settledCharge = rowToCharge(updatedRow);

  if (isFullyPaid && settledCharge.chargeType === "tuition") {
    await voidOpenLateFeesForPaidTuitionPeriod(supabase, settledCharge);
  }

  if (input.paymentId) {
    const { error: paymentError } = await supabase
      .from("application_payments")
      .update({ amount_applied_cents: appliedCents })
      .eq("id", input.paymentId);
    if (paymentError) throw paymentError;
  }

  let redistributed = false;
  if (surplusCents > 0) {
    redistributed = await redistributeOpenInstallments(supabase, {
      assignmentId: charge.assignmentId,
      guardianId: charge.guardianId,
      surplusCents,
      organizationId: charge.organizationId,
      familyId: charge.familyId,
    });
  }

  return {
    charge: settledCharge,
    appliedCents,
    surplusCents,
    redistributed,
  };
}

export function getAutopayEnabledForGuardian(
  account: { autopayEnabled: boolean; metadata: Record<string, unknown> },
  guardianId: string | null,
): boolean {
  const parsed = parseBillingMetadata(account.metadata);
  if (guardianId && parsed.autopayByGuardian) {
    return parsed.autopayByGuardian[guardianId] === true;
  }
  return account.autopayEnabled;
}

export async function setAutopayForGuardian(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    guardianId: string | null;
    enabled: boolean;
  },
): Promise<void> {
  const { data: existing, error: existingError } = await supabase
    .from("tuition_billing_accounts")
    .select("*")
    .eq("organization_id", input.organizationId)
    .eq("family_id", input.familyId)
    .maybeSingle();

  if (existingError) throw existingError;

  const existingMetadata =
    existing?.metadata &&
    typeof existing.metadata === "object" &&
    !Array.isArray(existing.metadata)
      ? (existing.metadata as Record<string, unknown>)
      : {};

  const { data: splitRows, error: splitsError } = await supabase
    .from("tuition_billing_splits")
    .select("id")
    .eq("family_id", input.familyId)
    .limit(1);

  if (splitsError) throw splitsError;
  const hasBillingSplit = (splitRows?.length ?? 0) > 0;

  const parsed = parseBillingMetadata(existingMetadata);
  const autopayByGuardian = { ...(parsed.autopayByGuardian ?? {}) };

  if (input.guardianId) {
    autopayByGuardian[input.guardianId] = input.enabled;
  }

  const nextMetadata = {
    ...existingMetadata,
    autopayByGuardian,
  };

  if (existing) {
    const patch: Record<string, unknown> = { metadata: nextMetadata };
    if (!input.guardianId || !hasBillingSplit) {
      patch.autopay_enabled = input.enabled;
    }

    const { error } = await supabase
      .from("tuition_billing_accounts")
      .update(patch)
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("tuition_billing_accounts").insert({
    organization_id: input.organizationId,
    family_id: input.familyId,
    autopay_enabled:
      input.guardianId && hasBillingSplit ? false : input.enabled,
    metadata: nextMetadata,
  });
  if (error) throw error;
}

export async function resolveGuardianIdForUser(
  supabase: SupabaseClient,
  input: { familyId: string; userId: string },
): Promise<string | null> {
  const { data, error } = await supabase
    .from("guardians")
    .select("id")
    .eq("family_id", input.familyId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (error) throw error;
  return data ? String(data.id) : null;
}

export function rowToBillingAccountMetadata(
  metadata: Record<string, unknown>,
): TuitionBillingAccountMetadata {
  return parseBillingMetadata(metadata);
}
