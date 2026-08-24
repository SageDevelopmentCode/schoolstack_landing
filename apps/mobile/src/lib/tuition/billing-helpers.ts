import type { TuitionCharge } from '@/lib/parent/parent-portal-api';

export const OPEN_CHARGE_STATUSES = new Set(['scheduled', 'sent', 'overdue']);

export const PARENT_BILLING_SUMMARY_TAB = 'summary';

export function chargeRemainingCents(charge: {
  amountCents: number;
  paidCents: number;
}): number {
  return Math.max(0, charge.amountCents - charge.paidCents);
}

export function listOpenChargesOnEarliestDueDate(charges: TuitionCharge[]): TuitionCharge[] {
  const openCharges = charges.filter((charge) => OPEN_CHARGE_STATUSES.has(charge.status));
  if (openCharges.length === 0) return [];

  const earliestDueDate = [...openCharges].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]!
    .dueDate;

  return openCharges
    .filter((charge) => charge.dueDate === earliestDueDate)
    .sort((a, b) => (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0));
}

export function countOpenChargesOnEarliestDueDate(charges: TuitionCharge[]): number {
  return listOpenChargesOnEarliestDueDate(charges).length;
}

export function resolveFamilyPayNowLabel(input: { chargesOnEarliestDueDate: number }): string {
  if (input.chargesOnEarliestDueDate > 1) {
    return 'Pay combined';
  }
  return 'Pay now';
}

export function childFirstNameFromFullName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function formatPaymentMethodLabel(
  method: {
    brand: string | null;
    last4: string | null;
  } | null,
): string | null {
  if (!method?.last4) return null;
  const brand = method.brand
    ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1)
    : 'Card';
  return `${brand} •••• ${method.last4}`;
}

export function filterChargesForChild(
  charges: TuitionCharge[],
  assignmentId: string | null,
): TuitionCharge[] {
  if (!assignmentId) return charges;
  return charges.filter((charge) => charge.assignmentId === assignmentId);
}

export function filterOpenCharges(charges: TuitionCharge[]): TuitionCharge[] {
  return charges.filter((charge) => OPEN_CHARGE_STATUSES.has(charge.status));
}
