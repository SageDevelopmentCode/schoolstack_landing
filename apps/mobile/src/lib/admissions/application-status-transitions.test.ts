import { getApplicationDecisionActions } from '@/lib/admissions/application-status-transitions';

describe('getApplicationDecisionActions', () => {
  it('returns review actions for submitted applications', () => {
    const actions = getApplicationDecisionActions('submitted');

    expect(actions.map((action) => action.status)).toEqual([
      'under_review',
      'accepted',
      'declined',
    ]);
  });

  it('returns observation and decision actions for under review', () => {
    const actions = getApplicationDecisionActions('under_review');

    expect(actions.map((action) => action.label)).toEqual([
      'Schedule observation',
      'Accept',
      'Decline',
    ]);
  });

  it('returns limited actions for accepted applications', () => {
    const actions = getApplicationDecisionActions('accepted');

    expect(actions.map((action) => action.status)).toEqual([
      'submitted',
      'withdrawn',
      'declined',
    ]);
  });

  it('returns withdraw for enrolled applications', () => {
    expect(getApplicationDecisionActions('enrolled')).toEqual([
      { status: 'withdrawn', label: 'Withdraw', variant: 'danger' },
    ]);
  });

  it('returns no actions for unknown statuses', () => {
    expect(getApplicationDecisionActions('custom_status')).toEqual([]);
  });
});
