import type { SupabaseClient } from "@supabase/supabase-js";
import type { TuitionLateFeeOverride } from "./types";

function rowToLateFeeOverride(row: Record<string, unknown>): TuitionLateFeeOverride {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    year: Number(row.year),
    month: Number(row.month),
    lateFeeDayOfMonth: Number(row.late_fee_day_of_month),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function listLateFeeOverrides(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TuitionLateFeeOverride[]> {
  const { data, error } = await supabase
    .from("tuition_late_fee_overrides")
    .select("*")
    .eq("organization_id", organizationId)
    .order("year", { ascending: true })
    .order("month", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToLateFeeOverride);
}

export async function upsertLateFeeOverride(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    year: number;
    month: number;
    lateFeeDayOfMonth: number;
  },
): Promise<TuitionLateFeeOverride> {
  const { data, error } = await supabase
    .from("tuition_late_fee_overrides")
    .upsert(
      {
        organization_id: input.organizationId,
        year: input.year,
        month: input.month,
        late_fee_day_of_month: input.lateFeeDayOfMonth,
      },
      { onConflict: "organization_id,year,month" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return rowToLateFeeOverride(data);
}

export async function deleteLateFeeOverride(
  supabase: SupabaseClient,
  overrideId: string,
): Promise<void> {
  const { error } = await supabase
    .from("tuition_late_fee_overrides")
    .delete()
    .eq("id", overrideId);

  if (error) throw error;
}

export function getEffectiveLateFeeDay(
  settings: { lateFeeDayOfMonth: number },
  overrides: TuitionLateFeeOverride[],
  year: number,
  month: number,
): number {
  const override = overrides.find((row) => row.year === year && row.month === month);
  return override?.lateFeeDayOfMonth ?? settings.lateFeeDayOfMonth;
}
