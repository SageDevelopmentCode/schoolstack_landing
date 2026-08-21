import {
  computeApplyFormStepStatus,
  computeChecklistStepStatus,
  computeGoLiveStepStatus,
  computeProgramsStepStatus,
  computeStripeStepStatus,
} from '@/lib/school-admin/admissions-setup-status';

describe('computeProgramsStepStatus', () => {
  it('marks programs complete when configured', () => {
    expect(computeProgramsStepStatus(true)).toBe('completed');
    expect(computeProgramsStepStatus(false)).toBe('not_started');
  });
});

describe('computeStripeStepStatus', () => {
  it('tracks stripe onboarding progress', () => {
    expect(computeStripeStepStatus(null)).toBe('not_started');
    expect(
      computeStripeStepStatus({
        organizationId: 'org-1',
        stripeConnectAccountId: 'acct_123',
        onboardingStatus: 'pending',
        chargesEnabled: false,
        payoutsEnabled: false,
      }),
    ).toBe('in_progress');
    expect(
      computeStripeStepStatus({
        organizationId: 'org-1',
        stripeConnectAccountId: 'acct_123',
        onboardingStatus: 'complete',
        chargesEnabled: true,
        payoutsEnabled: true,
      }),
    ).toBe('completed');
  });
});

describe('computeApplyFormStepStatus', () => {
  it('maps apply form publication states', () => {
    expect(computeApplyFormStepStatus('none')).toBe('not_started');
    expect(computeApplyFormStepStatus('draft')).toBe('in_progress');
    expect(computeApplyFormStepStatus('published')).toBe('completed');
  });
});

describe('computeChecklistStepStatus', () => {
  it('requires published checklist items to complete', () => {
    expect(computeChecklistStepStatus('none', 0)).toBe('not_started');
    expect(computeChecklistStepStatus('published', 0)).toBe('in_progress');
    expect(computeChecklistStepStatus('published', 2)).toBe('completed');
  });
});

describe('computeGoLiveStepStatus', () => {
  it('waits for submissions after publishing prerequisites', () => {
    expect(computeGoLiveStepStatus(false, false, false)).toBe('not_started');
    expect(computeGoLiveStepStatus(true, true, false)).toBe('in_progress');
    expect(computeGoLiveStepStatus(true, true, true)).toBe('completed');
  });
});
