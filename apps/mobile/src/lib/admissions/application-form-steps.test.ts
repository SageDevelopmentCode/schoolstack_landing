import {
  buildApplicationFormSteps,
  computeApplicationFormStepStatuses,
  parseApplicationFormStepIndex,
  summarizeApplicationFormProgress,
} from '@/lib/admissions/application-form-steps';

describe('buildApplicationFormSteps', () => {
  it('builds section steps from schema', () => {
    const steps = buildApplicationFormSteps(
      {
        sections: [
          { id: 'student', title: 'Student info' },
          { id: 'family', title: 'Family info' },
        ],
      },
      { enabled: false },
    );

    expect(steps).toEqual([
      { kind: 'section', id: 'student', label: 'Student info', sectionIndex: 0 },
      { kind: 'section', id: 'family', label: 'Family info', sectionIndex: 1 },
    ]);
  });

  it('appends acknowledgments and fee steps when configured', () => {
    const steps = buildApplicationFormSteps(
      {
        sections: [{ id: 'student', title: 'Student info' }],
        acknowledgments: [{ id: 'ack-1', label: 'I agree' }],
      },
      { enabled: true, label: 'Application fee' },
    );

    expect(steps.map((step) => step.id)).toEqual(['student', 'acknowledgments', 'fee']);
  });
});

describe('parseApplicationFormStepIndex', () => {
  it('returns zero for invalid progress', () => {
    expect(parseApplicationFormStepIndex(null)).toBe(0);
    expect(parseApplicationFormStepIndex({ __progress: { stepIndex: -1 } })).toBe(0);
  });

  it('reads the saved step index', () => {
    expect(parseApplicationFormStepIndex({ __progress: { stepIndex: 2 } })).toBe(2);
  });
});

describe('computeApplicationFormStepStatuses', () => {
  const steps = buildApplicationFormSteps(
    { sections: [{ id: 'student', title: 'Student info' }] },
    { enabled: true },
  );

  it('marks draft progress on section steps', () => {
    const statuses = computeApplicationFormStepStatuses(steps, {
      applicationStatus: 'draft',
      stepIndex: 0,
      feeStatus: 'not_required',
    });

    expect(statuses[0]?.status).toBe('in_progress');
    expect(statuses[1]?.status).toBe('not_started');
  });

  it('marks non-fee steps completed after submission', () => {
    const statuses = computeApplicationFormStepStatuses(steps, {
      applicationStatus: 'submitted',
      stepIndex: 0,
      feeStatus: 'paid',
    });

    expect(statuses[0]?.status).toBe('completed');
    expect(statuses[1]?.status).toBe('completed');
  });
});

describe('summarizeApplicationFormProgress', () => {
  it('counts completed steps', () => {
    const summary = summarizeApplicationFormProgress([
      { kind: 'section', id: 'a', label: 'A', sectionIndex: 0, status: 'completed' },
      { kind: 'fee', id: 'fee', label: 'Fee', status: 'in_progress' },
    ]);

    expect(summary).toEqual({ completed: 1, total: 2 });
  });
});
