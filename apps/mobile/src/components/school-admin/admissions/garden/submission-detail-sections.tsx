import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { GStepList, type GStep, type GStepState } from '@/components/parent/garden/steps';
import { CHIP_TONES, Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  GCard,
  GChip,
  GLink,
  GPressable,
  GProgress,
  GSkeleton,
  GToyButton,
} from '@/components/parent/garden/ui';
import { nextStepChipTone } from '@/components/school-admin/admissions/garden/submission-row';
import { AdminIconChip, AdminInfoRow } from '@/components/school-admin/garden/admin-ui';
import { deriveSubmissionNextStep } from '@/lib/admissions/admin-submission-next-step';
import type { AdminPostSubmitStep } from '@/lib/admissions/admin-post-submit-steps';
import type { ApplicationDetail } from '@/lib/admissions/application-detail';
import {
  summarizeApplicationFormProgress,
  type ApplicationFormStepWithStatus,
} from '@/lib/admissions/application-form-steps';
import {
  adminApplicationStatusLabel,
  applicationStatusChipTone,
  FEE_STATUS_LABELS,
} from '@/lib/admissions/application-status-ui';
import {
  getApplicationDecisionActions,
  type ApplicationDecisionAction,
} from '@/lib/admissions/application-status-transitions';
import {
  formatShortDate,
  type AdminApplicationSubmission,
  type FamilyAdmissionTimelineEvent,
} from '@/lib/admissions/application-submissions';
import {
  buildEnrollmentTimelineMeta,
  checklistItemTypeLabel,
  resolveChecklistProgress,
  type LoadedEnrollmentChecklist,
} from '@/lib/admissions/enrollment-checklist';
import {
  formatPaymentAmount,
  formatPaymentDateTime,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentRecordDisplayRow,
} from '@/lib/admissions/payment-records';

type IoniconName = keyof typeof Ionicons.glyphMap;

/* ------------------------------------------------------------------ */
/* Journey                                                             */
/* ------------------------------------------------------------------ */

const JOURNEY = [
  { id: 'draft', title: 'Application started' },
  { id: 'submitted', title: 'Submitted' },
  { id: 'under_review', title: 'Under review' },
  { id: 'accepted', title: 'Accepted' },
  { id: 'enrolling', title: 'Enrollment checklist' },
  { id: 'enrolled', title: 'Enrolled' },
] as const;

const JOURNEY_INDEX: Record<string, number> = {
  draft: 0,
  submitted: 1,
  fee_pending: 1,
  under_review: 2,
  observation: 2,
  accepted: 3,
  enrolling: 4,
  enrolled: 5,
};

/** Where an application is, as visual steps (status only; labels from the status list). */
export function applicationJourneySteps(
  status: string,
  nextStepLabel: string | null,
): GStep[] {
  const closed = status === 'declined' || status === 'withdrawn';
  if (closed) {
    return [
      { id: 'draft', title: 'Application started', state: 'done' },
      { id: 'submitted', title: 'Submitted', state: 'done' },
      {
        id: status,
        title: adminApplicationStatusLabel(status),
        state: 'blocked',
        chip: { label: 'Closed', tone: 'neutral' },
      },
    ];
  }
  const at = JOURNEY_INDEX[status] ?? 0;
  return JOURNEY.map((step, index) => {
    const state: GStepState =
      index < at || status === 'enrolled' ? 'done' : index === at ? 'current' : 'todo';
    const isCurrent = state === 'current';
    return {
      id: step.id,
      title:
        isCurrent && (status === 'fee_pending' || status === 'observation')
          ? adminApplicationStatusLabel(status)
          : step.title,
      state,
      chip: isCurrent && nextStepLabel ? { label: nextStepLabel, tone: 'info' } : null,
    };
  });
}

export function JourneyCard({
  submission,
  status,
  index,
}: {
  submission: AdminApplicationSubmission;
  status: string;
  index: number;
}) {
  const next = deriveSubmissionNextStep({ ...submission, status });
  const steps = applicationJourneySteps(status, next.primary !== '—' ? next.primary : null);
  return (
    <GCard
      title="Where this application is"
      index={index}
      testID="submission-journey"
      action={<GChip label={next.primary} tone={nextStepChipTone(next.tone)} />}>
      <GStepList steps={steps} accessibilityLabel="Application progress" />
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Decision                                                            */
/* ------------------------------------------------------------------ */

function DecisionButton({
  decision,
  pending,
  disabled,
  onPress,
}: {
  decision: ApplicationDecisionAction;
  pending: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const danger = decision.variant === 'danger';
  const fg = danger ? CHIP_TONES.alert.fg : Garden.ink;
  return (
    <GPressable
      accessibilityLabel={decision.label}
      accessibilityState={{ disabled, busy: pending }}
      disabled={disabled}
      haptic={danger ? 'press' : 'tap'}
      onPress={onPress}
      style={[
        styles.decisionButton,
        danger
          ? { borderColor: CHIP_TONES.alert.fg, backgroundColor: Garden.white }
          : { borderColor: Garden.ink25, backgroundColor: Garden.white },
        disabled && !pending && styles.dim,
      ]}>
      {pending ? <ActivityIndicator size="small" color={fg} /> : null}
      <Text style={[styles.decisionLabel, { color: fg }]}>{pending ? 'Saving…' : decision.label}</Text>
    </GPressable>
  );
}

/** "Decision" (title kept: Maestro asserts it). Primary = the one toy button. */
export function DecisionCard({
  status,
  pendingDecision,
  flash,
  onDecide,
  index,
}: {
  status: string;
  pendingDecision: string | null;
  flash: boolean;
  onDecide: (decision: ApplicationDecisionAction) => void;
  index: number;
}) {
  const actions = getApplicationDecisionActions(status);
  if (actions.length === 0) return null;
  const busy = pendingDecision != null;
  const primary = actions.find((action) => action.variant === 'primary');
  const others = actions.filter((action) => action !== primary);

  return (
    <GCard title="Decision" index={index} testID="submission-decision" style={flash && styles.flash}>
      <Text style={styles.description}>Update this application&apos;s review status.</Text>
      <View style={styles.decisionActions}>
        {primary ? (
          <GToyButton
            label={pendingDecision === primary.status ? 'Saving…' : primary.label}
            icon="checkmark"
            size="md"
            fullWidth
            loading={pendingDecision === primary.status}
            disabled={busy && pendingDecision !== primary.status}
            onPress={() => onDecide(primary)}
          />
        ) : null}
        <View style={styles.decisionRow}>
          {others.map((action) => (
            <DecisionButton
              key={action.status}
              decision={action}
              pending={pendingDecision === action.status}
              disabled={busy}
              onPress={() => onDecide(action)}
            />
          ))}
        </View>
      </View>
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Enrollment                                                          */
/* ------------------------------------------------------------------ */

export function EnrollmentCard({
  status,
  hasPublishedChecklist,
  programName,
  enrollmentChecklistName,
  pending,
  onMarkEnrolled,
  onStartOnWeb,
  index,
}: {
  status: string;
  hasPublishedChecklist: boolean;
  programName?: string | null;
  enrollmentChecklistName?: string | null;
  pending: boolean;
  onMarkEnrolled: () => void;
  onStartOnWeb: () => void;
  index: number;
}) {
  if (status !== 'accepted' && status !== 'enrolling') return null;

  const showMarkEnrolled = status === 'enrolling' || (status === 'accepted' && !hasPublishedChecklist);
  const startsOnWeb = status === 'accepted' && hasPublishedChecklist;

  const description = (() => {
    if (status === 'enrolling') {
      return 'Mark this student as enrolled when the checklist is complete.';
    }
    if (hasPublishedChecklist) {
      if (enrollmentChecklistName && programName) {
        return `Uses ${enrollmentChecklistName} for ${programName}. Start enrollment from the web admin to choose checklist variants.`;
      }
      return 'Start enrollment from the web admin to choose checklist variants.';
    }
    if (programName) {
      return `${programName} has no enrollment checklist. Accept enrolls automatically; use Mark enrolled if accept could not finish enrollment.`;
    }
    return 'No published enrollment checklist is linked to this program yet. Accept enrolls automatically when possible.';
  })();

  return (
    <GCard title="Enrollment" index={index} testID="submission-enrollment">
      <Text style={styles.description}>{description}</Text>
      {showMarkEnrolled ? (
        <GToyButton
          label={pending ? 'Marking enrolled…' : 'Mark enrolled'}
          icon="school-outline"
          size="md"
          loading={pending}
          onPress={onMarkEnrolled}
          style={styles.cardButton}
        />
      ) : null}
      {startsOnWeb ? (
        <GLink
          label="Start enrollment on the web"
          icon="open-outline"
          onPress={onStartOnWeb}
          style={styles.cardLink}
        />
      ) : null}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Steps (application form / enrollment checklist / post-application)  */
/* ------------------------------------------------------------------ */

type TimelineStatus = 'not_started' | 'in_progress' | 'completed' | 'waived';

function stepState(status: TimelineStatus): GStepState {
  if (status === 'completed' || status === 'waived') return 'done';
  if (status === 'in_progress') return 'current';
  return 'todo';
}

function statusChip(status: TimelineStatus): GStep['chip'] {
  if (status === 'waived') return { label: 'Waived', tone: 'neutral' };
  if (status === 'in_progress') return { label: 'In progress', tone: 'info' };
  return null;
}

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

function ProgressHeader({ completed, total, label }: { completed: number; total: number; label: string }) {
  const done = total > 0 && completed >= total;
  return (
    <View style={styles.progressHeader}>
      <View style={styles.progressRow}>
        <Text style={styles.progressCount}>
          {completed} of {total} complete
        </Text>
        {done ? <GChip label="All done" tone="success" icon="checkmark" /> : null}
      </View>
      <GProgress value={total > 0 ? completed / total : 0} done={done} label={label} />
    </View>
  );
}

export function ApplicationStepsCard({
  detail,
  steps,
  feeStatus,
  applicationStatus,
  submittedAt,
  feeEnabled,
  onOpenStep,
  index,
}: {
  detail: ApplicationDetail;
  steps: ApplicationFormStepWithStatus[];
  feeStatus: string;
  applicationStatus: string;
  submittedAt: string | null;
  feeEnabled: boolean;
  onOpenStep: (stepId: string) => void;
  index: number;
}) {
  const subtitleParts: string[] = [];
  if (applicationStatus !== 'draft' && submittedAt) {
    subtitleParts.push(`Submitted ${formatShortDate(submittedAt)}`);
  }
  const resolvedFeeStatus = feeStatus ?? 'not_required';
  if (feeEnabled && resolvedFeeStatus !== 'not_required') {
    const feeLabel = FEE_STATUS_LABELS[resolvedFeeStatus] ?? resolvedFeeStatus.replace(/_/g, ' ');
    subtitleParts.push(`Fee ${feeLabel.toLowerCase()}`);
  }
  const progress = summarizeApplicationFormProgress(steps);

  return (
    <GCard title={detail.formTitle} index={index} testID="submission-application-steps">
      {subtitleParts.length ? <Text style={styles.description}>{subtitleParts.join(' · ')}</Text> : null}
      <ProgressHeader
        completed={progress.completed}
        total={progress.total}
        label={`Application form: ${progress.completed} of ${progress.total} steps complete`}
      />
      <GStepList
        style={styles.steps}
        steps={steps.map((step) => ({
          id: step.id,
          title: step.label,
          meta: stepKindLabel(step.kind),
          state: stepState(step.status),
          chip: statusChip(step.status),
          onPress: () => onOpenStep(step.id),
        }))}
      />
    </GCard>
  );
}

export function EnrollmentStepsCard({
  checklist,
  loading,
  error,
  onRetry,
  onOpenItem,
  index,
}: {
  checklist: LoadedEnrollmentChecklist | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenItem: (itemId: string) => void;
  index: number;
}) {
  const instanceByTemplateId = useMemo(
    () => new Map((checklist?.instances ?? []).map((instance) => [instance.templateItemId, instance])),
    [checklist?.instances],
  );

  if (loading) {
    return (
      <GCard title="Enrollment checklist" index={index}>
        <View style={styles.skSteps} accessibilityLabel="Loading enrollment checklist">
          <GSkeleton style={styles.skBar} />
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.skStep}>
              <GSkeleton style={styles.skMarker} />
              <GSkeleton style={styles.skLine} />
            </View>
          ))}
        </View>
      </GCard>
    );
  }

  if (error) {
    return (
      <GCard title="Enrollment checklist" index={index}>
        <GInlineBanner
          tone="error"
          title="Couldn't load the enrollment checklist"
          description={error}
          action={<GLink label="Try again" icon="refresh" onPress={onRetry} />}
        />
      </GCard>
    );
  }

  if (!checklist) return null;
  const progress = resolveChecklistProgress(checklist);

  return (
    <GCard title={checklist.title} index={index} testID="submission-enrollment-steps">
      <Text style={styles.description}>Enrollment checklist progress</Text>
      <ProgressHeader
        completed={progress.completed}
        total={progress.total}
        label={`Enrollment checklist: ${progress.completed} of ${progress.total} complete`}
      />
      <GStepList
        style={styles.steps}
        steps={checklist.items.map((item) => {
          const instance = instanceByTemplateId.get(item.id);
          const status = (instance?.status ?? 'not_started') as TimelineStatus;
          const meta = [checklistItemTypeLabel(item.type), buildEnrollmentTimelineMeta(item, instance)]
            .filter(Boolean)
            .join(' · ');
          return {
            id: item.id,
            title: item.label,
            meta: item.required ? meta : `${meta} · Optional`,
            state: stepState(status),
            chip: statusChip(status),
            onPress: () => onOpenItem(item.id),
          };
        })}
      />
    </GCard>
  );
}

export function PostSubmitCard({ steps, index }: { steps: AdminPostSubmitStep[]; index: number }) {
  if (steps.length === 0) return null;
  return (
    <GCard title="Post-application" index={index}>
      <Text style={styles.description}>Required visits and follow-ups</Text>
      <GStepList
        style={styles.steps}
        steps={steps.map((step) => {
          const scheduled = step.status === 'scheduled';
          const meta = scheduled
            ? step.booking?.completedManuallyAt
              ? 'Marked complete by admin'
              : `Scheduled ${formatShortDate(step.booking?.scheduledDate ?? '')}`
            : 'Not scheduled';
          return {
            id: step.actionId,
            title: step.title,
            meta: step.required ? meta : `${meta} · Optional`,
            state: scheduled ? 'done' : 'todo',
          };
        })}
      />
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Details                                                             */
/* ------------------------------------------------------------------ */

export function ApplicationDetailsCard({
  submission,
  index,
}: {
  submission: AdminApplicationSubmission;
  index: number;
}) {
  const rows = [
    submission.formTitle ? { label: 'Application', value: submission.formTitle } : null,
    submission.programName ? { label: 'School year', value: submission.programName } : null,
    submission.contactEmail ? { label: 'Email', value: submission.contactEmail } : null,
    submission.updatedAt ? { label: 'Updated', value: formatShortDate(submission.updatedAt) } : null,
  ].filter(Boolean) as { label: string; value: string }[];
  if (rows.length === 0) return null;

  return (
    <GCard title="Application details" index={index}>
      <Text style={styles.description}>Form and contact information.</Text>
      {rows.map((row, i) => (
        <AdminInfoRow key={row.label} label={row.label} value={row.value} divider={i > 0} />
      ))}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* History                                                             */
/* ------------------------------------------------------------------ */

const TIMELINE_ICONS: Record<FamilyAdmissionTimelineEvent['kind'], IoniconName> = {
  created: 'document-text-outline',
  draft: 'create-outline',
  submitted: 'send-outline',
  fee_paid: 'card-outline',
  enrollment: 'clipboard-outline',
};

const TIMELINE_TINTS: Record<FamilyAdmissionTimelineEvent['kind'], string> = {
  created: Garden.sky,
  draft: Garden.butter,
  submitted: Garden.lav,
  fee_paid: Garden.mint,
  enrollment: Garden.peach,
};

/** Same rule as the Story `AdmissionHistoryTimeline`. */
function isViewingEvent(
  event: FamilyAdmissionTimelineEvent,
  events: FamilyAdmissionTimelineEvent[],
  currentApplicationId: string,
  currentApplicationStatus: string,
): boolean {
  if (event.applicationId !== currentApplicationId) return false;
  if (currentApplicationStatus === 'enrolling') return event.kind === 'enrollment';
  if (currentApplicationStatus === 'draft') return event.kind === 'draft';
  const appEvents = events.filter(
    (entry) => entry.applicationId === currentApplicationId && entry.kind !== 'enrollment',
  );
  const hasSubmitted = appEvents.some((entry) => entry.kind === 'submitted');
  return event.kind === (hasSubmitted ? 'submitted' : 'created');
}

function eventChipTone(event: FamilyAdmissionTimelineEvent) {
  if (event.kind === 'enrollment' && event.enrollmentTone) {
    return event.enrollmentTone === 'complete'
      ? 'success'
      : event.enrollmentTone === 'in_progress'
        ? 'info'
        : 'neutral';
  }
  return event.applicationBadgeStatus ? applicationStatusChipTone(event.applicationBadgeStatus) : 'neutral';
}

export function HistoryCard({
  events,
  currentApplicationId,
  currentApplicationStatus,
  loading,
  unlinked,
  onOpenApplication,
}: {
  events: FamilyAdmissionTimelineEvent[];
  currentApplicationId: string;
  currentApplicationStatus: string;
  loading: boolean;
  unlinked: boolean;
  onOpenApplication: (applicationId: string) => void;
}) {
  const accent = useGardenAccent();

  if (loading) {
    return (
      <GCard title="Admission history">
        <View style={styles.skSteps} accessibilityLabel="Loading admission history">
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.skStep}>
              <GSkeleton style={styles.skMarker} />
              <GSkeleton style={styles.skEvent} />
            </View>
          ))}
        </View>
      </GCard>
    );
  }

  if (unlinked) {
    return (
      <GCard title="Admission history">
        <Text style={styles.description}>This application is not linked to a family record.</Text>
        <Text style={styles.body}>Link a family to see admission history across applications.</Text>
      </GCard>
    );
  }

  return (
    <GCard title="Admission history" testID="submission-history">
      <Text style={styles.description}>
        Timeline of applications and enrollment activity for this family.
      </Text>
      {events.map((event, index) => {
        const viewing = isViewingEvent(event, events, currentApplicationId, currentApplicationStatus);
        const last = index === events.length - 1;
        const body = (
          <>
            <View style={styles.historyRail}>
              <AdminIconChip name={TIMELINE_ICONS[event.kind]} tint={TIMELINE_TINTS[event.kind]} size={32} />
              {!last ? <View style={styles.historyConnector} /> : null}
            </View>
            <View
              style={[
                styles.historyCard,
                viewing ? { backgroundColor: accent.wash, borderColor: accent.clay } : null,
              ]}>
              <View style={styles.historyTop}>
                <Text style={styles.historyDate}>{formatShortDate(event.occurredAt)}</Text>
                {viewing ? <GChip label="Viewing" tone="info" /> : null}
              </View>
              <Text style={styles.historyTitle}>{event.title}</Text>
              {event.statusLabel ? (
                <GChip label={event.statusLabel} tone={eventChipTone(event)} style={styles.historyChip} />
              ) : null}
              {event.subtitle ? <Text style={styles.historyMeta}>{event.subtitle}</Text> : null}
              {event.kind === 'enrollment' && event.enrollmentProgress ? (
                <View style={styles.historyProgress}>
                  <Text style={styles.historyMeta}>
                    Required items · {event.enrollmentProgress.completed}/{event.enrollmentProgress.total}
                  </Text>
                  <GProgress
                    value={
                      event.enrollmentProgress.total > 0
                        ? event.enrollmentProgress.completed / event.enrollmentProgress.total
                        : 0
                    }
                    label={`Required items: ${event.enrollmentProgress.completed} of ${event.enrollmentProgress.total}`}
                  />
                </View>
              ) : event.progressLabel ? (
                <Text style={styles.historyMeta}>{event.progressLabel}</Text>
              ) : null}
              {!viewing ? (
                <Text style={[styles.historyOpen, { color: accent.clayDeep }]}>Open application →</Text>
              ) : null}
            </View>
          </>
        );
        if (viewing) {
          return (
            <View key={event.id} style={styles.historyRow} accessible accessibilityLabel={`${event.title}, viewing`}>
              {body}
            </View>
          );
        }
        return (
          <GPressable
            key={event.id}
            accessibilityLabel={`${event.title}, ${formatShortDate(event.occurredAt)}. Open application`}
            pressedScale={0.985}
            onPress={() => onOpenApplication(event.applicationId)}
            style={styles.historyRow}>
            {body}
          </GPressable>
        );
      })}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

function paymentTone(status: PaymentRecordDisplayRow['status']) {
  switch (status) {
    case 'succeeded':
      return 'success' as const;
    case 'pending':
      return 'warning' as const;
    case 'failed':
      return 'alert' as const;
    default:
      return 'neutral' as const;
  }
}

export function PaymentsCard({
  payments,
  loading,
  onOpenPayment,
}: {
  payments: PaymentRecordDisplayRow[];
  loading: boolean;
  onOpenPayment: (paymentId: string) => void;
}) {
  return (
    <GCard title="Payments" testID="submission-payments">
      <Text style={styles.description}>Application fees and enrollment charges for this application.</Text>
      {loading ? (
        <View style={styles.skSteps} accessibilityLabel="Loading payments">
          {[0, 1, 2].map((i) => (
            <GSkeleton key={i} style={styles.skPayment} />
          ))}
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.paymentsEmpty}>
          <Ionicons name="card-outline" size={20} color={Garden.soft} />
          <Text style={styles.body}>No payments recorded yet.</Text>
        </View>
      ) : (
        payments.map((payment, i) => {
          const label = payment.label ?? PAYMENT_TYPE_LABELS[payment.paymentType];
          const amount = formatPaymentAmount(payment.amountCents);
          const when = formatPaymentDateTime(payment.paidAt ?? payment.createdAt);
          return (
            <GPressable
              key={payment.id}
              accessibilityLabel={`${label}, ${amount}, ${PAYMENT_STATUS_LABELS[payment.status]}, ${when}. Open details`}
              pressedScale={0.985}
              onPress={() => onOpenPayment(payment.id)}
              style={[styles.paymentRow, i > 0 && styles.divider]}>
              <AdminIconChip name="card-outline" tint={Garden.mint} />
              <View style={styles.paymentCopy}>
                <View style={styles.paymentTop}>
                  <Text style={styles.paymentLabel} numberOfLines={1}>
                    {label}
                  </Text>
                  <Text style={styles.paymentAmount}>{amount}</Text>
                </View>
                <View style={styles.paymentMetaRow}>
                  <GChip label={PAYMENT_STATUS_LABELS[payment.status]} tone={paymentTone(payment.status)} />
                  <Text style={styles.paymentMeta} numberOfLines={1}>
                    {when}
                  </Text>
                </View>
                {payment.payerEmail ? (
                  <Text style={styles.paymentMeta} numberOfLines={1}>
                    {payment.payerEmail}
                  </Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={16} color={Garden.ink60} />
            </GPressable>
          );
        })
      )}
    </GCard>
  );
}

export { paymentTone };

const styles = StyleSheet.create({
  description: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13.5,
    lineHeight: 19,
    color: Garden.soft,
    marginBottom: 10,
  },
  body: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: Garden.soft },
  flash: { backgroundColor: Garden.mint },
  dim: { opacity: 0.5 },
  decisionActions: { gap: 12 },
  decisionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  decisionButton: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  decisionLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 15 },
  cardButton: { marginTop: 4 },
  cardLink: { marginTop: 8, alignSelf: 'flex-start' },
  progressHeader: { gap: 8, marginBottom: 14 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  progressCount: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.ink,
    fontVariant: ['tabular-nums'],
  },
  steps: { marginTop: 2 },
  skSteps: { gap: 12 },
  skBar: { height: 12, borderRadius: 6 },
  skStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skMarker: { width: 28, height: 28, borderRadius: 14 },
  skLine: { flex: 1, height: 16, borderRadius: 8 },
  skEvent: { flex: 1, height: 72, borderRadius: 14 },
  skPayment: { height: 64, borderRadius: 14 },
  historyRow: { flexDirection: 'row', gap: 12 },
  historyRail: { alignItems: 'center', width: 32 },
  historyConnector: { flex: 1, width: 2, backgroundColor: Garden.ink10, marginVertical: 4 },
  historyCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.paper,
    padding: 12,
    gap: 4,
    marginBottom: 12,
  },
  historyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  historyDate: { fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft },
  historyTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, lineHeight: 20, color: Garden.ink },
  historyChip: { alignSelf: 'flex-start' },
  historyMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  historyProgress: { gap: 6, marginTop: 4 },
  historyOpen: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, marginTop: 4 },
  paymentsEmpty: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, minHeight: 56 },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  paymentCopy: { flex: 1, minWidth: 0, gap: 4 },
  paymentTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paymentLabel: { flex: 1, fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  paymentAmount: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    color: Garden.ink,
    fontVariant: ['tabular-nums'],
  },
  paymentMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paymentMeta: { flexShrink: 1, fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft },
});
