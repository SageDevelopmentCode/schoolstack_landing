import type { SupabaseClient } from "@supabase/supabase-js";

export type ParentBillingPageMeta = {
  balanceDueCents: number;
  totalRemainingCents: number;
  nextDueDate: string | null;
  nextDueAmountCents: number;
  openChargeCount: number;
  paymentCount: number;
  hasBillingSplit: boolean;
};

type ParentBillingPageMetaRow = {
  balance_due_cents?: number | string | null;
  total_remaining_cents?: number | string | null;
  next_due_date?: string | null;
  next_due_amount_cents?: number | string | null;
  open_charge_count?: number | string | null;
  payment_count?: number | string | null;
  has_billing_split?: boolean | null;
};

export function parseParentBillingPageMetaRow(
  row: ParentBillingPageMetaRow | null,
): ParentBillingPageMeta | null {
  if (!row) return null;

  return {
    balanceDueCents: Number(row.balance_due_cents ?? 0),
    totalRemainingCents: Number(row.total_remaining_cents ?? 0),
    nextDueDate: row.next_due_date ?? null,
    nextDueAmountCents: Number(row.next_due_amount_cents ?? 0),
    openChargeCount: Number(row.open_charge_count ?? 0),
    paymentCount: Number(row.payment_count ?? 0),
    hasBillingSplit: Boolean(row.has_billing_split),
  };
}

export async function fetchParentBillingPageMetaFromRpc(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<ParentBillingPageMeta | null> {
  const { data, error } = await supabase.rpc("parent_billing_page_meta", {
    p_organization_id: organizationId,
    p_family_id: familyId,
  });

  if (error) throw error;
  if (!data || typeof data !== "object") return null;

  return parseParentBillingPageMetaRow(data as ParentBillingPageMetaRow);
}
