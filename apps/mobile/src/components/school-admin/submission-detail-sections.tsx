import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { DetailProgressBar } from '@/components/school-admin/detail-progress-bar';
import { AdmissionHistoryTimeline } from '@/components/school-admin/admission-history-timeline';
import { StoryButton } from '@/components/story/story-button';
import { StoryProgressBar } from '@/components/story/story-progress-bar';
import { StoryStepTimeline } from '@/components/story/story-step-timeline';
import {
  DetailRowListSkeleton,
  DetailTimelineSectionSkeleton,
} from '@/components/school-admin/submission-detail-skeleton';
import {
  DetailStepTimeline,
  type DetailStepTimelineItem,
} from '@/components/school-admin/detail-step-timeline';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import type { AdminPostSubmitStep } from '@/lib/admissions/admin-post-submit-steps';
import type { ApplicationDetail } from '@/lib/admissions/application-detail';
import {
  buildApplicationFormSteps,
  computeApplicationFormStepStatuses,
  summarizeApplicationFormProgress,
} from '@/lib/admissions/application-form-steps';
import { FEE_STATUS_LABELS } from '@/lib/admissions/application-status-ui';
import { getApplicationDecisionActions } from '@/lib/admissions/application-status-transitions';
import type { AdminApplicationSubmission } from '@/lib/admissions/application-submissions';
import { formatShortDate } from '@/lib/admissions/application-submissions';
import {
  buildEnrollmentTimelineMeta,
  checklistItemTypeLabel,
  loadEnrollmentChecklistForApplication,
  resolveChecklistProgress,
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

export function SubmissionOverviewDetailsSection({
  submission,
}: {
  submission: AdminApplicationSubmission;
}) {
  const theme = useParentTheme();
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
    <StoryDetailSection title="Application details" description="Form and contact information.">
      {rows.map((row) => (
        <View key={row.label} style={styles.detailsRow}>
          <Text style={[styles.detailLabel, { color: theme.muted }]}>{row.label}</Text>
          <Text style={[styles.detailValue, { color: theme.ink }]}>{row.value}</Text>
        </View>
      ))}
    </StoryDetailSection>
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
  const actions = getApplicationDecisionActions(currentStatus);
  if (actions.length === 0) return null;

  return (
    <StoryDetailSection title="Decision" description="Update this application's review status.">
      <View style={styles.actionRow}>
        {actions.map((action) => {
          const loading = loadingStatus === action.status;
          const variant =
            action.variant === 'primary'
              ? 'primary'
              : action.variant === 'danger'
                ? 'outline'
                : 'soft';

          return (
            <View key={action.status} style={styles.actionButtonWrap}>
              {loading ? (
                <ActivityIndicator size="small" />
              ) : (
                <StoryButton
                  label={action.label}
                  variant={variant}
                  disabled={loadingStatus != null}
                  onPress={() => onAction(action.status)}
                  style={styles.actionButton}
                />
              )}
            </View>
          );
        })}
      </View>
    </StoryDetailSection>
  );
}

export function SubmissionEnrollmentActionsSection({
  currentStatus,
  hasPublishedChecklist,
  programName,
  enrollmentChecklistName,
  onMarkEnrolled,
  loading,
}: {
  currentStatus: string;
  hasPublishedChecklist: boolean;
  programName?: string | null;
  enrollmentChecklistName?: string | null;
  onMarkEnrolled: () => void;
  loading: boolean;
}) {
  if (currentStatus !== 'accepted' && currentStatus !== 'enrolling') return null;

  const description = (() => {
    if (currentStatus === 'enrolling') {
      return 'Mark this student as enrolled when the checklist is complete.';
    }
    if (hasPublishedChecklist) {
      if (enrollmentChecklistName && programName) {
        return `Uses ${enrollmentChecklistName} for ${programName}. Start enrollment from the web admin to choose checklist variants.`;
      }
      return 'Start enrollment from the web admin to choose checklist variants.';
    }
    if (programName) {
      return `${programName} has no enrollment checklist — mark enrolled directly when paperwork is handled offline.`;
    }
    return 'No published enrollment checklist is linked to this program yet.';
  })();

  return (
    <StoryDetailSection title="Enrollment" description={description}>
      {currentStatus === 'enrolling' ? (
        loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <StoryButton
            label="Mark enrolled"
            variant="primary"
            disabled={loading}
            onPress={onMarkEnrolled}
            style={styles.enrollButton}
          />
        )
      ) : null}
    </StoryDetailSection>
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
  timelineRowSpacing,
  embedded = false,
}: {
  detail: ApplicationDetail;
  feeStatus: string;
  applicationStatus: string;
  submittedAt: string | null;
  feeEnabled: boolean;
  onItemPress?: (stepId: string) => void;
  activeItemId?: string;
  timelineRowSpacing?: number;
  embedded?: boolean;
}) {
  const subtitleParts: string[] = [];
  if (applicationStatus !== 'draft' && submittedAt) {
    subtitleParts.push(`Submitted ${formatShortDate(submittedAt)}`);
  }
  const resolvedFeeStatus = feeStatus ?? 'not_required';
  if (feeEnabled && resolvedFeeStatus !== 'not_required') {
    const feeLabel =
      FEE_STATUS_LABELS[resolvedFeeStatus] ?? resolvedFeeStatus.replace(/_/g, ' ');
    subtitleParts.push(`Fee ${feeLabel.toLowerCase()}`);
  }

  const steps = buildApplicationFormSteps(detail.schema, detail.feeConfig);
  const stepsWithStatus = computeApplicationFormStepStatuses(steps, {
    applicationStatus,
    stepIndex: detail.stepIndex,
    feeStatus: resolvedFeeStatus,
  });
  const progress = summarizeApplicationFormProgress(stepsWithStatus);

  const items: DetailStepTimelineItem[] = stepsWithStatus.map((step) => ({
    id: step.id,
    title: step.label,
    status: step.status,
    kindLabel: stepKindLabel(step.kind),
  }));

  return (
    <StoryDetailSection
      title={detail.formTitle}
      description={subtitleParts.length ? subtitleParts.join(' · ') : undefined}
      variant={embedded ? 'embedded' : 'card'}>
      {embedded ? (
        <StoryProgressBar completed={progress.completed} total={progress.total} />
      ) : (
        <DetailProgressBar completed={progress.completed} total={progress.total} />
      )}
      {embedded ? (
        <StoryStepTimeline
          items={items}
          showStatusText={progress.completed < progress.total}
          onItemPress={onItemPress}
          activeItemId={activeItemId}
        />
      ) : (
        <DetailStepTimeline
          items={items}
          rowSpacing={timelineRowSpacing}
          showStatusText={progress.completed < progress.total}
          onItemPress={onItemPress}
          activeItemId={activeItemId}
        />
      )}
    </StoryDetailSection>
  );
}

export function SubmissionEnrollmentStepsSection({
  checklist,
  loading,
  error,
  onItemPress,
  activeItemId,
  embedded = false,
}: {
  checklist: LoadedEnrollmentChecklist | null;
  loading: boolean;
  error: string | null;
  onItemPress?: (itemId: string) => void;
  activeItemId?: string;
  embedded?: boolean;
}) {
  const theme = useParentTheme();
  const instanceByTemplateId = useMemo(
    () => new Map((checklist?.instances ?? []).map((instance) => [instance.templateItemId, instance])),
    [checklist?.instances],
  );

  if (loading) {
    return (
      <StoryDetailSection
        title="Enrollment checklist"
        description="Enrollment checklist progress"
        variant={embedded ? 'embedded' : 'card'}>
        <DetailTimelineSectionSkeleton />
      </StoryDetailSection>
    );
  }

  if (error) {
    return (
      <Text style={[styles.errorText, { color: theme.alert }]}>{error}</Text>
    );
  }

  if (!checklist) return null;

  const progress = resolveChecklistProgress(checklist);

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
    <StoryDetailSection
      title={checklist.title}
      description="Enrollment checklist progress"
      variant={embedded ? 'embedded' : 'card'}>
      {embedded ? (
        <StoryProgressBar completed={progress.completed} total={progress.total} />
      ) : (
        <DetailProgressBar completed={progress.completed} total={progress.total} />
      )}
      {embedded ? (
        <StoryStepTimeline
          items={items}
          showStatusText={progress.completed < progress.total}
          onItemPress={onItemPress}
          activeItemId={activeItemId}
        />
      ) : (
        <DetailStepTimeline
          items={items}
          rowSpacing={Spacing.five}
          showStatusText={progress.completed < progress.total}
          onItemPress={onItemPress}
          activeItemId={activeItemId}
        />
      )}
    </StoryDetailSection>
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
    <StoryDetailSection title="Post-application" description="Required visits and follow-ups">
      <DetailStepTimeline items={items} />
    </StoryDetailSection>
  );
}

export function SubmissionGuardiansSection({
  guardians,
  loading,
}: {
  guardians: FamilyGuardianRecord[];
  loading: boolean;
}) {
  const theme = useParentTheme();

  if (loading) {
    return (
      <StoryDetailSection title="Guardians" description="Family contacts for this application.">
        <DetailRowListSkeleton rowCount={2} />
      </StoryDetailSection>
    );
  }

  if (guardians.length === 0) {
    return (
      <StoryDetailSection title="Guardians" description="No linked family contacts yet.">
        <Text style={[styles.bodyText, { color: theme.muted }]}>
          This application is not linked to a family record.
        </Text>
      </StoryDetailSection>
    );
  }

  return (
    <StoryDetailSection title="Guardians" description="Family contacts for this application.">
      {guardians.map((guardian) => {
        const name = [guardian.firstName, guardian.lastName].filter(Boolean).join(' ') || 'Unnamed';
        return (
          <View key={guardian.id} style={styles.guardianRow}>
            <Text style={[styles.bodyTextBold, { color: theme.ink }]}>
              {name}
              {guardian.isPrimary ? ' · Primary' : ''}
            </Text>
            {guardian.email ? (
              <Text style={[styles.bodyText, { color: theme.muted }]}>{guardian.email}</Text>
            ) : null}
          </View>
        );
      })}
    </StoryDetailSection>
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
  const theme = useParentTheme();

  if (loading) {
    return (
      <StoryDetailSection
        title="Admission history"
        description="Timeline of applications and enrollment activity for this family.">
        <DetailRowListSkeleton rowCount={3} />
      </StoryDetailSection>
    );
  }

  if (unlinked) {
    return (
      <StoryDetailSection
        title="Admission history"
        description="This application is not linked to a family record.">
        <Text style={[styles.bodyText, { color: theme.muted }]}>
          Link a family to see admission history across applications.
        </Text>
      </StoryDetailSection>
    );
  }

  return (
    <StoryDetailSection
      title="Admission history"
      description="Timeline of applications and enrollment activity for this family.">
      <AdmissionHistoryTimeline
        events={events}
        currentApplicationId={currentApplicationId}
        currentApplicationStatus={currentApplicationStatus}
        onSelect={onSelectApplication}
      />
    </StoryDetailSection>
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
  const theme = useParentTheme();

  if (loading) {
    return (
      <StoryDetailSection
        title="Payments"
        description="Application fees and enrollment charges for this application.">
        <DetailRowListSkeleton rowCount={3} />
      </StoryDetailSection>
    );
  }

  if (payments.length === 0) {
    return (
      <StoryDetailSection
        title="Payments"
        description="Application fees and enrollment charges for this application.">
        <Text style={[styles.bodyText, { color: theme.muted }]}>No payments recorded yet.</Text>
      </StoryDetailSection>
    );
  }

  return (
    <StoryDetailSection
      title="Payments"
      description="Application fees and enrollment charges for this application.">
      {payments.map((payment) => {
        const isActive = activePaymentId === payment.id;
        const row = (
          <>
            <View style={styles.paymentHeader}>
              <Text style={[styles.bodyTextBold, { color: theme.ink, flex: 1 }]}>
                {payment.label ?? PAYMENT_TYPE_LABELS[payment.paymentType]}
              </Text>
              <Text style={[styles.bodyTextBold, { color: theme.ink }]}>
                {formatPaymentAmount(payment.amountCents)}
              </Text>
            </View>
            <Text style={[styles.bodyText, { color: theme.muted }]}>
              {PAYMENT_STATUS_LABELS[payment.status]} ·{' '}
              {formatPaymentDateTime(payment.paidAt ?? payment.createdAt)}
            </Text>
            {payment.payerEmail ? (
              <Text style={[styles.bodyText, { color: theme.muted }]}>{payment.payerEmail}</Text>
            ) : null}
          </>
        );

        if (!onPaymentPress) {
          return (
            <View key={payment.id} style={[styles.paymentRow, { borderColor: theme.line }]}>
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
                borderColor: isActive ? theme.primary : theme.line,
                backgroundColor: isActive ? theme.primarySoft : 'transparent',
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            {row}
          </Pressable>
        );
      })}
    </StoryDetailSection>
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
  detailsRow: {
    gap: 4,
  },
  detailLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  detailValue: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyTextBold: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  errorText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actionButtonWrap: {
    minWidth: 140,
    flexGrow: 1,
  },
  actionButton: {
    width: '100%',
    minHeight: 44,
  },
  enrollButton: {
    alignSelf: 'flex-start',
    width: 'auto',
    minWidth: 160,
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
