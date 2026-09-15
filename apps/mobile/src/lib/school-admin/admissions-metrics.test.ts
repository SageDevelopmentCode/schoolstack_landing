import { computeAdmissionsMetrics } from '@/lib/school-admin/admissions-metrics';
import type { AdminApplicationSubmission } from '@/lib/admissions/application-submissions';

function makeSubmission(
  overrides: Partial<AdminApplicationSubmission> & Pick<AdminApplicationSubmission, 'id' | 'status'>,
): AdminApplicationSubmission {
  return {
    id: overrides.id,
    status: overrides.status,
    feeStatus: 'not_required',
    feeEnabled: false,
    formTitle: 'Application',
    formSlug: null,
    programName: null,
    guardianName: null,
    primaryGuardianId: null,
    contactEmail: null,
    studentLabel: null,
    stepIndex: 0,
    totalSteps: 1,
    applicationProgressSummary: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    submittedAt: null,
    updatedAt: '2026-01-01T00:00:00.000Z',
    hasPostSubmitActions: false,
    postSubmitSummary: null,
    enrollmentSummary: null,
    ...overrides,
  };
}

describe('computeAdmissionsMetrics', () => {
  it('counts active submissions excluding withdrawn', () => {
    const submissions = [
      makeSubmission({ id: '1', status: 'draft' }),
      makeSubmission({ id: '2', status: 'enrolled' }),
      makeSubmission({ id: '3', status: 'withdrawn' }),
    ];

    const metrics = computeAdmissionsMetrics(submissions);

    expect(metrics.activeSubmissionsCount).toBe(2);
    expect(metrics.draftCount).toBe(1);
    expect(metrics.enrolledCount).toBe(1);
    expect(metrics.statusCounts.withdrawn).toBe(1);
  });

  it('picks the most recently submitted application for attention banner', () => {
    const submissions = [
      makeSubmission({
        id: 'older',
        status: 'submitted',
        submittedAt: '2026-01-01T00:00:00.000Z',
        guardianName: 'Older Family',
      }),
      makeSubmission({
        id: 'newer',
        status: 'submitted',
        submittedAt: '2026-02-01T00:00:00.000Z',
        guardianName: 'Newer Family',
      }),
    ];

    const metrics = computeAdmissionsMetrics(submissions);

    expect(metrics.latestSubmitted?.id).toBe('newer');
    expect(metrics.submittedCount).toBe(2);
  });
});
