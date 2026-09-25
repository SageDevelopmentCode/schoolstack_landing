import type { TuitionCharge } from '@/lib/parent/parent-portal-api';
import { formatParentChargeStatusBadge } from '@/lib/tuition/charge-status-display';

function charge(overrides: Partial<TuitionCharge>): TuitionCharge {
  return {
    status: 'scheduled',
    chargeType: 'tuition',
    ...overrides,
  } as TuitionCharge;
}

describe('formatParentChargeStatusBadge', () => {
  it.each([
    ['scheduled', 'SCHEDULED', 'info'],
    ['sent', 'SENT', 'accent'],
    ['overdue', 'OVERDUE', 'danger'],
    ['paid', 'PAID', 'success'],
    ['void', 'VOID', 'neutral'],
    ['waived', 'WAIVED', 'neutral'],
  ] as const)('maps %s to %s', (status, label, tone) => {
    expect(formatParentChargeStatusBadge(charge({ status }))).toEqual({ label, tone });
  });

  it('labels unpaid late fees as LATE FEE', () => {
    expect(
      formatParentChargeStatusBadge(charge({ status: 'overdue', chargeType: 'late_fee' })),
    ).toEqual({ label: 'LATE FEE', tone: 'warning' });
  });
});
