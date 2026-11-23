import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { GSegmented } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GChip, GErrorCard, GSkeleton } from '@/components/parent/garden/ui';
import {
  ApplicationDetailsCard,
  ApplicationStepsCard,
  DecisionCard,
  EnrollmentCard,
  EnrollmentStepsCard,
  HistoryCard,
  JourneyCard,
  PaymentsCard,
  PostSubmitCard,
} from '@/components/school-admin/admissions/garden/submission-detail-sections';
import {
  GardenApplicationStepSheet,
  GardenChecklistItemSheet,
  GardenPaymentSheet,
} from '@/components/school-admin/admissions/garden/submission-detail-sheets';
import { submissionContactLine } from '@/components/school-admin/admissions/garden/submission-row';
import {
  useSubmissionDetailController,
  type SubmissionDetailController,
  type SubmissionDetailTab,
} from '@/components/school-admin/admissions/garden/use-submission-detail-controller';
import { useSubmissionDetailFeedback } from '@/components/school-admin/admissions/garden/use-submission-detail-feedback';
import { useUpdatedLabel } from '@/components/school-admin/dashboard/garden/sections/admin-header';
import { GuardiansCard } from '@/components/school-admin/garden/guardians-card';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import {
  adminCombinedStatusProgressLabel,
  applicationStatusChipTone,
} from '@/lib/admissions/application-status-ui';
import { haptic } from '@/lib/haptics';
import { useStatusBarBleed } from '@/hooks/use-status-bar-bleed';

const TAB_ICONS: Record<SubmissionDetailTab, 'reader-outline' | 'list-outline' | 'time-outline' | 'card-outline'> = {
  overview: 'reader-outline',
  application: 'list-outline',
  history: 'time-outline',
  payments: 'card-outline',
};

type SubmissionDetailScreenProps = { organizationId: string; applicationId: string; slug: string };

/**
 * School admin › Admissions › one application (Garden): skeleton → error → detail.
 * Data, lazy tab loads and saves live in `useSubmissionDetailController`; the
 * feedback hook adds toasts, spinners, confirms and read-only gating.
 */
export function SubmissionDetailScreen(props: SubmissionDetailScreenProps) {
  const controller = useSubmissionDetailController(props);
  const failed = controller.status === 'error';

  useEffect(() => {
    if (failed) haptic.error();
  }, [failed]);

  if (controller.status === 'loading') return <SubmissionDetailSkeleton />;
  if (controller.status === 'error') return <SubmissionDetailError controller={controller} />;
  return <SubmissionDetailContent controller={controller} />;
}

function useDetailBleed() {
  return useStatusBarBleed();
}

function SubmissionDetailContent({ controller }: { controller: SubmissionDetailController }) {
  const feedback = useSubmissionDetailFeedback(controller);
  const bleed = useDetailBleed();
  const updated = useUpdatedLabel(controller.lastUpdatedAt);
  const submission = controller.submission!;
  const detail = controller.detail!;
  const status = controller.currentStatus;
  const studentName = submission.studentLabel?.trim() || '—';
  const statusLabel = adminCombinedStatusProgressLabel(
    status,
    submission.applicationProgressSummary,
    submission.enrollmentSummary,
  );

  const applicationSteps = (index: number) => (
    <ApplicationStepsCard
      index={index}
      detail={detail}
      steps={controller.applicationStepsWithStatus}
      feeStatus={submission.feeStatus}
      applicationStatus={status}
      submittedAt={submission.submittedAt}
      feeEnabled={submission.feeEnabled}
      onOpenStep={controller.setSelectedApplicationStepId}
    />
  );

  return (
    <View style={[styles.root, bleed]} testID="school-admin-submission-ready">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <GBackHeader
          backLabel="Submissions"
          backAccessibilityLabel="Back to submissions"
          onBack={controller.goBack}
          title={studentName}
          subtitle={submissionContactLine(submission)}
          aside={<StudentPhoto name={submission.studentLabel ?? ''} size="lg" />}>
          <View style={styles.heroChips}>
            <GChip label={statusLabel} tone={applicationStatusChipTone(status)} />
            {submission.programName ? <GChip label={submission.programName} tone="neutral" /> : null}
            {updated ? <Text style={styles.updated}>{updated}</Text> : null}
          </View>
        </GBackHeader>
        {controller.tabs.length > 1 ? (
          <GSegmented<SubmissionDetailTab>
            accessibilityLabel="Application sections"
            scrollable={controller.tabs.length > 3}
            compact
            items={controller.tabs.map((tab) => ({
              id: tab.id,
              label: tab.label,
              icon: TAB_ICONS[tab.id],
              testID: `submission-tab-${tab.id}`,
            }))}
            activeId={controller.activeTab}
            onChange={controller.setActiveTab}
          />
        ) : null}
      </View>

      <Animated.View key={controller.activeTab} entering={FadeIn.duration(220)} style={styles.panel}>
        <ScrollView
          style={styles.panel}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={feedback.pullRefreshing}
              onRefresh={() => void feedback.onPullRefresh()}
              tintColor={Garden.soft}
            />
          }>
          {controller.activeTab === 'overview' ? (
            <>
              <EnrollmentCard
                index={0}
                status={status}
                hasPublishedChecklist={controller.hasPublishedEnrollmentChecklist || controller.hasChecklist}
                programName={submission.programName}
                enrollmentChecklistName={controller.enrollmentChecklistName}
                pending={feedback.enrollPending}
                onMarkEnrolled={() => void feedback.markEnrolled()}
                onStartOnWeb={feedback.openEnrollmentOnWeb}
              />
              {status !== 'accepted' ? (
                <DecisionCard
                  index={1}
                  status={status}
                  pendingDecision={feedback.pendingDecision}
                  flash={feedback.statusFlash}
                  onDecide={(decision) => void feedback.decide(decision)}
                />
              ) : null}
              <JourneyCard index={2} submission={submission} status={status} />
              {controller.showEnrollmentStatus ? (
                <EnrollmentStepsCard
                  index={3}
                  checklist={controller.enrollmentChecklist}
                  loading={controller.enrollmentLoading}
                  error={controller.enrollmentError}
                  onRetry={() => void controller.retryEnrollment()}
                  onOpenItem={controller.setSelectedEnrollmentItemId}
                />
              ) : (
                applicationSteps(3)
              )}
              <PostSubmitCard index={4} steps={detail.postSubmitSteps} />
              <ApplicationDetailsCard index={5} submission={{ ...submission, status }} />
              <GuardiansCard index={6} guardians={controller.guardians} loading={controller.guardiansLoading} />
            </>
          ) : null}

          {controller.activeTab === 'application' ? applicationSteps(0) : null}

          {controller.activeTab === 'history' ? (
            <HistoryCard
              events={controller.historyEvents}
              currentApplicationId={controller.applicationId}
              currentApplicationStatus={status}
              loading={controller.historyLoading}
              unlinked={controller.historyUnlinked}
              onOpenApplication={controller.openApplication}
            />
          ) : null}

          {controller.activeTab === 'payments' ? (
            <PaymentsCard
              payments={controller.payments}
              loading={controller.paymentsLoading}
              onOpenPayment={controller.setSelectedPaymentId}
            />
          ) : null}
        </ScrollView>
      </Animated.View>

      <GardenApplicationStepSheet
        visible={controller.selectedApplicationStepId != null}
        step={controller.selectedApplicationStep}
        detail={detail}
        feeStatus={submission.feeStatus}
        onClose={() => controller.setSelectedApplicationStepId(null)}
      />
      <GardenChecklistItemSheet
        visible={controller.selectedEnrollmentItemId != null}
        item={controller.selectedEnrollmentItem}
        instance={controller.selectedEnrollmentInstance}
        onClose={() => controller.setSelectedEnrollmentItemId(null)}
      />
      <GardenPaymentSheet
        visible={controller.selectedPaymentId != null}
        payment={controller.selectedPayment}
        onClose={() => controller.setSelectedPaymentId(null)}
      />
    </View>
  );
}

function SubmissionDetailError({ controller }: { controller: SubmissionDetailController }) {
  const bleed = useDetailBleed();
  const notFound = controller.error === 'Submission not found.';
  return (
    <ScrollView style={[styles.root, bleed]} contentContainerStyle={styles.errorWrap}>
      <StatusBar style="dark" />
      <GBackHeader
        backLabel="Submissions"
        backAccessibilityLabel="Back to submissions"
        onBack={controller.goBack}
        title={controller.submission?.studentLabel?.trim() || 'Application'}
      />
      <GErrorCard
        title={notFound ? "We couldn't find this application" : "We couldn't load this application"}
        message={controller.error ?? 'Submission not found.'}
        onRetry={() => void controller.reload()}
      />
    </ScrollView>
  );
}

export function SubmissionDetailSkeleton() {
  const bleed = useDetailBleed();
  return (
    <ScrollView
      style={[styles.root, bleed]}
      scrollEnabled={false}
      accessibilityLabel="Loading application"
      contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skBack} />
      <View style={styles.skHero}>
        <View style={styles.skHeroCopy}>
          <GSkeleton style={styles.skTitle} />
          <GSkeleton style={styles.skSub} />
          <View style={styles.skChips}>
            <GSkeleton style={styles.skChip} />
            <GSkeleton style={styles.skChip} />
          </View>
        </View>
        <GSkeleton style={styles.skPhoto} />
      </View>
      <GSkeleton style={styles.skTabs} />
      <GSkeleton style={styles.skCard} />
      <GSkeleton style={styles.skCardShort} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  top: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8, gap: 12 },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  updated: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft, marginLeft: 2 },
  panel: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 14 },
  errorWrap: { paddingHorizontal: 16, paddingTop: 4, gap: 16 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skBack: { width: 110, height: 20, borderRadius: 10 },
  skHero: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  skHeroCopy: { flex: 1, gap: 8 },
  skTitle: { width: '70%', height: 30, borderRadius: 10 },
  skSub: { width: '85%', height: 14, borderRadius: 7 },
  skChips: { flexDirection: 'row', gap: 6 },
  skChip: { width: 80, height: 24, borderRadius: 12 },
  skPhoto: { width: 56, height: 56, borderRadius: 28 },
  skTabs: { height: 40, borderRadius: 20, marginTop: 4 },
  skCard: { height: 260, borderRadius: 22 },
  skCardShort: { height: 150, borderRadius: 22 },
});
