import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { confirmDestructive, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GChoiceChips, GInlineBanner, GTextField } from '@/components/parent/garden/fields';
import { GStepList } from '@/components/parent/garden/steps';
import { useGardenToast } from '@/components/parent/garden/toast';
import { Garden } from '@/components/parent/garden/tokens';
import { GCard, GChip, GOutlineButton, GSkeleton, GToyButton, gText } from '@/components/parent/garden/ui';
import { ParentKeyboardAwareScrollView } from '@/components/parent/parent-keyboard-aware-scroll-view';
import { useParentCommittees } from '@/contexts/parent-committees-context';
import { useParentHome } from '@/contexts/parent-home-context';
import {
  getCommitteesWorkspaceRoute,
  type CommitteesContextValue,
  type CommitteesPortal,
} from '@/lib/committees/committees-portal-config';
import { REQUEST_STATUS_CHIP, buildJoinSteps, canRequestToJoin } from '@/lib/parent/parent-committees-garden';
import { submitCommitteeJoinRequest, withdrawCommitteeJoinRequest } from '@/lib/parent/parent-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

// keyboard: ParentKeyboardAwareScrollView (grade + note fields)

type CommitteeExploreDetailScreenProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  committeeId: string;
  portal: CommitteesPortal;
  showGradeField: boolean;
  requesterName: string;
  useCommittees: () => CommitteesContextValue;
  onSubmitJoinRequest: (input: {
    organizationId: string;
    committeeId: string;
    schoolSlug: string;
    schoolName: string;
    committeeName: string;
    preferredDutyRoleId?: string | null;
    grade?: string | null;
    note?: string | null;
  }) => Promise<void>;
  onWithdrawJoinRequest: (input: {
    requestId: string;
    organizationId: string;
    committeeName: string;
    requesterName: string;
  }) => Promise<void>;
};

const NO_PREFERENCE = '__none__';

function CommitteeExploreDetailScreen({
  slug,
  organizationId,
  schoolName,
  committeeId,
  portal,
  showGradeField,
  requesterName,
  useCommittees,
  onSubmitJoinRequest,
  onWithdrawJoinRequest,
}: CommitteeExploreDetailScreenProps) {
  const router = useRouter();
  const toast = useGardenToast();
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const { getBrowseCommittee, ensureLoaded, refresh } = useCommittees();
  const { reportError } = useMobileErrorReporter(organizationId);
  const committee = getBrowseCommittee(committeeId);

  const [preferredDutyRoleId, setPreferredDutyRoleId] = useState(NO_PREFERENCE);
  const [grade, setGrade] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const handleSubmit = useCallback(async () => {
    if (!committee) return;
    if (readOnly) return notifyReadOnly();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmitJoinRequest({
        organizationId,
        committeeId: committee.id,
        schoolSlug: slug,
        schoolName,
        committeeName: committee.name,
        preferredDutyRoleId: preferredDutyRoleId === NO_PREFERENCE ? null : preferredDutyRoleId,
        grade: showGradeField ? grade.trim() || null : null,
        note: note.trim() || null,
      });
      toast.success('Join request submitted.', {
        description: `${committee.name} will show "Request pending" until the school reviews it.`,
      });
      await refresh();
    } catch (err) {
      reportError('committees.join_request_submit', err, { responseStatus: undefined });
      setError(err instanceof Error ? err.message : 'Failed to submit request.');
      toast.error("Couldn't send your request", {
        description: 'Your answers are still here. Try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    committee,
    grade,
    note,
    notifyReadOnly,
    onSubmitJoinRequest,
    organizationId,
    preferredDutyRoleId,
    readOnly,
    refresh,
    reportError,
    schoolName,
    showGradeField,
    slug,
    toast,
  ]);

  const handleWithdraw = useCallback(async () => {
    if (!committee?.requestId) return;
    if (readOnly) return notifyReadOnly();
    const confirmed = await confirmDestructive({
      title: 'Withdraw request?',
      message: `Your request to join ${committee.name} will be cancelled.`,
      confirmLabel: 'Withdraw',
      cancelLabel: 'Keep request',
    });
    if (!confirmed) return;
    setWithdrawing(true);
    setError(null);
    try {
      await onWithdrawJoinRequest({
        requestId: committee.requestId,
        organizationId,
        committeeName: committee.name,
        requesterName,
      });
      toast.success('Request withdrawn.', { description: `You're no longer waiting on ${committee.name}.` });
      await refresh();
    } catch (err) {
      reportError('committees.join_request_withdraw', err);
      setError(err instanceof Error ? err.message : 'Failed to withdraw request.');
      toast.error("Couldn't withdraw the request", { description: 'Check your connection, then try again.' });
    } finally {
      setWithdrawing(false);
    }
  }, [committee, notifyReadOnly, onWithdrawJoinRequest, organizationId, readOnly, refresh, reportError, requesterName, toast]);

  const back = (
    <GBackHeader
      backLabel="Explore"
      backAccessibilityLabel="Back to explore"
      onBack={() => router.back()}
      title={committee?.name ?? 'Committee'}
    />
  );

  if (!committee) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={styles.content} accessibilityLabel="Loading committee" accessibilityState={{ busy: true }}>
          {back}
          <GSkeleton style={{ height: 120, borderRadius: 22 }} />
          <GSkeleton style={{ height: 220, borderRadius: 22 }} />
        </View>
      </View>
    );
  }

  const request = committee.requestStatus && !committee.isMember ? REQUEST_STATUS_CHIP[committee.requestStatus] : null;
  const showForm = canRequestToJoin(committee);
  const showWithdraw = committee.requestStatus === 'pending' && Boolean(committee.requestId);

  return (
    <View style={styles.root} testID="parent-committee-explore-screen">
      <StatusBar style="dark" />
      <ParentKeyboardAwareScrollView style={styles.root} contentContainerStyle={styles.content}>
        <GBackHeader
          backLabel="Explore"
          backAccessibilityLabel="Back to explore"
          onBack={() => router.back()}
          title={committee.name}>
          <View style={styles.chips}>
            <GChip label={committee.termLabel} tone="info" />
            {committee.isMember ? <GChip label="Member" tone="success" icon="checkmark" /> : null}
            {request ? <GChip label={request.label} tone={request.tone} /> : null}
          </View>
        </GBackHeader>

        {committee.description ? <Text style={gText.body}>{committee.description}</Text> : null}

        {committee.isMember ? (
          <GCard title="Your workspace is ready" index={1}>
            <GToyButton
              label="Open workspace"
              size="md"
              onPress={() => router.push(getCommitteesWorkspaceRoute(slug, portal, committee.id))}
            />
          </GCard>
        ) : (
          <GCard title="How joining works" index={1}>
            <GStepList steps={buildJoinSteps(committee)} accessibilityLabel="How joining works" />
          </GCard>
        )}

        {committee.dutyRoles.length > 0 && !showForm ? (
          <GCard title={`${committee.dutyRoles.length} ways to help`} tone="paper" index={2}>
            <View style={styles.roles}>
              {committee.dutyRoles.map((role) => (
                <View key={role.id} style={styles.role}>
                  <Text style={gText.itemTitle}>{role.title}</Text>
                  {role.description ? <Text style={gText.meta}>{role.description}</Text> : null}
                </View>
              ))}
            </View>
          </GCard>
        ) : null}

        {showForm ? (
          <GCard title="Tell the school you'd like to help" index={2}>
            <View style={styles.form}>
              <Text style={gText.meta}>
                Your request will be reviewed by the school. You will get read-only access to the
                committee workspace after approval.
              </Text>
              {committee.dutyRoles.length > 0 ? (
                <GChoiceChips
                  label="Preferred role (optional)"
                  layout="stack"
                  value={preferredDutyRoleId}
                  onChange={setPreferredDutyRoleId}
                  disabled={readOnly}
                  onBlocked={notifyReadOnly}
                  options={[
                    { id: NO_PREFERENCE, label: 'No preference' },
                    ...committee.dutyRoles.map((role) => ({
                      id: role.id,
                      label: role.title,
                      description: role.description,
                    })),
                  ]}
                />
              ) : null}
              {showGradeField ? (
                <GTextField
                  label="Child's grade"
                  optional
                  value={grade}
                  onChangeText={setGrade}
                  placeholder="e.g. 3rd grade"
                  disabled={readOnly}
                />
              ) : null}
              <GTextField
                label="Note"
                optional
                value={note}
                onChangeText={setNote}
                placeholder="Share relevant experience or availability…"
                multiline
                disabled={readOnly}
              />
              {error ? <GInlineBanner tone="error" title="That didn't go through" description={error} /> : null}
              <GToyButton
                label={submitting ? 'Submitting…' : 'Submit request'}
                icon="send"
                size="md"
                fullWidth
                loading={submitting}
                onPress={() => void handleSubmit()}
              />
            </View>
          </GCard>
        ) : null}

        {showWithdraw ? (
          <GCard title="Request pending" index={3}>
            <View style={styles.form}>
              <Text style={gText.body}>Your request is waiting for school review.</Text>
              {error ? <GInlineBanner tone="error" title="That didn't go through" description={error} /> : null}
              <GOutlineButton
                label={withdrawing ? 'Withdrawing…' : 'Withdraw request'}
                icon={withdrawing ? undefined : 'close'}
                onPress={() => {
                  if (!withdrawing) void handleWithdraw();
                }}
              />
            </View>
          </GCard>
        ) : null}

        {committee.requestStatus === 'approved' && !committee.isMember ? (
          <GInlineBanner
            tone="success"
            title="Your request was approved"
            description="Open this committee from My committees to view the workspace."
          />
        ) : null}

      </ParentKeyboardAwareScrollView>
    </View>
  );
}

export function ParentCommitteeExploreDetailScreen({
  slug,
  organizationId,
  schoolName,
  committeeId,
}: {
  slug: string;
  organizationId: string;
  schoolName: string;
  committeeId: string;
}) {
  const { data: homeData } = useParentHome();
  const requesterName = homeData?.userProfile.displayName ?? 'Parent';
  return (
    <CommitteeExploreDetailScreen
      slug={slug}
      organizationId={organizationId}
      schoolName={schoolName}
      committeeId={committeeId}
      portal="parent"
      showGradeField
      requesterName={requesterName}
      useCommittees={useParentCommittees}
      onSubmitJoinRequest={submitCommitteeJoinRequest}
      onWithdrawJoinRequest={({ requestId, organizationId: orgId, committeeName, requesterName: name }) =>
        withdrawCommitteeJoinRequest(requestId, orgId, committeeName, name)
      }
    />
  );
}

export { CommitteeExploreDetailScreen };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 56, gap: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roles: { gap: 12 },
  role: { gap: 3 },
  form: { gap: 14 },
});
