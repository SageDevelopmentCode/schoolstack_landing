import type { SupabaseClient } from "@supabase/supabase-js";
import { rowToRateTier } from "./row-mappers";
import type { TuitionRateTier } from "./types";

export type TierUpsertInput = {
  code: string;
  label: string;
  amountCents: number;
  sortOrder: number;
  isDefault: boolean;
  metadata?: Record<string, unknown>;
};

export function slugifyTierCode(label: string, index = 0): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

  if (base) return base;
  return index > 0 ? `tier_${index}` : "tier";
}

export async function getDefaultTierForRatePlan(
  supabase: SupabaseClient,
  ratePlanId: string,
): Promise<TuitionRateTier | null> {
  const tiers = await listTiersForRatePlan(supabase, ratePlanId);
  if (tiers.length === 0) return null;
  return tiers.find((tier) => tier.isDefault) ?? tiers[0] ?? null;
}

export async function getTierById(
  supabase: SupabaseClient,
  tierId: string,
): Promise<TuitionRateTier | null> {
  const { data, error } = await supabase
    .from("tuition_rate_tiers")
    .select("*")
    .eq("id", tierId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToRateTier(data) : null;
}

export async function listTiersForRatePlan(
  supabase: SupabaseClient,
  ratePlanId: string,
): Promise<TuitionRateTier[]> {
  const { data, error } = await supabase
    .from("tuition_rate_tiers")
    .select("*")
    .eq("rate_plan_id", ratePlanId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToRateTier);
}

export async function upsertTiersForRatePlan(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    ratePlanId: string;
    tiers: TierUpsertInput[];
  },
): Promise<TuitionRateTier[]> {
  if (input.tiers.length === 0) {
    throw new Error("At least one tuition tier is required.");
  }

  const defaultCount = input.tiers.filter((tier) => tier.isDefault).length;
  if (defaultCount !== 1) {
    throw new Error("Exactly one tier must be marked as default.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("tuition_rate_tiers")
    .select("*")
    .eq("rate_plan_id", input.ratePlanId);

  if (existingError) throw existingError;

  const desiredCodes = new Set(input.tiers.map((tier) => tier.code));
  const toDelete = (existing ?? []).filter(
    (row) => !desiredCodes.has(String(row.code)),
  );

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("tuition_rate_tiers")
      .delete()
      .in(
        "id",
        toDelete.map((row) => String(row.id)),
      );
    if (deleteError) throw deleteError;
  }

  const results: TuitionRateTier[] = [];

  for (const tier of input.tiers) {
    const existingRow = (existing ?? []).find(
      (row) => String(row.code) === tier.code,
    );

    if (existingRow) {
      const { data, error } = await supabase
        .from("tuition_rate_tiers")
        .update({
          label: tier.label,
          amount_cents: tier.amountCents,
          sort_order: tier.sortOrder,
          is_default: tier.isDefault,
          metadata: tier.metadata ?? {},
        })
        .eq("id", existingRow.id)
        .select("*")
        .single();

      if (error) throw error;
      results.push(rowToRateTier(data));
    } else {
      const { data, error } = await supabase
        .from("tuition_rate_tiers")
        .insert({
          organization_id: input.organizationId,
          rate_plan_id: input.ratePlanId,
          code: tier.code,
          label: tier.label,
          amount_cents: tier.amountCents,
          sort_order: tier.sortOrder,
          is_default: tier.isDefault,
          metadata: tier.metadata ?? {},
        })
        .select("*")
        .single();

      if (error) throw error;
      results.push(rowToRateTier(data));
    }
  }

  const defaultTier = input.tiers.find((tier) => tier.isDefault);
  if (defaultTier) {
    await supabase
      .from("tuition_rate_tiers")
      .update({ is_default: false })
      .eq("rate_plan_id", input.ratePlanId)
      .neq("code", defaultTier.code);

    await supabase
      .from("tuition_rate_tiers")
      .update({ is_default: true })
      .eq("rate_plan_id", input.ratePlanId)
      .eq("code", defaultTier.code);
  }

  return results.sort((a, b) => a.sortOrder - b.sortOrder);
}
