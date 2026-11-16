import { useCallback, useState } from 'react';

import { confirmDestructive, useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import type { SubmissionDetailController } from '@/components/school-admin/admissions/garden/use-submission-detail-controller';
import { notifyWebOnly, webAdminPath } from '@/components/school-admin/garden/admin-feedback';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { useSchoolAdminSubmissions } from '@/contexts/school-admin-submissions-context';
import { adminApplicationStatusLabel } from '@/lib/admissions/application-status-ui';
import type { ApplicationDecisionAction } from '@/lib/admissions/application-status-transitions';

function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/** Decisions that close an application ask first (a mis-tap here is hard to undo from a phone). */
const CONFIRM_STATUSES: Record<string, { title: string; confirmLabel: string }> = {
  declined: { title: 'Decline this application?', confirmLabel: 'Decline' },
  withdrawn: { title: 'Withdraw this application?', confirmLabel: 'Withdraw' },
};

/**
 * Feedback for the application detail (mirror of web `ApplicationDecisionSection`):
 * spinner on the tapped decision, success / error toasts with Retry, mint flash,
 * a refreshed submissions list, pull-to-refresh toasts, read-only preview and
 * web-only enrollment. The controller reports failures; nothing here reports twice.
 */
export function useSubmissionDetailFeedback(controller: SubmissionDetailController) {
  const action = useAdminAction(controller.organizationId);
  const { toast, reportError } = action;
  const { guard, readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const { refresh: refreshSubmissionsList } = useSchoolAdminSubmissions();
  const { applicationId, changeStatus, markEnrolled, slug } = controller;
  const [refreshError, setRefreshError] = useState<string | null>(null);
  /** The decision being saved (also set by a toast Retry), so only that button spins. */
  const [pendingDecision, setPendingDecision] = useState<string | null>(null);

  const studentName = controller.submission?.studentLabel?.trim() || 'This application';
  const statusKey = `application-status-${applicationId}`;
  const enrollKey = `mark-enrolled-${applicationId}`;

  const runStatusChange = useCallback(
    (requested: string) =>
      action.run(
        () => {
          setPendingDecision(requested);
          return changeStatus(requested).finally(() => setPendingDecision(null));
        },
        {
        key: statusKey,
        success: (next) => ({
          title:
            next === 'enrolled' && requested === 'accepted'
              ? 'Accepted and enrolled'
              : 'Application status updated',
          description: `This application is now “${adminApplicationStatusLabel(next)}”. The submissions list is updated.`,
        }),
        error: (err) => ({
          title: "Couldn't update the application",
          description: `${errorText(err, 'Failed to update status.')} The status hasn't changed.`,
        }),
        retry: true,
        },
      ),
    [action, changeStatus, statusKey],
  );

  /** A decision button: read-only gate → confirm for closing decisions → save. */
  const decide = useCallback(
    async (decision: ApplicationDecisionAction) => {
      if (readOnly) {
        notifyReadOnly();
        return;
      }
      const confirm = CONFIRM_STATUSES[decision.status];
      if (confirm) {
        const ok = await confirmDestructive({
          title: confirm.title,
          message: `${studentName} will move to “${adminApplicationStatusLabel(decision.status)}”. You can change the status again later from the web portal.`,
          confirmLabel: confirm.confirmLabel,
        });
        if (!ok) return;
      }
      const saved = await runStatusChange(decision.status);
      if (saved) void refreshSubmissionsList({ silent: true });
    },
    [notifyReadOnly, readOnly, refreshSubmissionsList, runStatusChange, studentName],
  );

  const markEnrolledWithFeedback = useCallback(async () => {
    if (readOnly) {
      notifyReadOnly();
      return;
    }
    const saved = await action.run(() => markEnrolled(), {
      key: enrollKey,
      success: {
        title: 'Marked enrolled',
        description: `${studentName} is enrolled. The submissions list is updated.`,
      },
      error: (err) => ({
        title: "Couldn't mark enrolled",
        description: `${errorText(err, 'Failed to mark enrolled.')} Nothing was changed.`,
      }),
      retry: true,
    });
    if (saved) void refreshSubmissionsList({ silent: true });
  }, [action, enrollKey, markEnrolled, notifyReadOnly, readOnly, refreshSubmissionsList, studentName]);

  /** "Start enrollment from the web admin" — say so and offer the web page instead of plain text. */
  const openEnrollmentOnWeb = useCallback(() => {
    notifyWebOnly(toast, {
      webPath: `${webAdminPath(slug, 'admissions', 'submissions')}?applicationId=${applicationId}`,
      reportError,
      title: 'Start enrollment on the web portal',
      description: 'Choosing checklist variants is done on the web. The app updates once it is saved.',
    });
  }, [applicationId, reportError, slug, toast]);

  const refreshWithStatus = useCallback(async () => {
    try {
      await controller.refresh();
      setRefreshError(null);
    } catch (err) {
      setRefreshError(errorText(err, 'Failed to load submission.'));
    }
  }, [controller]);

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: refreshWithStatus,
    error: refreshError,
    label: 'Application',
    id: `admin-application-refresh-${applicationId}`,
  });

  return {
    action,
    toast,
    guard,
    decide,
    markEnrolled: markEnrolledWithFeedback,
    openEnrollmentOnWeb,
    pullRefreshing,
    onPullRefresh,
    pendingDecision,
    enrollPending: action.pendingKey === enrollKey,
    statusFlash: action.flashKey === statusKey || action.flashKey === enrollKey,
  };
}

export type SubmissionDetailFeedback = ReturnType<typeof useSubmissionDetailFeedback>;
