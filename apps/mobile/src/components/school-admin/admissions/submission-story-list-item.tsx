import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip, type StoryChipTone } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { deriveSubmissionNextStep } from '@/lib/admissions/admin-submission-next-step';
import {
  adminCombinedStatusProgressLabel,
  applicationStatusChipTone,
} from '@/lib/admissions/application-status-ui';
import {
  formatSubmissionProgress,
  type AdminApplicationSubmission,
} from '@/lib/admissions/application-submissions';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { SubmissionNextStepTone } from '@/lib/admissions/admin-submission-next-step';

type SubmissionStoryListItemProps = {
  submission: AdminApplicationSubmission;
  onPress: (submission: AdminApplicationSubmission) => void;
};

function nextStepChipTone(tone: SubmissionNextStepTone): StoryChipTone {
  if (tone === 'purple') return 'info';
  return tone;
}

export function SubmissionStoryListItem({ submission, onPress }: SubmissionStoryListItemProps) {
  const theme = useParentTheme();
  const studentName = submission.studentLabel?.trim() ?? '';
  const displayStudent = studentName || '—';
  const guardianPart = submission.guardianName?.trim() || '—';
  const contactEmail = submission.contactEmail?.trim();
  const contactLine = contactEmail ? `${guardianPart} · ${contactEmail}` : guardianPart;
  const accessibilityLabel = `${displayStudent}, ${contactLine}`;
  const nextStep = deriveSubmissionNextStep(submission);
  const progressLabel = formatSubmissionProgress(submission);
  const relativeUpdated = formatRelativeTime(submission.updatedAt);
  const statusLabel = adminCombinedStatusProgressLabel(
    submission.status,
    submission.applicationProgressSummary,
    submission.enrollmentSummary,
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress(submission)}
      style={({ pressed }) => [pressed && { opacity: 0.95 }]}>
      <StoryCard compact style={styles.card}>
        <View style={styles.topRow}>
          <StudentPhoto name={studentName} size="row" />
          <View style={styles.mainCopy}>
            <StoryDisplayHeading size="section" numberOfLines={1} style={styles.studentName}>
              {displayStudent}
            </StoryDisplayHeading>
            <Text style={[styles.contactLine, { color: theme.muted }]} numberOfLines={1}>
              {contactLine}
            </Text>
          </View>
        </View>

        <View style={styles.chipRow}>
          <StoryChip
            tone={applicationStatusChipTone(submission.status)}
            label={statusLabel}
            uppercase={false}
          />
          {submission.programName ? (
            <StoryChip tone="info" label={submission.programName} uppercase={false} />
          ) : null}
        </View>

        <Text style={[styles.metaLine, { color: theme.muted }]}>
          {[progressLabel, relativeUpdated].filter(Boolean).join(' · ')}
        </Text>

        {nextStep.primary !== '—' ? (
          <View style={styles.nextStepRow}>
            <StoryChip
              tone={nextStepChipTone(nextStep.tone)}
              label={nextStep.primary}
              uppercase={false}
            />
            {nextStep.secondary ? (
              <Text style={[styles.nextStepSecondary, { color: theme.muted }]}>
                {nextStep.secondary}
              </Text>
            ) : null}
          </View>
        ) : null}
      </StoryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  mainCopy: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontSize: 20,
    lineHeight: 26,
  },
  contactLine: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  metaLine: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  nextStepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.one,
  },
  nextStepSecondary: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 14,
  },
});
