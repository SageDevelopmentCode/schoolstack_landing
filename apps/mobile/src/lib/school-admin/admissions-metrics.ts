import type { AdminApplicationSubmission } from '@/lib/admissions/application-submissions';

export type AdmissionsMetrics = {
  activeSubmissionsCount: number;
  draftCount: number;
  submittedCount: number;
  enrolledCount: number;
  statusCounts: Record<string, number>;
  latestSubmitted: AdminApplicationSubmission | null;
};

export function computeAdmissionsMetrics(
  submissions: AdminApplicationSubmission[],
): AdmissionsMetrics {
  const statusCounts: Record<string, number> = {};
  let latestSubmitted: AdminApplicationSubmission | null = null;

  for (const submission of submissions) {
    statusCounts[submission.status] = (statusCounts[submission.status] ?? 0) + 1;

    if (submission.status === 'submitted') {
      if (
        !latestSubmitted ||
        (submission.submittedAt &&
          (!latestSubmitted.submittedAt ||
            submission.submittedAt > latestSubmitted.submittedAt))
      ) {
        latestSubmitted = submission;
      }
    }
  }

  const withdrawnCount = statusCounts.withdrawn ?? 0;

  return {
    activeSubmissionsCount: submissions.length - withdrawnCount,
    draftCount: statusCounts.draft ?? 0,
    submittedCount: statusCounts.submitted ?? 0,
    enrolledCount: statusCounts.enrolled ?? 0,
    statusCounts,
    latestSubmitted,
  };
}
