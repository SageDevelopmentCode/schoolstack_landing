import {
  consumeCheckoutReturn,
  resetCheckoutReturnHandoffForTests,
  stageCheckoutBaseline,
  stageCheckoutReturn,
  wasCheckoutReturnConsumed,
} from '@/lib/parent/stripe-checkout-return-handoff';
import { captureCheckoutSettlementBaseline } from '@/lib/tuition/checkout-settlement';
import type { ParentBillingData } from '@/lib/parent/parent-portal-api';

function minimalBillingData(overrides?: Partial<ParentBillingData>): ParentBillingData {
  return {
    organizationId: 'org-1',
    familyId: 'family-1',
    guardianId: 'guardian-1',
    autopayEnabled: false,
    hasBillingSplit: false,
    charges: [],
    payments: [{ id: 'pay-1', status: 'succeeded', amountCents: 100, createdAt: '2026-01-01' }],
    adjustments: [],
    savedPaymentMethod: null,
    recentAutopayFailure: null,
    readiness: { enrollmentChecklistHref: null },
    tuitionAgreements: [],
    childViews: [],
    ...overrides,
  } as ParentBillingData;
}

describe('stripe-checkout-return-handoff', () => {
  afterEach(() => {
    resetCheckoutReturnHandoffForTests();
  });

  it('consumes staged baseline and return once for matching slug', () => {
    const baseline = captureCheckoutSettlementBaseline(minimalBillingData());
    stageCheckoutBaseline('rooted-meadows', baseline);
    stageCheckoutReturn('rooted-meadows', 'paid');

    const first = consumeCheckoutReturn('rooted-meadows');
    expect(first).toEqual({
      outcome: 'paid',
      baseline: expect.objectContaining({
        succeededPaymentIds: baseline.succeededPaymentIds,
        savedPaymentMethodKey: baseline.savedPaymentMethodKey,
      }),
    });
    expect(first?.baseline?.succeededPaymentIds.has('pay-1')).toBe(true);

    expect(consumeCheckoutReturn('rooted-meadows')).toBeNull();
    expect(wasCheckoutReturnConsumed('rooted-meadows')).toBe(true);
  });

  it('ignores consume for slug mismatch', () => {
    stageCheckoutReturn('school-a', 'paid');

    expect(consumeCheckoutReturn('school-b')).toBeNull();
    expect(consumeCheckoutReturn('school-a')).toEqual({
      outcome: 'paid',
      baseline: null,
    });
  });

  it('does not consume until return outcome is staged', () => {
    const baseline = captureCheckoutSettlementBaseline(minimalBillingData());
    stageCheckoutBaseline('demo-school', baseline);

    expect(consumeCheckoutReturn('demo-school')).toBeNull();

    stageCheckoutReturn('demo-school', 'card_saved');
    expect(consumeCheckoutReturn('demo-school')?.outcome).toBe('card_saved');
  });

  it('merges return outcome onto an existing baseline stage', () => {
    const baseline = captureCheckoutSettlementBaseline(
      minimalBillingData({
        savedPaymentMethod: {
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2030,
        },
      }),
    );
    stageCheckoutBaseline('demo-school', baseline);
    stageCheckoutReturn('demo-school', 'card_saved');

    const consumed = consumeCheckoutReturn('demo-school');
    expect(consumed?.baseline?.savedPaymentMethodKey).toBe('visa:4242:12:2030');
  });
});
