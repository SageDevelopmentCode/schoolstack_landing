import type {
  ParentBillingChildView,
  ParentBillingFamilySummary,
} from '@/lib/parent/parent-portal-api';
import { buildParentBillingSetupSteps } from '@/lib/tuition/parent-billing-setup-steps';

function child(overrides: Partial<ParentBillingChildView> = {}): ParentBillingChildView {
  return {
    childKey: 'child-1',
    studentName: 'Julia Rivers',
    assignmentId: 'assignment-1',
    annualTuitionCents: 720000,
    balanceDueCents: 0,
    totalRemainingCents: 0,
    nextCharge: null,
    nextChargeId: null,
    status: 'ready',
    selectionItem: null,
    paymentPlanLabel: '10 payments',
    ...overrides,
  };
}

function summary(
  children: ParentBillingChildView[],
  overrides: Partial<ParentBillingFamilySummary> = {},
): ParentBillingFamilySummary {
  return {
    balanceDueCents: children.reduce((sum, c) => sum + c.balanceDueCents, 0),
    totalRemainingCents: 0,
    familyTotalRemainingCents: null,
    annualTuitionCents: 0,
    hasPendingSchedule: children.some((c) => c.status === 'needs_schedule'),
    nextCharge: null,
    children,
    ...overrides,
  };
}

const card = { brand: 'visa', last4: '4242', expMonth: 1, expYear: 2030 };

describe('buildParentBillingSetupSteps', () => {
  it('marks everything done for a settled family with a card', () => {
    const result = buildParentBillingSetupSteps({
      familySummary: summary([child()]),
      readinessState: 'ready',
      hasAgreements: false,
      pendingAgreementCount: 0,
      savedPaymentMethod: card,
      autopayEnabled: true,
    });
    expect(result.steps.map((s) => [s.key, s.status])).toEqual([
      ['plan', 'done'],
      ['payment_method', 'done'],
      ['pay', 'done'],
    ]);
    expect(result.allDone).toBe(true);
    expect(result.currentKey).toBeNull();
    expect(result.steps[1]!.detail).toMatch(/Visa •••• 4242 · Autopay on/);
  });

  it('points at the plan step and the first pending child', () => {
    const result = buildParentBillingSetupSteps({
      familySummary: summary([
        child({ childKey: 'a', studentName: 'Julia Rivers', status: 'needs_schedule' }),
        child({ childKey: 'b', studentName: 'Caleb Rivers', status: 'needs_schedule' }),
      ]),
      readinessState: 'needs_payment_plan',
      hasAgreements: true,
      pendingAgreementCount: 2,
      savedPaymentMethod: null,
      autopayEnabled: false,
    });
    expect(result.currentKey).toBe('plan');
    expect(result.firstPendingChildKey).toBe('a');
    expect(result.steps[0]!.detail).toBe('Still needed for Julia and Caleb');
    expect(result.steps[1]!.detail).toBe('2 waiting for your signature');
    expect(result.steps.find((s) => s.key === 'pay')!.status).toBe('waiting');
    expect(result.doneCount).toBe(0);
  });

  it('waits on the school when tuition is not assigned', () => {
    const result = buildParentBillingSetupSteps({
      familySummary: summary([child({ status: 'no_assignment' })]),
      readinessState: 'needs_assignment',
      hasAgreements: false,
      pendingAgreementCount: 0,
      savedPaymentMethod: null,
      autopayEnabled: false,
    });
    expect(result.steps[0]!.status).toBe('waiting');
    expect(result.steps.at(-1)!.status).toBe('waiting');
    expect(result.currentKey).toBe('payment_method');
  });

  it('keeps step copy free of amounts and E2E-reserved phrases', () => {
    const result = buildParentBillingSetupSteps({
      familySummary: summary([child({ balanceDueCents: 72000, status: 'needs_schedule' })]),
      readinessState: 'needs_payment_plan',
      hasAgreements: true,
      pendingAgreementCount: 1,
      savedPaymentMethod: null,
      autopayEnabled: true,
    });
    for (const step of result.steps) {
      const text = `${step.label} ${step.detail}`;
      expect(text).not.toMatch(/\$/);
      expect(text).not.toMatch(/payment schedule|pay in full|action needed|estimated annual tuition/i);
    }
  });
});
