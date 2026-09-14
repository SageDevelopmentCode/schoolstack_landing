import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { childSubtitleLine } from '@/lib/parent/parent-home-utils';
import type { FamilyChildOverview } from '@/lib/parent/parent-portal-api';

type ParentHomeChildStoryCardProps = {
  child: FamilyChildOverview;
  onViewDetails: () => void;
  onOpenEnrollment?: () => void;
};

export function ParentHomeChildStoryCard({
  child,
  onViewDetails,
  onOpenEnrollment,
}: ParentHomeChildStoryCardProps) {
  const theme = useParentTheme();
  const childFirstName = child.studentName.split(' ')[0] ?? child.studentName;
  const statusTone = child.isEnrolled ? 'success' : 'info';
  const showEnrollmentLink = child.isEnrolled || child.status === 'enrolling';

  return (
    <StoryCard style={styles.card}>
      <View style={styles.headerRow}>
        <StudentPhoto name={child.studentName} photoUrl={child.profilePhotoUrl} size="lg" />
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: theme.ink }]}>{childFirstName}</Text>
            <StoryChip tone={statusTone} label={`● ${child.statusLabel}`} />
          </View>
          <Text style={styles.subtitle}>{childSubtitleLine(child)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <StoryButton
          label={`See ${childFirstName}'s details`}
          variant="primary"
          onPress={onViewDetails}
          trailingIcon={<Ionicons name="arrow-forward" size={16} color={Story.white} />}
        />
        {showEnrollmentLink && onOpenEnrollment ? (
          <StoryTextLink label="Enrollment checklist" onPress={onOpenEnrollment} />
        ) : null}
      </View>
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    fontFamily: StoryFonts.display,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    flex: 1,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: '#7B878D',
  },
  actions: {
    gap: Spacing.two,
  },
});
