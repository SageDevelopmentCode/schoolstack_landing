import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import {
  adminApplicationStatusLabel,
  applicationStatusChipTone,
} from '@/lib/admissions/application-status-ui';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type SubmissionStoryDetailHeaderProps = {
  studentLabel: string | null;
  status: string;
};

export function SubmissionStoryDetailHeader({
  studentLabel,
  status,
}: SubmissionStoryDetailHeaderProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const displayName = studentLabel ?? 'Application';

  return (
    <View style={[styles.container, { backgroundColor: Story.paper, borderBottomColor: theme.line }]}>
      <View style={styles.navRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to submissions"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <StorySectionKicker style={styles.kicker}>Application review</StorySectionKicker>
        <View style={styles.titleRow}>
          <StoryDisplayHeading size="section" style={styles.title}>
            {displayName}
          </StoryDisplayHeading>
          <StoryChip
            tone={applicationStatusChipTone(status)}
            label={adminApplicationStatusLabel(status)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingBottom: Spacing.three,
  },
  navRow: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  hero: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.one,
    gap: Spacing.one,
  },
  kicker: {
    marginBottom: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
  },
});
