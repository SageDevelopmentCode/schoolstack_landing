export type RawKpiChargeRow = {
  id: string;
  family_id: string;
  assignment_id: string;
  label: string;
  amount_cents: number;
  paid_cents: number | null;
  status: string;
  due_date: string;
  paid_at: string | null;
};

export function remainingChargeBalanceCents(charge: RawKpiChargeRow): number {
  const amountCents = Number(charge.amount_cents);
  const paidCents = Number(charge.paid_cents ?? 0);
  return Math.max(0, amountCents - paidCents);
}
