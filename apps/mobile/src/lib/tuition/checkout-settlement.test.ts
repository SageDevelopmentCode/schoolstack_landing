import type { ParentBillingData, ParentTuitionPaymentRecord } from '@/lib/parent/parent-portal-api';
import {
  captureCheckoutSettlementBaseline,
  hasCheckoutSettled,
} from '@/lib/tuition/checkout-settlement';

function payment(id: string, status: string): ParentTuitionPaymentRecord {
  return {
    id,
    organizationId: 'org',
    familyId: 'family',
    tuitionChargeId: 'charge',
    label: 'Tuition',
    amountCents: 1000,
    chargedAmountCents: 1000,
    processingFeeCents: 0,
    paymentMethodType: 'card',
    stripeCheckoutSessionId: null,
    status,
    paidAt: null,
    createdAt: '2026-09-24T00:00:00.000Z',
    studentFirstName: null,
    enrollmentId: null,
  };
}

function billing(overrides: Partial<ParentBillingData>): ParentBillingData {
  return {
    payments: [],
    savedPaymentMethod: null,
    ...overrides,
  } as ParentBillingData;
}

describe('hasCheckoutSettled', () => {
  it('waits for a new succeeded payment after paid', () => {
    const before = billing({ payments: [payment('p1', 'succeeded')] });
    const baseline = captureCheckoutSettlementBaseline(before);

    expect(hasCheckoutSettled('paid', baseline, before)).toBe(false);
    expect(
      hasCheckoutSettled(
        'paid',
        baseline,
        billing({ payments: [payment('p1', 'succeeded'), payment('p2', 'pending')] }),
      ),
    ).toBe(false);
    expect(
      hasCheckoutSettled(
        'paid',
        baseline,
        billing({ payments: [payment('p1', 'succeeded'), payment('p2', 'succeeded')] }),
      ),
    ).toBe(true);
  });

  it('waits for a new saved card after card_saved', () => {
    const baseline = captureCheckoutSettlementBaseline(billing({}));

    expect(hasCheckoutSettled('card_saved', baseline, billing({}))).toBe(false);
    expect(
      hasCheckoutSettled(
        'card_saved',
        baseline,
        billing({
          savedPaymentMethod: { brand: 'visa', last4: '4242', expMonth: 12, expYear: 2030 },
        }),
      ),
    ).toBe(true);
  });

  it('settles immediately for cancel outcomes and never without data', () => {
    const baseline = captureCheckoutSettlementBaseline(null);
    expect(hasCheckoutSettled('cancelled', baseline, billing({}))).toBe(true);
    expect(hasCheckoutSettled('dismissed', baseline, billing({}))).toBe(true);
    expect(hasCheckoutSettled('paid', baseline, null)).toBe(false);
  });
});
