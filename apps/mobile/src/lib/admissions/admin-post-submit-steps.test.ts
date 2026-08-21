import { buildAdminPostSubmitSteps } from '@/lib/admissions/admin-post-submit-steps';

describe('buildAdminPostSubmitSteps', () => {
  it('returns no steps for draft applications', () => {
    expect(
      buildAdminPostSubmitSteps({ actions: [{ id: 'visit', type: 'school_visit' }] }, [], 'draft'),
    ).toEqual([]);
  });

  it('marks scheduled visits and pending actions', () => {
    const steps = buildAdminPostSubmitSteps(
      {
        actions: [
          { id: 'visit', type: 'school_visit', label: 'Campus visit' },
          { id: 'interview', type: 'interview', enabled: false },
        ],
      },
      [
        {
          post_submit_action_id: 'visit',
          scheduled_date: '2026-08-20',
          start_time_slot: '09:00',
          duration_minutes: 60,
        },
      ],
      'submitted',
    );

    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({
      actionId: 'visit',
      title: 'Campus visit',
      status: 'scheduled',
      booking: {
        scheduledDate: '2026-08-20',
        startTimeSlot: '09:00',
        durationMinutes: 60,
      },
    });
  });

  it('falls back to action type labels', () => {
    const steps = buildAdminPostSubmitSteps(
      { actions: [{ id: 'visit', type: 'school_visit' }] },
      [],
      'submitted',
    );

    expect(steps[0]).toMatchObject({
      title: 'school visit',
      status: 'pending',
    });
  });
});
