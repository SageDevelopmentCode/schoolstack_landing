import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { DetailProgressBar } from '@/components/school-admin/detail-progress-bar';
import { DetailSection } from '@/components/school-admin/detail-section';
import { AdmissionHistoryTimeline } from '@/components/school-admin/admission-history-timeline';
import {
  DetailRowListSkeleton,
  DetailTimelineSectionSkeleton,
} from '@/components/school-admin/submission-detail-skeleton';
import {
  DetailStepTimeline,
  type DetailStepTimelineItem,
} from '@/components/school-admin/detail-step-timeline';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import type { AdminPostSubmitStep } from '@/lib/admissions/admin-post-submit-steps';
import type { ApplicationDetail } from '@/lib/admissions/application-detail';
import {
  buildApplicationFormSteps,
  computeApplicationFormStepStatuses,
  summarizeApplicationFormProgress,
} from '@/lib/admissions/application-form-steps';
import {
  adminApplicationStatusLabel,
  applicationStatusBadgeStyle,
  FEE_STATUS_LABELS,
} from '@/lib/admissions/application-status-ui';
import { getApplicationDecisionActions } from '@/lib/admissions/application-status-transitions';
import type { AdminApplicationSubmission } from '@/lib/admissions/application-submissions';
import { formatShortDate } from '@/lib/admissions/application-submissions';
import {
  buildEnrollmentTimelineMeta,
  checklistItemTypeLabel,
  loadEnrollmentChecklistForApplication,
  type LoadedEnrollmentChecklist,
} from '@/lib/admissions/enrollment-checklist';
import type { FamilyGuardianRecord } from '@/lib/admissions/family-guardians';
import {
  formatPaymentAmount,
  formatPaymentDateTime,
  listApplicationPayments,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentRecordDisplayRow,
} from '@/lib/admissions/payment-records';
import type { FamilyAdmissionTimelineEvent } from '@/lib/admissions/application-submissions';
import { Spacing } from '@/constants/theme';

function stepKindLabel(kind: 'section' | 'acknowledgments' | 'fee'): string {
  switch (kind) {
    case 'section':
      return 'Form';
    case 'acknowledgments':
      return 'Acknowledgments';
    case 'fee':
      return 'Fee';
  }
}

export function SubmissionSummaryStrip({
  submission,
}: {
  submission: AdminApplicationSubmission;
}) {
  const theme = useAdminTheme();

  return (
    <View style={styles.summaryStrip}>
      <View style={styles.summaryHeader}>
        <ThemedText type="subtitle" style={{ color: theme.textPrimary, flex: 1 }}>
          {submission.studentLabel ?? submission.guardianName ?? 'Application'}
        </ThemedText>
        <StatusBadge
          label={adminApplicationStatusLabel(submission.status)}
          colors={applicationStatusBadgeStyle(submission.status, theme)}
        />
      </View>
    </View>
  );
}

export function SubmissionOverviewDetailsSection({
  submission,
}: {
  submission: AdminApplicationSubmission;
}) {
  const theme = useAdminTheme();
  const rows = [
    submission.formTitle ? { label: 'Application', value: submission.formTitle } : null,
    submission.programName ? { label: 'School year', value: submission.programName } : null,
    submission.contactEmail ? { label: 'Email', value: submission.contactEmail } : null,
    submission.updatedAt
      ? { label: 'Updated', value: formatShortDate(submission.updatedAt) }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  if (rows.length === 0) return null;

  return (
    <DetailSection title="Application details" description="Form and contact information.">
      {rows.map((row) => (
        <View key={row.label} style={styles.detailsRow}>
          <ThemedText type="small" style={{ color: theme.textTertiary }}>
            {row.label}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {row.value}
          </ThemedText>
        </View>
      ))}
    </DetailSection>
  );
}

export function SubmissionDecisionSection({
  currentStatus,
  onAction,
  loadingStatus,
}: {
  currentStatus: string;
  onAction: (status: string) => void;
  loadingStatus: string | null;
}) {
  const theme = useAdminTheme();
  const actions = getApplicationDecisionActions(currentStatus);
  if (actions.length === 0) return null;

  return (
    <DetailSection title="Decision" description="Update this application's review status.">
      <View style={styles.actionRow}>
        {actions.map((action) => {
          const loading = loadingStatus === action.status;
          const backgroundColor =
            action.variant === 'primary'
              ? theme.accent
              : action.variant === 'danger'
                ? theme.errorBg
                : theme.elevated;
          const color =
            action.variant === 'primary'
              ? '#FFFFFF'
              : action.variant === 'danger'
                ? theme.error
                : theme.textPrimary;

          return (
            <Pressable
              key={action.status}
              accessibilityRole="button"
              disabled={loadingStatus != null}
              onPress={() => onAction(action.status)}
              style={[styles.actionButton, { backgroundColor, opacity: loading ? 0.7 : 1 }]}>
              {loading ? (
                <ActivityIndicator color={color} size="small" />
              ) : (
                <ThemedText type="smallBold" style={{ color }}>
                  {action.label}
                </ThemedText>
              )}
            </Pressable>
          );
        })}
      </View>
    </DetailSection>
  );
}

export function SubmissionEnrollmentActionsSection({
  currentStatus,
  hasPublishedChecklist,
  onMarkEnrolled,
  loading,
}: {
  currentStatus: string;
  hasPublishedChecklist: boolean;
  onMarkEnrolled: () => void;
  loading: boolean;
}) {
  const theme = useAdminTheme();
  if (currentStatus !== 'accepted' && currentStatus !== 'enrolling') return null;

  return (
    <DetailSection
      title="Enrollment"
      description={
        currentStatus === 'accepted'
          ? hasPublishedChecklist
            ? 'Start enrollment from the web admin to choose checklist variants.'
            : 'No published enrollment checklist is linked to this program yet.'
          : 'Mark this student as enrolled when the checklist is complete.'
      }>
      {currentStatus === 'enrolling' ? (
        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={onMarkEnrolled}
          style={[styles.actionButton, { backgroundColor: theme.accent, alignSelf: 'flex-start' }]}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
              Mark enrolled
            </ThemedText>
          )}
        </Pressable>
      ) : null}
    </DetailSection>
  );
}

export function SubmissionApplicationStepsSection({
  detail,
  feeStatus,
  applicationStatus,
  submittedAt,
  feeEnabled,
  onItemPress,
  activeItemId,
}: {
  detail: ApplicationDetail;
  feeStatus: string;
  applicationStatus: string;
  submittedAt: string | null;
  feeEnabled: boolean;
  onItemPress?: (stepId: string) => void;
  activeItemId?: string;
}) {
  const subtitleParts: string[] = [];
  if (applicationStatus !== 'draft' && submittedAt) {
    subtitleParts.push(`Submitted ${formatShortDate(submittedAt)}`);
  }
  if (feeEnabled && feeStatus !== 'not_required') {
    subtitleParts.push(`Fee ${(FEE_STATUS_LABELS[feeStatus] ?? feeStatus).toLowerCase()}`);
  }

  const steps = buildApplicationFormSteps(detail.schema, detail.feeConfig);
  const stepsWithStatus = computeApplicationFormStepStatuses(steps, {
    applicationStatus,
    stepIndex: detail.stepIndex,
    feeStatus,
  });
  const progress = summarizeApplicationFormProgress(stepsWithStatus);

  const items: DetailStepTimelineItem[] = stepsWithStatus.map((step) => ({
    id: step.id,
    title: step.label,
    status: step.status,
    kindLabel: stepKindLabel(step.kind),
  }));

  return (
    <DetailSection
      title={detail.formTitle}
      description={subtitleParts.length ? subtitleParts.join(' · ') : undefined}>
      <DetailProgressBar completed={progress.completed} total={progress.total} />
      <DetailStepTimeline
        items={items}
        showStatusText={progress.completed < progress.total}
        onItemPress={onItemPress}
        activeItemId={activeItemId}
      />
    </DetailSection>
  );
}

export function SubmissionEnrollmentStepsSection({
  checklist,
  loading,
  error,
  onItemPress,
  activeItemId,
}: {
  checklist: LoadedEnrollmentChecklist | null;
  loading: boolean;
  error: string | null;
  onItemPress?: (itemId: string) => void;
  activeItemId?: string;
}) {
  const theme = useAdminTheme();
  const instanceByTemplateId = useMemo(
    () => new Map((checklist?.instances ?? []).map((instance) => [instance.templateItemId, instance])),
    [checklist?.instances],
  );

  if (loading) {
    return (
      <DetailSection title="Enrollment checklist" description="Enrollment checklist progress">
        <DetailTimelineSectionSkeleton />
      </DetailSection>
    );
  }

  if (error) {
    return (
      <ThemedText type="small" style={{ color: theme.error }}>
        {error}
      </ThemedText>
    );
  }

  if (!checklist) return null;

  const items: DetailStepTimelineItem[] = checklist.items.map((item) => {
    const instance = instanceByTemplateId.get(item.id);
    const status = instance?.status ?? 'not_started';
    return {
      id: item.id,
      title: item.label,
      status,
      kindLabel: checklistItemTypeLabel(item.type),
      optional: !item.required,
      meta: buildEnrollmentTimelineMeta(item, instance),
    };
  });

  return (
    <DetailSection title={checklist.title} description="Enrollment checklist progress">
      <DetailProgressBar
        completed={checklist.progress.completed}
        total={checklist.progress.total}
      />
      <DetailStepTimeline
        items={items}
        rowSpacing={Spacing.five}
        showStatusText={checklist.progress.completed < checklist.progress.total}
        onItemPress={onItemPress}
        activeItemId={activeItemId}
      />
    </DetailSection>
  );
}

export function SubmissionPostSubmitSection({ steps }: { steps: AdminPostSubmitStep[] }) {
  if (steps.length === 0) return null;

  const items: DetailStepTimelineItem[] = steps.map((step) => ({
    id: step.actionId,
    title: step.title,
    status: step.status === 'scheduled' ? 'completed' : 'not_started',
    kindLabel: 'Post-application',
    optional: !step.required,
    meta:
      step.status === 'scheduled'
        ? step.booking?.completedManuallyAt
          ? 'Marked complete by admin'
          : `Scheduled ${formatShortDate(step.booking?.scheduledDate ?? step.booking?.scheduledDate ?? '')}`
        : 'Not scheduled',
  }));

  return (
    <DetailSection title="Post-application" description="Required visits and follow-ups">
      <DetailStepTimeline items={items} />
    </DetailSection>
  );
}

export function SubmissionGuardiansSection({
  guardians,
  loading,
}: {
  guardians: FamilyGuardianRecord[];
  loading: boolean;
}) {
  const theme = useAdminTheme();

  if (loading) {
    return (
      <DetailSection title="Guardians" description="Family contacts for this application.">
        <DetailRowListSkeleton rowCount={2} />
      </DetailSection>
    );
  }

  if (guardians.length === 0) {
    return (
      <DetailSection title="Guardians" description="No linked family contacts yet.">
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          This application is not linked to a family record.
        </ThemedText>
      </DetailSection>
    );
  }

  return (
    <DetailSection title="Guardians" description="Family contacts for this application.">
      {guardians.map((guardian) => {
        const name = [guardian.firstName, guardian.lastName].filter(Boolean).join(' ') || 'Unnamed';
        return (
          <View key={guardian.id} style={styles.guardianRow}>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
              {name}
              {guardian.isPrimary ? ' · Primary' : ''}
            </ThemedText>
            {guardian.email ? (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {guardian.email}
              </ThemedText>
            ) : null}
          </View>
        );
      })}
    </DetailSection>
  );
}

export function SubmissionHistorySection({
  events,
  currentApplicationId,
  currentApplicationStatus,
  loading,
  unlinked,
  onSelectApplication,
}: {
  events: FamilyAdmissionTimelineEvent[];
  currentApplicationId: string;
  currentApplicationStatus: string;
  loading: boolean;
  unlinked: boolean;
  onSelectApplication: (applicationId: string) => void;
}) {
  const theme = useAdminTheme();

  if (loading) {
    return (
      <DetailSection
        title="Admission history"
        description="Timeline of applications and enrollment activity for this family.">
        <DetailRowListSkeleton rowCount={3} />
      </DetailSection>
    );
  }

  if (unlinked) {
    return (
      <DetailSection title="Admission history" description="This application is not linked to a family record.">
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Link a family to see admission history across applications.
        </ThemedText>
      </DetailSection>
    );
  }

  return (
    <DetailSection
      title="Admission history"
      description="Timeline of applications and enrollment activity for this family.">
      <AdmissionHistoryTimeline
        events={events}
        currentApplicationId={currentApplicationId}
        currentApplicationStatus={currentApplicationStatus}
        onSelect={onSelectApplication}
      />
    </DetailSection>
  );
}

export function SubmissionPaymentsSection({
  payments,
  loading,
  onPaymentPress,
  activePaymentId,
}: {
  payments: PaymentRecordDisplayRow[];
  loading: boolean;
  onPaymentPress?: (paymentId: string) => void;
  activePaymentId?: string;
}) {
  const theme = useAdminTheme();

  if (loading) {
    return (
      <DetailSection
        title="Payments"
        description="Application fees and enrollment charges for this application.">
        <DetailRowListSkeleton rowCount={3} />
      </DetailSection>
    );
  }

  if (payments.length === 0) {
    return (
      <DetailSection
        title="Payments"
        description="Application fees and enrollment charges for this application.">
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          No payments recorded yet.
        </ThemedText>
      </DetailSection>
    );
  }

  return (
    <DetailSection
      title="Payments"
      description="Application fees and enrollment charges for this application.">
      {payments.map((payment) => {
        const isActive = activePaymentId === payment.id;
        const row = (
          <>
            <View style={styles.paymentHeader}>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary, flex: 1 }}>
                {payment.label ?? PAYMENT_TYPE_LABELS[payment.paymentType]}
              </ThemedText>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                {formatPaymentAmount(payment.amountCents)}
              </ThemedText>
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {PAYMENT_STATUS_LABELS[payment.status]} · {formatPaymentDateTime(payment.paidAt ?? payment.createdAt)}
            </ThemedText>
            {payment.payerEmail ? (
              <ThemedText type="small" style={{ color: theme.textTertiary }}>
                {payment.payerEmail}
              </ThemedText>
            ) : null}
          </>
        );

        if (!onPaymentPress) {
          return (
            <View
              key={payment.id}
              style={[styles.paymentRow, { borderColor: theme.border }]}>
              {row}
            </View>
          );
        }

        return (
          <Pressable
            key={payment.id}
            accessibilityRole="button"
            onPress={() => onPaymentPress(payment.id)}
            style={({ pressed }) => [
              styles.paymentRow,
              {
                borderColor: isActive ? theme.accent : theme.border,
                backgroundColor: isActive ? theme.accentLight : 'transparent',
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            {row}
          </Pressable>
        );
      })}
    </DetailSection>
  );
}

export async function loadEnrollmentChecklistState(
  supabase: Parameters<typeof loadEnrollmentChecklistForApplication>[0],
  applicationId: string,
  organizationId: string,
) {
  return loadEnrollmentChecklistForApplication(supabase, applicationId, organizationId);
}

export async function loadPaymentsState(
  supabase: Parameters<typeof listApplicationPayments>[0],
  applicationId: string,
) {
  return listApplicationPayments(supabase, applicationId);
}

const styles = StyleSheet.create({
  summaryStrip: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  detailsRow: {
    gap: 4,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actionButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  guardianRow: {
    gap: 4,
  },
  paymentRow: {
    gap: 4,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
