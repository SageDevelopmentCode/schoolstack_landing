import type { SupabaseClient } from "@supabase/supabase-js";
import { rowToBillingSplit } from "./row-mappers";
import {
  ACTIVITY_ACTIONS,
  logTuitionActivity,
  summarizeBillingSplitChanges,
  type TuitionActivityOptions,
} from "./tuition-activity";
import type { BillingSplitInput, TuitionBillingSplit } from "./types";

export const TOTAL_SHARE_BPS = 10_000;

export type SplitAllocation = {
  guardianId: string;
  shareBps: number;
  amountCents: number;
};

export function validateBillingSplits(splits: BillingSplitInput[]): void {
  if (splits.length < 2) {
    throw new Error("Split billing requires at least two guardians.");
  }

  const guardianIds = new Set<string>();
  let totalBps = 0;

  for (const split of splits) {
    if (!split.guardianId.trim()) {
      throw new Error("Each split must reference a guardian.");
    }
    if (guardianIds.has(split.guardianId)) {
      throw new Error("Duplicate guardian in billing split.");
    }
    guardianIds.add(split.guardianId);

    if (!Number.isInteger(split.shareBps) || split.shareBps <= 0) {
      throw new Error("Each share must be a positive whole number of basis points.");
    }
    totalBps += split.shareBps;
  }

  if (totalBps !== TOTAL_SHARE_BPS) {
    throw new Error("Billing splits must total 100%.");
  }
}

export function splitAmountCents(
  totalCents: number,
  splits: Array<Pick<BillingSplitInput, "guardianId" | "shareBps">>,
): SplitAllocation[] {
  if (totalCents <= 0 || splits.length === 0) return [];

  const allocations: SplitAllocation[] = [];
  let allocated = 0;

  for (let index = 0; index < splits.length; index++) {
    const split = splits[index]!;
    const isLast = index === splits.length - 1;
    const amountCents = isLast
      ? totalCents - allocated
      : Math.round((totalCents * split.shareBps) / TOTAL_SHARE_BPS);

    allocations.push({
      guardianId: split.guardianId,
      shareBps: split.shareBps,
      amountCents,
    });
    allocated += amountCents;
  }

  return allocations;
}

export function formatBillingSplitSummary(
  splits: Array<TuitionBillingSplit & { guardianName?: string }>,
): string {
  return splits
    .map((split) => {
      const pct = (split.shareBps / 100).toFixed(
        split.shareBps % 100 === 0 ? 0 : 1,
      );
      const name = split.guardianName ?? "Guardian";
      return `${pct}% ${name}`;
    })
    .join(" / ");
}

export async function listBillingSplits(
  supabase: SupabaseClient,
  familyId: string,
): Promise<TuitionBillingSplit[]> {
  const { data, error } = await supabase
    .from("tuition_billing_splits")
    .select("*")
    .eq("family_id", familyId)
    .order("share_bps", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToBillingSplit);
}

export async function upsertBillingSplits(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    splits: BillingSplitInput[];
  },
  options?: TuitionActivityOptions,
): Promise<TuitionBillingSplit[]> {
  const beforeSplits = await listBillingSplits(supabase, input.familyId);
  validateBillingSplits(input.splits);

  const { error: deleteError } = await supabase
    .from("tuition_billing_splits")
    .delete()
    .eq("family_id", input.familyId);

  if (deleteError) throw deleteError;

  const { data, error } = await supabase
    .from("tuition_billing_splits")
    .insert(
      input.splits.map((split) => ({
        organization_id: input.organizationId,
        family_id: input.familyId,
        guardian_id: split.guardianId,
        share_bps: split.shareBps,
      })),
    )
    .select("*");

  if (error) throw error;
  const result = (data ?? []).map(rowToBillingSplit);

  if (!options?.skip) {
    const changeSummary = summarizeBillingSplitChanges({
      enabled: true,
      beforeSplits: beforeSplits.map((split) => ({
        guardianId: split.guardianId,
        shareBps: split.shareBps,
      })),
      afterSplits: input.splits,
    });
    void logTuitionActivity(supabase, {
      organizationId: input.organizationId,
      action: ACTIVITY_ACTIONS.TUITION_BILLING_SPLITS_UPDATED,
      entityType: "family",
      entityId: input.familyId,
      summary: "Updated billing splits",
      changeSummary,
      logWhenEmpty: true,
      context: options?.context,
    });
  }

  return result;
}

export async function clearBillingSplits(
  supabase: SupabaseClient,
  familyId: string,
  organizationId?: string,
  options?: TuitionActivityOptions,
): Promise<void> {
  const { error } = await supabase
    .from("tuition_billing_splits")
    .delete()
    .eq("family_id", familyId);

  if (error) throw error;

  if (!options?.skip && organizationId) {
    const changeSummary = summarizeBillingSplitChanges({ enabled: false });
    void logTuitionActivity(supabase, {
      organizationId,
      action: ACTIVITY_ACTIONS.TUITION_BILLING_SPLITS_UPDATED,
      entityType: "family",
      entityId: familyId,
      summary: "Disabled billing splits",
      changeSummary,
      logWhenEmpty: true,
      context: options?.context,
    });
  }
}

export async function listBillingSplitsWithGuardians(
  supabase: SupabaseClient,
  familyId: string,
): Promise<Array<TuitionBillingSplit & { guardianName: string }>> {
  const { data, error } = await supabase
    .from("tuition_billing_splits")
    .select("*, guardians(first_name, last_name)")
    .eq("family_id", familyId)
    .order("share_bps", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const guardian = row.guardians as
      | { first_name?: string; last_name?: string }
      | null
      | undefined;
    const guardianName = guardian
      ? [guardian.first_name, guardian.last_name].filter(Boolean).join(" ").trim()
      : "Guardian";

    return {
      ...rowToBillingSplit(row as Record<string, unknown>),
      guardianName: guardianName || "Guardian",
    };
  });
}

export function chargeRemainingCents(charge: {
  amountCents: number;
  paidCents: number;
}): number {
  return Math.max(0, charge.amountCents - charge.paidCents);
}

export function payerLabelSuffix(firstName: string): string {
  const trimmed = firstName.trim();
  if (!trimmed) return "";
  return ` (${trimmed})`;
}
