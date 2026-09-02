import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AdminSectionDivider } from '@/components/admin/admin-section-divider';
import { DetailTabBar, type DetailTab } from '@/components/school-admin/detail-tab-bar';
import { ApplicationFormStepDetailSheet } from '@/components/school-admin/submission-detail/application-form-step-detail-sheet';
import { EnrollmentChecklistStepDetailSheet } from '@/components/school-admin/submission-detail/enrollment-checklist-step-detail-sheet';
import { PaymentDetailSheet } from '@/components/school-admin/submission-detail/payment-detail-sheet';
import {
  SubmissionApplicationStepsSection,
  SubmissionDecisionSection,
  SubmissionEnrollmentActionsSection,
  SubmissionEnrollmentStepsSection,
  SubmissionGuardiansSection,
  SubmissionHistorySection,
  SubmissionOverviewDetailsSection,
  SubmissionPaymentsSection,
  SubmissionPostSubmitSection,
  SubmissionSummaryStrip,
  loadEnrollmentChecklistState,
  loadPaymentsState,
} from '@/components/school-admin/submission-detail-sections';
import { SubmissionDetailHeader } from '@/components/school-admin/submission-detail-header';
import { SubmissionDetailScreenSkeleton } from '@/components/school-admin/submission-detail-skeleton';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
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
import { getChecklistForApplication, type LoadedEnrollmentChecklist } from '@/lib/admissions/enrollment-checklist';
import { listFamilyGuardians, type FamilyGuardianRecord } from '@/lib/admissions/family-guardians';
import type { PaymentRecordDisplayRow } from '@/lib/admissions/payment-records';
import {
  getPublishedEnrollmentChecklistPreview,
  markApplicationEnrolled,
  patchApplicationStatus,
} from '@/lib/school-admin-api';
import { getSupabaseClient } from '@/lib/supabase';
import { Spacing } from '@/constants/theme';

type SubmissionDetailScreenProps = {
  organizationId: string;
  applicationId: string;
  slug: string;
};

export function SubmissionDetailScreen({
  organizationId,
  applicationId,
  slug,
}: SubmissionDetailScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [submission, setSubmission] = useState<AdminApplicationSubmission | null>(null);
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('draft');
  const [hasChecklist, setHasChecklist] = useState(false);
  const [hasPublishedEnrollmentChecklist, setHasPublishedEnrollmentChecklist] = useState(false);
  const [enrollmentChecklistName, setEnrollmentChecklistName] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingStatus, setActionLoadingStatus] = useState<string | null>(null);
  const [markEnrolledLoading, setMarkEnrolledLoading] = useState(false);

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

  const tabs = useMemo<DetailTab[]>(() => {
    if (!detail) return [];
    const result: DetailTab[] = [{ id: 'overview', label: 'Overview' }];
    if (showEnrollmentStatus) {
      result.push({ id: 'application', label: 'Application form' });
    }
    result.push({ id: 'history', label: 'History' }, { id: 'payments', label: 'Payments' });
    return result;
  }, [detail, showEnrollmentStatus]);

  const loadCore = useCallback(async () => {
    setLoading(true);
    setError(null);
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

      setSubmission(submissionRow);
      setDetail(detailRow);
      setCurrentStatus(detailRow.status);
      setHasChecklist(Boolean(checklistRow));
      setFamilyId(resolvedFamilyId);
      setHasPublishedEnrollmentChecklist(publishedChecklist.hasChecklist);
      setEnrollmentChecklistName(publishedChecklist.templateName);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load submission.');
      setSubmission(null);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [applicationId, organizationId, supabase]);

  useEffect(() => {
    void loadCore();
  }, [loadCore]);

  const loadEnrollmentSection = useCallback(async () => {
    if (!showEnrollmentStatus) return;
    setEnrollmentLoading(true);
    setEnrollmentError(null);
    try {
      const checklist = await loadEnrollmentChecklistState(supabase, applicationId, organizationId);
      setEnrollmentChecklist(checklist);
    } catch (loadError) {
      setEnrollmentError(
        loadError instanceof Error ? loadError.message : 'Failed to load enrollment checklist.',
      );
      setEnrollmentChecklist(null);
    } finally {
      setEnrollmentLoading(false);
    }
  }, [applicationId, organizationId, showEnrollmentStatus, supabase]);

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
      const resolvedFamilyId = familyId ?? (await resolveApplicationFamilyId(supabase, organizationId, applicationId));
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
      const rows = await loadPaymentsState(supabase, applicationId);
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

  const handleStatusAction = useCallback(
    async (status: string) => {
      setActionLoadingStatus(status);
      try {
        await patchApplicationStatus(applicationId, status);
        await loadCore();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : 'Failed to update status.');
      } finally {
        setActionLoadingStatus(null);
      }
    },
    [applicationId, loadCore],
  );

  const handleMarkEnrolled = useCallback(async () => {
    setMarkEnrolledLoading(true);
    try {
      await markApplicationEnrolled(applicationId);
      await loadCore();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to mark enrolled.');
    } finally {
      setMarkEnrolledLoading(false);
    }
  }, [applicationId, loadCore]);

  const handleSelectApplication = useCallback(
    (nextApplicationId: string) => {
      if (nextApplicationId === applicationId) return;
      router.push(`/school-admin/${slug}/admissions/submissions/${nextApplicationId}`);
    },
    [applicationId, router, slug],
  );

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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <SubmissionDetailHeader />
        <SubmissionDetailScreenSkeleton />
      </View>
    );
  }

  if (error || !submission || !detail) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <SubmissionDetailHeader />
        <View style={styles.centered}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {error ?? 'Submission not found.'}
          </ThemedText>
        </View>
      </View>
    );
  }

  const applicationFormSection = (
    <SubmissionApplicationStepsSection
      detail={detail}
      feeStatus={submission.feeStatus}
      applicationStatus={currentStatus}
      submittedAt={submission.submittedAt}
      feeEnabled={submission.feeEnabled}
      onItemPress={setSelectedApplicationStepId}
      activeItemId={selectedApplicationStepId ?? undefined}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <SubmissionDetailHeader />
      <SubmissionSummaryStrip submission={{ ...submission, status: currentStatus }} />
      <DetailTabBar tabs={tabs} activeTabId={activeTab} onChange={setActiveTab} />
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'overview' ? (
          <View style={styles.tabContent}>
            <SubmissionOverviewDetailsSection submission={{ ...submission, status: currentStatus }} />
            <AdminSectionDivider />
            {currentStatus === 'accepted' || currentStatus === 'enrolling' ? (
              <SubmissionEnrollmentActionsSection
                currentStatus={currentStatus}
                hasPublishedChecklist={hasPublishedEnrollmentChecklist || hasChecklist}
                programName={submission.programName}
                enrollmentChecklistName={enrollmentChecklistName}
                onMarkEnrolled={() => void handleMarkEnrolled()}
                loading={markEnrolledLoading}
              />
            ) : null}
            {currentStatus !== 'accepted' ? (
              <SubmissionDecisionSection
                currentStatus={currentStatus}
                onAction={(status) => void handleStatusAction(status)}
                loadingStatus={actionLoadingStatus}
              />
            ) : null}
            <AdminSectionDivider />
            {showEnrollmentStatus ? (
              <SubmissionEnrollmentStepsSection
                checklist={enrollmentChecklist}
                loading={enrollmentLoading}
                error={enrollmentError}
                onItemPress={setSelectedEnrollmentItemId}
                activeItemId={selectedEnrollmentItemId ?? undefined}
              />
            ) : (
              applicationFormSection
            )}
            <AdminSectionDivider />
            <SubmissionPostSubmitSection steps={detail.postSubmitSteps} />
            <AdminSectionDivider />
            <SubmissionGuardiansSection guardians={guardians} loading={guardiansLoading} />
          </View>
        ) : null}

        {activeTab === 'application' ? (
          <View style={styles.tabContent}>{applicationFormSection}</View>
        ) : null}

        {activeTab === 'history' ? (
          <View style={styles.tabContent}>
            <SubmissionHistorySection
              events={historyEvents}
              currentApplicationId={applicationId}
              currentApplicationStatus={currentStatus}
              loading={historyLoading}
              unlinked={historyUnlinked}
              onSelectApplication={handleSelectApplication}
            />
          </View>
        ) : null}

        {activeTab === 'payments' ? (
          <View style={styles.tabContent}>
            <SubmissionPaymentsSection
              payments={payments}
              loading={paymentsLoading}
              onPaymentPress={setSelectedPaymentId}
              activePaymentId={selectedPaymentId ?? undefined}
            />
          </View>
        ) : null}
      </ScrollView>

      <ApplicationFormStepDetailSheet
        visible={selectedApplicationStepId != null}
        step={selectedApplicationStep}
        detail={detail}
        feeStatus={submission.feeStatus}
        onClose={() => setSelectedApplicationStepId(null)}
      />
      <EnrollmentChecklistStepDetailSheet
        visible={selectedEnrollmentItemId != null}
        item={selectedEnrollmentItem}
        instance={selectedEnrollmentInstance}
        onClose={() => setSelectedEnrollmentItemId(null)}
      />
      <PaymentDetailSheet
        visible={selectedPaymentId != null}
        payment={selectedPayment}
        onClose={() => setSelectedPaymentId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  content: {
    paddingBottom: Spacing.six,
  },
  tabContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
});
