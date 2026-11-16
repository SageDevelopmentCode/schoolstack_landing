import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { ParentClassroomSignupsGardenSkeleton } from '@/components/parent/classroom-signups/garden/parent-classroom-signups-garden-skeleton';
import { SignupResponseCard } from '@/components/parent/classroom-signups/garden/signup-response-card';
import {
  selectionSummary,
  signupDeadlineLabel,
  signupFromLine,
} from '@/components/parent/classroom-signups/garden/signups-garden-ui';
import type { ParentClassroomSignupDetailController } from '@/components/parent/classroom-signups/garden/use-parent-classroom-signup-detail-controller';
import { useSignupResponseForm } from '@/components/parent/classroom-signups/garden/use-signup-response-form';
import { GBackHeader } from '@/components/parent/garden/back-header';
import { GCelebrate } from '@/components/parent/garden/celebrate';
import { Garden } from '@/components/parent/garden/tokens';
import { GCard, GChip, GErrorCard, GHand, GLink, GTick, gText } from '@/components/parent/garden/ui';
import { ParentKeyboardAwareScrollView } from '@/components/parent/parent-keyboard-aware-scroll-view';
import type { ClassroomSignup } from '@/lib/parent/parent-classroom-signups-types';
import { SIGNUP_TYPE_LABELS } from '@/lib/parent/parent-classroom-signups-types';

function Header({
  controller,
  signup,
  status,
}: {
  controller: ParentClassroomSignupDetailController;
  signup: ClassroomSignup;
  status: { label: string; tone: 'success' | 'info' | 'neutral' };
}) {
  return (
    <GBackHeader
      backLabel="Classroom signups"
      backAccessibilityLabel="Back"
      onBack={controller.onBack}
      title={signup.title}
      subtitle={signupFromLine(signup)}>
      <GChip label={status.label} tone={status.tone} style={styles.statusChip} />
    </GBackHeader>
  );
}

/** Ready view: needs a loaded signup so the form can seed its state once. */
function SignupDetailReady({
  controller,
  signup,
}: {
  controller: ParentClassroomSignupDetailController;
  signup: ClassroomSignup;
}) {
  const { familyResponse, responses, studentOptions } = controller;
  const hasConfirmedResponse = familyResponse?.status === 'confirmed';
  const closed = signup.status === 'closed';
  const canShowContent = signup.status === 'open' || (closed && hasConfirmedResponse);

  const form = useSignupResponseForm({
    organizationId: controller.organizationId,
    signup,
    existingResponse: familyResponse,
    allResponses: responses,
    studentOptions,
    closed,
    onSubmitted: controller.onSubmitted,
    onWithdrawn: controller.onWithdrawn,
  });

  const status = closed
    ? { label: 'Closed', tone: 'neutral' as const }
    : hasConfirmedResponse
      ? { label: "You're signed up", tone: 'success' as const }
      : { label: 'Open', tone: 'info' as const };

  const deadline = signupDeadlineLabel(signup);
  const savedSummary =
    familyResponse && hasConfirmedResponse
      ? selectionSummary(
          signup,
          familyResponse.selectedSlotIds,
          familyResponse.selectedRoleIds,
          familyResponse.note ?? '',
        )
      : '';

  return (
    <View style={styles.root} testID="parent-classroom-signup-detail-screen">
      <StatusBar style="dark" />
      <ParentKeyboardAwareScrollView style={styles.flex} contentContainerStyle={styles.content}>
        <Header controller={controller} signup={signup} status={status} />

        {!canShowContent ? (
          <GCard index={1} title="This signup has closed">
            <Text style={gText.body}>This signup is no longer accepting responses.</Text>
            <View style={styles.hand}>
              <GHand>Thanks for checking in.</GHand>
            </View>
            <GLink label="Back to classroom signups" onPress={controller.onBack} style={styles.link} />
          </GCard>
        ) : (
          <>
            <GCard index={1} title="About this request" testID="parent-signup-about">
              <View style={styles.chips}>
                <GChip label={SIGNUP_TYPE_LABELS[signup.signupType]} tone="neutral" />
                {deadline && !closed ? (
                  <GChip label={deadline} tone="warning" icon="time-outline" />
                ) : null}
              </View>
              {signup.description ? (
                <Text style={[gText.body, styles.description]}>{signup.description}</Text>
              ) : null}
            </GCard>

            {hasConfirmedResponse && familyResponse ? (
              <View
                style={styles.saved}
                accessible
                accessibilityLabel={`You're signed up${
                  familyResponse.studentName ? ` for ${familyResponse.studentName}` : ''
                }. ${savedSummary}`}
                testID="parent-signup-saved-summary">
                <GTick size={30} />
                <View style={styles.flex}>
                  <Text style={styles.savedTitle}>
                    {closed ? 'You signed up' : "You're signed up"}
                    {familyResponse.studentName ? ` for ${familyResponse.studentName}` : ''}
                  </Text>
                  {savedSummary ? <Text style={styles.savedBody}>{savedSummary}</Text> : null}
                  {!closed ? (
                    <Text style={styles.savedMeta}>
                      You can change or withdraw while it&apos;s open.
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            <SignupResponseCard
              signup={signup}
              form={form}
              allResponses={responses}
              studentOptions={studentOptions}
            />
          </>
        )}
      </ParentKeyboardAwareScrollView>

      <GCelebrate active={form.justSignedUp} celebrationKey={`classroom-signup-${signup.id}`} />
    </View>
  );
}

/** One classroom signup in Garden: about → saved summary → response steps. */
export function ParentClassroomSignupDetailGardenScreen({
  controller,
}: {
  controller: ParentClassroomSignupDetailController;
}) {
  if (controller.isLoading) {
    return (
      <>
        <StatusBar style="dark" />
        <ParentClassroomSignupsGardenSkeleton onBack={controller.onBack} variant="detail" />
      </>
    );
  }

  if (controller.error || !controller.signup) {
    return (
      <View style={[styles.root, styles.content]} testID="parent-classroom-signup-detail-screen">
        <StatusBar style="dark" />
        <GBackHeader
          backLabel="Classroom signups"
          backAccessibilityLabel="Back"
          onBack={controller.onBack}
          title="Classroom signup"
        />
        <GErrorCard
          title="We couldn't load this signup"
          message={`${controller.error ?? 'This signup may have been removed.'} Check your connection, then try again.`}
          onRetry={controller.retry}
        />
      </View>
    );
  }

  return <SignupDetailReady controller={controller} signup={controller.signup} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  flex: { flex: 1, minWidth: 0 },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 48, gap: 16 },
  statusChip: { alignSelf: 'flex-start' },
  hand: { marginTop: 10 },
  link: { alignSelf: 'flex-start', marginTop: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  description: { marginTop: 12 },
  saved: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Garden.mint,
    borderRadius: 18,
    padding: 16,
  },
  savedTitle: { ...gText.itemTitle, color: Garden.forestDeep },
  savedBody: { ...gText.body, color: Garden.forestDeep, marginTop: 2 },
  savedMeta: { ...gText.meta, color: Garden.forest, marginTop: 4 },
});
