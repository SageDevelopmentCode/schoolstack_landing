import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useParentTheme } from '@/contexts/parent-theme-context';

export function ParentCoopCurriculumStoryHeader() {
  const theme = useParentTheme();

  return (
    <View style={styles.header}>
      <StorySectionKicker>Co-op</StorySectionKicker>
      <View style={styles.titleRow}>
        <Ionicons name="book-outline" size={28} color={theme.primary} />
        <StoryDisplayHeading size="section">Curriculum</StoryDisplayHeading>
      </View>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Guides and discussion for your co-op week.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
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
  },
});
