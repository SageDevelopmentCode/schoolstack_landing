import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { loadApplicationDetail, type ApplicationDetail } from '@/lib/admissions/application-detail';
import {
  buildApplicationFormSteps,
  computeApplicationFormStepStatuses,
} from '@/lib/admissions/application-form-steps';
import {
  getOrgApplicationSubmissionById,
  listFamilyAdmissionHistory,
  resolveApplicationFamilyId,
  type AdminApplicationSubmission,
  type FamilyAdmissionTimelineEvent,
} from '@/lib/admissions/application-submissions';
import {
  getChecklistForApplication,
  loadEnrollmentChecklistForApplication,
  type LoadedEnrollmentChecklist,
} from '@/lib/admissions/enrollment-checklist';
import { listFamilyGuardians, type FamilyGuardianRecord } from '@/lib/admissions/family-guardians';
import { listApplicationPayments, type PaymentRecordDisplayRow } from '@/lib/admissions/payment-records';
import {
  getPublishedEnrollmentChecklistPreview,
  markApplicationEnrolled,
  patchApplicationStatus,
} from '@/lib/school-admin-api';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type SubmissionDetailTab = 'overview' | 'application' | 'history' | 'payments';

/**
 * Application detail data, lazy tab loads and mutations (moved from
 * `submission-detail-screen.tsx`, same calls and `reportError` operations).
 * No UI, no toasts. Mutations rethrow after reporting so the feedback layer can
 * tell the admin what happened; a failure no longer replaces the whole screen.
 */
export function useSubmissionDetailController({
  organizationId,
  applicationId,
  slug,
}: {
  organizationId: string;
  applicationId: string;
  slug: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useMobileErrorReporter(organizationId);

  const [submission, setSubmission] = useState<AdminApplicationSubmission | null>(null);
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('draft');
  const [hasChecklist, setHasChecklist] = useState(false);
  const [hasPublishedEnrollmentChecklist, setHasPublishedEnrollmentChecklist] = useState(false);
  const [enrollmentChecklistName, setEnrollmentChecklistName] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SubmissionDetailTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const [enrollmentChecklist, setEnrollmentChecklist] = useState<LoadedEnrollmentChecklist | null>(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  const [guardians, setGuardians] = useState<FamilyGuardianRecord[]>([]);
  const [guardiansLoading, setGuardiansLoading] = useState(false);

  const [historyEvents, setHistoryEvents] = useState<FamilyAdmissionTimelineEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyUnlinked, setHistoryUnlinked] = useState(false);

  const [payments, setPayments] = useState<PaymentRecordDisplayRow[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const [selectedApplicationStepId, setSelectedApplicationStepId] = useState<string | null>(null);
  const [selectedEnrollmentItemId, setSelectedEnrollmentItemId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const showEnrollmentStatus = currentStatus === 'enrolling' || hasChecklist;

  const tabs = useMemo(() => {
    if (!detail) return [] as { id: SubmissionDetailTab; label: string }[];
    const result: { id: SubmissionDetailTab; label: string }[] = [{ id: 'overview', label: 'Overview' }];
    if (showEnrollmentStatus) {
      result.push({ id: 'application', label: 'Application form' });
    }
    result.push({ id: 'history', label: 'History' }, { id: 'payments', label: 'Payments' });
    return result;
  }, [detail, showEnrollmentStatus]);

  /**
   * `silent` keeps the current record on screen (after a save or a pull to
   * refresh) instead of flashing the full skeleton. A silent failure keeps the
   * data and rethrows so the caller can say so.
   */
  const loadCore = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      if (!silent) setError(null);
      try {
        const [submissionRow, detailRow, checklistRow, resolvedFamilyId, publishedChecklist] =
          await Promise.all([
            getOrgApplicationSubmissionById(supabase, organizationId, applicationId),
            loadApplicationDetail(supabase, applicationId, organizationId),
            getChecklistForApplication(supabase, applicationId),
            resolveApplicationFamilyId(supabase, organizationId, applicationId),
            getPublishedEnrollmentChecklistPreview(applicationId),
          ]);

        if (!submissionRow || !detailRow) {
          setError('Submission not found.');
          setSubmission(null);
          setDetail(null);
          return;
        }

        setError(null);
        setSubmission(submissionRow);
        setDetail(detailRow);
        setCurrentStatus(detailRow.status);
        setHasChecklist(Boolean(checklistRow));
        setFamilyId(resolvedFamilyId);
        setHasPublishedEnrollmentChecklist(publishedChecklist.hasChecklist);
        setEnrollmentChecklistName(publishedChecklist.templateName);
        setLastUpdatedAt(Date.now());
      } catch (loadError) {
        reportError('school_admin_submission_load', loadError, {
          entityType: 'application',
          entityId: applicationId,
        });
        if (silent) throw loadError;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load submission.');
        setSubmission(null);
        setDetail(null);
      } finally {
        if (silent) setRefreshing(false);
        else setLoading(false);
      }
    },
    [applicationId, organizationId, reportError, supabase],
  );

  useEffect(() => {
    void loadCore();
  }, [loadCore]);

  const loadEnrollmentSection = useCallback(async () => {
    if (!showEnrollmentStatus) return;
    setEnrollmentLoading(true);
    setEnrollmentError(null);
    try {
      const checklist = await loadEnrollmentChecklistForApplication(supabase, applicationId, organizationId);
      setEnrollmentChecklist(checklist);
    } catch (loadError) {
      reportError('school_admin_submission_enrollment_load', loadError, {
        entityType: 'application',
        entityId: applicationId,
      });
      setEnrollmentError(
        loadError instanceof Error ? loadError.message : 'Failed to load enrollment checklist.',
      );
      setEnrollmentChecklist(null);
    } finally {
      setEnrollmentLoading(false);
    }
  }, [applicationId, organizationId, reportError, showEnrollmentStatus, supabase]);

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'application') {
      void loadEnrollmentSection();
    }
  }, [activeTab, loadEnrollmentSection]);

  const loadGuardians = useCallback(async () => {
    if (!familyId) {
      setGuardians([]);
      return;
    }
    setGuardiansLoading(true);
    try {
      const rows = await listFamilyGuardians(
        supabase,
        organizationId,
        familyId,
        submission?.primaryGuardianId,
      );
      setGuardians(rows);
    } catch {
      setGuardians([]);
    } finally {
      setGuardiansLoading(false);
    }
  }, [familyId, organizationId, submission?.primaryGuardianId, supabase]);

  useEffect(() => {
    if (activeTab === 'overview') {
      void loadGuardians();
    }
  }, [activeTab, loadGuardians]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryUnlinked(false);
    try {
      const resolvedFamilyId =
        familyId ?? (await resolveApplicationFamilyId(supabase, organizationId, applicationId));
      if (!resolvedFamilyId) {
        setHistoryEvents([]);
        setHistoryUnlinked(true);
        return;
      }
      const events = await listFamilyAdmissionHistory(supabase, organizationId, resolvedFamilyId);
      setHistoryEvents(events);
    } catch {
      setHistoryEvents([]);
      setHistoryUnlinked(true);
    } finally {
      setHistoryLoading(false);
    }
  }, [applicationId, familyId, organizationId, supabase]);

  useEffect(() => {
    if (activeTab === 'history') {
      void loadHistory();
    }
  }, [activeTab, loadHistory]);

  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const rows = await listApplicationPayments(supabase, applicationId);
      setPayments(rows);
    } catch {
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  }, [applicationId, supabase]);

  useEffect(() => {
    if (activeTab === 'payments') {
      void loadPayments();
    }
  }, [activeTab, loadPayments]);

  /** Pull to refresh: the record plus whichever tab is open. Rethrows on failure. */
  const refresh = useCallback(async () => {
    await loadCore({ silent: true });
    if (activeTab === 'history') await loadHistory();
    if (activeTab === 'payments') await loadPayments();
  }, [activeTab, loadCore, loadHistory, loadPayments]);

  /** PATCH the status, then reload in place. Reports and rethrows on failure. Returns the new status. */
  const changeStatus = useCallback(
    async (status: string): Promise<string> => {
      let nextStatus: string;
      try {
        ({ status: nextStatus } = await patchApplicationStatus(applicationId, status));
      } catch (actionError) {
        reportError('school_admin_submission_status', actionError, {
          entityType: 'application',
          entityId: applicationId,
          metadata: { status },
        });
        throw actionError;
      }
      setCurrentStatus(nextStatus);
      // The status saved; a failed reload only leaves slightly stale details (and is reported).
      await loadCore({ silent: true }).catch(() => undefined);
      return nextStatus;
    },
    [applicationId, loadCore, reportError],
  );

  /** POST mark-enrolled, then reload in place. Reports and rethrows on failure. */
  const markEnrolled = useCallback(async () => {
    try {
      await markApplicationEnrolled(applicationId);
    } catch (actionError) {
      reportError('school_admin_mark_enrolled', actionError, {
        entityType: 'application',
        entityId: applicationId,
      });
      throw actionError;
    }
    await loadCore({ silent: true }).catch(() => undefined);
  }, [applicationId, loadCore, reportError]);

  const openApplication = useCallback(
    (nextApplicationId: string) => {
      if (nextApplicationId === applicationId) return;
      router.push(`/school-admin/${slug}/admissions/submissions/${nextApplicationId}`);
    },
    [applicationId, router, slug],
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const applicationStepsWithStatus = useMemo(() => {
    if (!detail || !submission) return [];
    const steps = buildApplicationFormSteps(detail.schema, detail.feeConfig);
    return computeApplicationFormStepStatuses(steps, {
      applicationStatus: currentStatus,
      stepIndex: detail.stepIndex,
      feeStatus: submission.feeStatus,
    });
  }, [currentStatus, detail, submission]);

  const selectedApplicationStep = useMemo(
    () => applicationStepsWithStatus.find((step) => step.id === selectedApplicationStepId) ?? null,
    [applicationStepsWithStatus, selectedApplicationStepId],
  );

  const selectedEnrollmentItem = useMemo(
    () => enrollmentChecklist?.items.find((item) => item.id === selectedEnrollmentItemId) ?? null,
    [enrollmentChecklist?.items, selectedEnrollmentItemId],
  );

  const selectedEnrollmentInstance = useMemo(() => {
    if (!enrollmentChecklist || !selectedEnrollmentItemId) return null;
    return (
      enrollmentChecklist.instances.find(
        (instance) => instance.templateItemId === selectedEnrollmentItemId,
      ) ?? null
    );
  }, [enrollmentChecklist, selectedEnrollmentItemId]);

  const selectedPayment = useMemo(
    () => payments.find((payment) => payment.id === selectedPaymentId) ?? null,
    [payments, selectedPaymentId],
  );

  const status: 'loading' | 'error' | 'ready' = loading
    ? 'loading'
    : error || !submission || !detail
      ? 'error'
      : 'ready';

  return {
    organizationId,
    applicationId,
    slug,
    status,
    error,
    submission,
    detail,
    currentStatus,
    hasChecklist,
    hasPublishedEnrollmentChecklist,
    enrollmentChecklistName,
    showEnrollmentStatus,
    tabs,
    activeTab,
    setActiveTab,
    refreshing,
    lastUpdatedAt,
    enrollmentChecklist,
    enrollmentLoading,
    enrollmentError,
    retryEnrollment: loadEnrollmentSection,
    guardians,
    guardiansLoading,
    historyEvents,
    historyLoading,
    historyUnlinked,
    payments,
    paymentsLoading,
    applicationStepsWithStatus,
    selectedApplicationStepId,
    setSelectedApplicationStepId,
    selectedApplicationStep,
    selectedEnrollmentItemId,
    setSelectedEnrollmentItemId,
    selectedEnrollmentItem,
    selectedEnrollmentInstance,
    selectedPaymentId,
    setSelectedPaymentId,
    selectedPayment,
    reload: loadCore,
    refresh,
    changeStatus,
    markEnrolled,
    openApplication,
    goBack,
  };
}

export type SubmissionDetailController = ReturnType<typeof useSubmissionDetailController>;
