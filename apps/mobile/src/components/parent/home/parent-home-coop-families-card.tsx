import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { createParentMessageThread } from '@/lib/messages/parent-api';
import { createParentPortalErrorReporter } from '@/lib/mobile-error-reporter';
import type { ProgramCoopFamily, ProgramCoopLearner } from '@/lib/parent/parent-portal-api';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

function formatLearnerLine(learner: ProgramCoopLearner): string {
  if (learner.grade) {
    return `${learner.firstName} · ${learner.grade}`;
  }
  return learner.firstName;
}

type ParentHomeCoopFamiliesCardProps = {
  programLabel: string;
  families: ProgramCoopFamily[];
  organizationId: string;
  programId: string;
  messagesEnabled: boolean;
  onOpenThread: (threadId: string) => void;
};

export function ParentHomeCoopFamiliesCard({
  programLabel,
  families,
  organizationId,
  programId,
  messagesEnabled,
  onOpenThread,
}: ParentHomeCoopFamiliesCardProps) {
  const theme = useParentTheme();
  const [loadingFamilyId, setLoadingFamilyId] = useState<string | null>(null);

  const handleMessage = async (family: ProgramCoopFamily) => {
    if (!family.contactGuardianId || loadingFamilyId) return;

    setLoadingFamilyId(family.familyId);
    try {
      const threadId = await createParentMessageThread(
        organizationId,
        {
          key: `guardian:${family.contactGuardianId}`,
          kind: 'guardian',
          guardianId: family.contactGuardianId,
          familyId: family.familyId,
          name: family.familyName,
          color: theme.primary,
        },
        { programId },
      );
      onOpenThread(threadId);
    } catch (err) {
      createParentPortalErrorReporter(organizationId)('coop_family_message_thread', err);
    } finally {
      setLoadingFamilyId(null);
    }
  };

  return (
    <View style={styles.section}>
      <StoryDisplayHeading size="section">See who else is in your co-op</StoryDisplayHeading>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Families enrolled in {programLabel}.
      </Text>

      {families.length === 0 ? (
        <StoryCard style={styles.emptyCard}>
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>
            You&apos;re the first family we see in this co-op so far.
          </Text>
        </StoryCard>
      ) : (
        <View style={styles.grid}>
          {families.map((family) => (
            <StoryCard key={family.familyId} style={styles.familyCard}>
              <View style={styles.familyHeader}>
                <View style={styles.familyTitleBlock}>
                  <StorySectionKicker>Family</StorySectionKicker>
                  <Text style={[styles.familyName, { color: theme.ink }]}>{family.familyName}</Text>
                </View>
                <View style={styles.familyActions}>
                  {family.isCurrentFamily ? (
                    <StoryChip tone="info" label="Your family" />
                  ) : null}
                  {!family.isCurrentFamily &&
                  messagesEnabled &&
                  family.contactGuardianId ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Message ${family.familyName}`}
                      onPress={() => void handleMessage(family)}
                      style={({ pressed }) => [
                        styles.messageButton,
                        { borderColor: theme.line },
                        pressed && { opacity: 0.85 },
                      ]}>
                      {loadingFamilyId === family.familyId ? (
                        <ActivityIndicator size="small" color={theme.primary} />
                      ) : (
                        <Text style={[styles.messageLabel, { color: theme.primary }]}>Message</Text>
                      )}
                    </Pressable>
                  ) : null}
                </View>
              </View>
              <View style={styles.learners}>
                {family.learners.map((learner) => (
                  <View key={learner.studentId} style={styles.learnerRow}>
                    {learner.profilePhotoUrl ? (
                      <Image source={{ uri: learner.profilePhotoUrl }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatarFallback, { backgroundColor: '#E9F2EA' }]}>
                        <Text style={[styles.avatarInitial, { color: theme.primary }]}>
                          {learner.firstName.charAt(0)}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.learnerLine, { color: theme.ink }]}>
                      {formatLearnerLine(learner)}
                    </Text>
                  </View>
                ))}
              </View>
            </StoryCard>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -Spacing.one,
  },
  emptyCard: {
    padding: StoryCardPadding,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  grid: {
    gap: Spacing.three,
  },
  familyCard: {
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  familyTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  familyName: {
    fontFamily: StoryFonts.display,
    fontSize: 16,
    fontWeight: '600',
  },
  familyActions: {
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  messageButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 72,
    alignItems: 'center',
  },
  messageLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  learners: {
    gap: Spacing.two,
  },
  learnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '700',
  },
  learnerLine: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    flex: 1,
  },
});
