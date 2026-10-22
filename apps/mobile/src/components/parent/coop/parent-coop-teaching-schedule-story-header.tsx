import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useParentTheme } from '@/contexts/parent-theme-context';

export function ParentCoopTeachingScheduleStoryHeader() {
  const theme = useParentTheme();

  return (
    <View style={styles.header}>
      <StorySectionKicker>Co-op</StorySectionKicker>
      <View style={styles.titleRow}>
        <Ionicons name="calendar-outline" size={28} color={theme.primary} />
        <StoryDisplayHeading size="section">Teaching schedule</StoryDisplayHeading>
      </View>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        View the full year teaching schedule and sign up to volunteer when instructor or assistant
        slots are open.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
    paddingTop: Spacing.four,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
});
