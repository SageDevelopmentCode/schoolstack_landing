import { deriveSubmissionNextStep } from '@/lib/admissions/admin-submission-next-step';
import type { AdminApplicationSubmission } from '@/lib/admissions/application-submissions';

function submission(
  overrides: Partial<AdminApplicationSubmission> = {},
): AdminApplicationSubmission {
  return {
    id: 'app-1',
    status: 'submitted',
    feeStatus: 'paid',
    feeEnabled: true,
    formTitle: 'Application',
    formSlug: 'apply',
    programName: 'School Year 2026–27',
    guardianName: 'Parent',
    primaryGuardianId: null,
    contactEmail: 'parent@example.com',
    studentLabel: 'Student',
    stepIndex: 0,
    totalSteps: 10,
    applicationProgressSummary: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    submittedAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
    hasPostSubmitActions: false,
    postSubmitSummary: null,
    enrollmentSummary: null,
    ...overrides,
  };
}

describe('deriveSubmissionNextStep', () => {
  it('returns All set for enrolled applications', () => {
    const next = deriveSubmissionNextStep(submission({ status: 'enrolled' }));
    expect(next.primary).toBe('All set');
    expect(next.kind).toBe('complete');
  });

  it('returns Review application CTA for submitted applications', () => {
    const next = deriveSubmissionNextStep(submission({ status: 'submitted' }));
    expect(next.primary).toBe('Review application');
    expect(next.presentation).toBe('cta');
  });

  it('returns Awaiting family for in-progress drafts', () => {
    const next = deriveSubmissionNextStep(
      submission({
        status: 'draft',
        applicationProgressSummary: { completed: 2, total: 10, label: '2/10 complete' },
      }),
    );
    expect(next.primary).toBe('Awaiting family');
    expect(next.secondary).toBe('2/10 complete');
  });
});
