import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ParentCommitteeRequestStatusChip } from '@/components/parent/committees/parent-committee-request-status-chip';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryTextField } from '@/components/story/story-text-field';
import { useParentCommittees } from '@/contexts/parent-committees-context';
import { useParentHome } from '@/contexts/parent-home-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  submitCommitteeJoinRequest,
  withdrawCommitteeJoinRequest,
} from '@/lib/parent/parent-portal-api';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ParentCommitteeExploreDetailScreenProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  committeeId: string;
};

export function ParentCommitteeExploreDetailScreen({
  slug,
  organizationId,
  schoolName,
  committeeId,
}: ParentCommitteeExploreDetailScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { data: homeData } = useParentHome();
  const { getBrowseCommittee, ensureLoaded, refresh } = useParentCommittees();
  const { reportError } = useMobileErrorReporter(organizationId);

  const committee = getBrowseCommittee(committeeId);

  const [preferredDutyRoleId, setPreferredDutyRoleId] = useState('');
  const [grade, setGrade] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const guardianName = homeData?.userProfile.displayName ?? 'Parent';

  const showRequestForm = useMemo(
    () =>
      committee &&
      !committee.isMember &&
      (!committee.requestStatus || committee.requestStatus === 'declined'),
    [committee],
  );

  const showWithdrawSection = useMemo(
    () => committee?.requestStatus === 'pending' && committee.requestId,
    [committee],
  );

  const handleSubmit = useCallback(async () => {
    if (!committee) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      await submitCommitteeJoinRequest({
        organizationId,
        committeeId: committee.id,
        schoolSlug: slug,
        schoolName,
        committeeName: committee.name,
        preferredDutyRoleId: preferredDutyRoleId || null,
        grade: grade.trim() || null,
        note: note.trim() || null,
      });
      setFeedback({ type: 'success', message: 'Join request submitted.' });
      await refresh();
    } catch (err) {
      reportError('committees.join_request_submit', err, { responseStatus: undefined });
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to submit request.',
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    committee,
    grade,
    note,
    organizationId,
    preferredDutyRoleId,
    refresh,
    reportError,
    schoolName,
    slug,
  ]);

  const handleWithdraw = useCallback(async () => {
    if (!committee?.requestId) return;
    setWithdrawing(true);
    setFeedback(null);
    try {
      await withdrawCommitteeJoinRequest(
        committee.requestId,
        organizationId,
        committee.name,
        guardianName,
      );
      setFeedback({ type: 'success', message: 'Request withdrawn.' });
      await refresh();
    } catch (err) {
      reportError('committees.join_request_withdraw', err);
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to withdraw request.',
      });
    } finally {
      setWithdrawing(false);
    }
  }, [committee, guardianName, organizationId, refresh, reportError]);

  if (!committee) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Story.paper }]}>
        <ActivityIndicator color={theme.primary} />
        <Text style={[styles.loadingCopy, { color: theme.muted }]}>Loading committee…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Story.paper }]}
      contentContainerStyle={styles.content}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
        <Ionicons name="chevron-back" size={18} color={theme.muted} />
        <Text style={[styles.backLabel, { color: theme.muted }]}>Back to explore</Text>
      </Pressable>

      <View style={styles.titleBlock}>
        <View style={styles.chipRow}>
          <StoryDisplayHeading size="section">{committee.name}</StoryDisplayHeading>
          <StoryChip tone="info" label={committee.termLabel} />
          {committee.isMember ? <StoryChip tone="success" label="Member" /> : null}
          {committee.requestStatus && !committee.isMember ? (
            <ParentCommitteeRequestStatusChip status={committee.requestStatus} />
          ) : null}
        </View>
        <Text style={[styles.description, { color: theme.muted }]}>{committee.description}</Text>
      </View>

      {feedback ? (
        <View
          style={[
            styles.feedbackBanner,
            {
              backgroundColor: feedback.type === 'success' ? theme.successBg : theme.alertBg,
            },
          ]}>
          <Text
            style={{
              color: feedback.type === 'success' ? theme.success : theme.alert,
              fontFamily: StoryFonts.body,
              fontSize: 14,
            }}>
            {feedback.message}
          </Text>
        </View>
      ) : null}

      {committee.dutyRoles.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.ink }]}>Duty roles</Text>
          <View style={styles.dutyRoleList}>
            {committee.dutyRoles.map((role) => (
              <StoryCard key={role.id} compact style={styles.dutyRoleCard}>
                <Text style={[styles.dutyRoleTitle, { color: theme.ink }]}>{role.title}</Text>
                <Text style={[styles.dutyRoleDescription, { color: theme.muted }]}>
                  {role.description}
                </Text>
              </StoryCard>
            ))}
          </View>
        </View>
      ) : null}

      {showRequestForm ? (
        <StoryCard compact style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={[styles.sectionTitle, { color: theme.ink }]}>Request to join</Text>
            <Text style={[styles.formHint, { color: theme.muted }]}>
              Your request will be reviewed by the school. You will get read-only access to the
              committee workspace after approval.
            </Text>
          </View>

          {committee.dutyRoles.length > 0 ? (
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.muted }]}>
                Preferred role (optional)
              </Text>
              <View style={styles.rolePicker}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPreferredDutyRoleId('')}
                  style={[
                    styles.roleOption,
                    {
                      borderColor: preferredDutyRoleId === '' ? theme.primary : theme.line,
                      backgroundColor: preferredDutyRoleId === '' ? theme.primarySoft : theme.white,
                    },
                  ]}>
                  <Text style={[styles.roleOptionText, { color: theme.ink }]}>No preference</Text>
                </Pressable>
                {committee.dutyRoles.map((role) => {
                  const selected = preferredDutyRoleId === role.id;
                  return (
                    <Pressable
                      key={role.id}
                      accessibilityRole="button"
                      onPress={() => setPreferredDutyRoleId(role.id)}
                      style={[
                        styles.roleOption,
                        {
                          borderColor: selected ? theme.primary : theme.line,
                          backgroundColor: selected ? theme.primarySoft : theme.white,
                        },
                      ]}>
                      <Text style={[styles.roleOptionText, { color: theme.ink }]}>{role.title}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <StoryTextField
            label="Child's grade (optional)"
            value={grade}
            onChangeText={setGrade}
            placeholder="e.g. 3rd grade"
          />

          <StoryTextField
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Share relevant experience or availability…"
            multiline
            numberOfLines={3}
            style={styles.noteInput}
          />

          <StoryButton
            label={submitting ? 'Submitting…' : 'Submit request'}
            onPress={() => void handleSubmit()}
            disabled={submitting}
          />
        </StoryCard>
      ) : null}

      {showWithdrawSection ? (
        <StoryCard compact style={styles.formCard}>
          <Text style={[styles.formHint, { color: theme.muted }]}>
            Your request is waiting for school review.
          </Text>
          <StoryButton
            label={withdrawing ? 'Withdrawing…' : 'Withdraw request'}
            variant="outline"
            onPress={() => void handleWithdraw()}
            disabled={withdrawing}
          />
        </StoryCard>
      ) : null}

      {committee.requestStatus === 'approved' && !committee.isMember ? (
        <Text style={[styles.approvedHint, { color: theme.muted }]}>
          Your request was approved. Open this committee from My committees to view the workspace.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  loadingCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 13,
  },
  titleBlock: {
    gap: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackBanner: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontFamily: StoryFonts.display,
    fontSize: 14,
    fontWeight: '700',
  },
  dutyRoleList: {
    gap: Spacing.two,
  },
  dutyRoleCard: {
    padding: StoryCardPadding,
    gap: Spacing.one,
  },
  dutyRoleTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  dutyRoleDescription: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  formCard: {
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  formHeader: {
    gap: Spacing.one,
  },
  formHint: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  fieldBlock: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 12,
  },
  rolePicker: {
    gap: Spacing.two,
  },
  roleOption: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  roleOptionText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  approvedHint: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
