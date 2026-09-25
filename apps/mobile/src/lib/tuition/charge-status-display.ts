import type { TuitionCharge } from '@/lib/parent/parent-portal-api';

/** Mirrors formatParentChargeStatusBadge in src/lib/tuition/charge-status-display.ts. */
export type ChargeStatusBadgeTone = 'success' | 'neutral' | 'info' | 'accent' | 'warning' | 'danger';

export type ChargeStatusBadge = {
  label: string;
  tone: ChargeStatusBadgeTone;
};

export function formatParentChargeStatusBadge(charge: TuitionCharge): ChargeStatusBadge {
  if (charge.status === 'waived') {
    return { label: 'WAIVED', tone: 'neutral' };
  }

  if (charge.chargeType === 'late_fee') {
    return { label: 'LATE FEE', tone: 'warning' };
  }

  switch (charge.status) {
    case 'paid':
      return { label: 'PAID', tone: 'success' };
    case 'overdue':
      return { label: 'OVERDUE', tone: 'danger' };
    case 'scheduled':
      return { label: 'SCHEDULED', tone: 'info' };
    case 'sent':
      return { label: 'SENT', tone: 'accent' };
    case 'void':
      return { label: 'VOID', tone: 'neutral' };
    default: {
      charge.status satisfies never;
      return { label: 'UNKNOWN', tone: 'neutral' };
    }
  }
}
