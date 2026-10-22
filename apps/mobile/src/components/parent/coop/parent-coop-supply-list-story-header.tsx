import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { useParentTheme } from '@/contexts/parent-theme-context';

type ParentCoopSupplyListStoryHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function ParentCoopSupplyListStoryHeader({
  search,
  onSearchChange,
}: ParentCoopSupplyListStoryHeaderProps) {
  const theme = useParentTheme();

  return (
    <View style={styles.header}>
      <StorySectionKicker>Co-op</StorySectionKicker>
      <View style={styles.titleRow}>
        <Ionicons name="list-outline" size={28} color={theme.primary} />
        <StoryDisplayHeading size="section">Supply list</StoryDisplayHeading>
      </View>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Sign up for shared supplies your family can bring to co-op weeks.
      </Text>
      <TextInput
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search items…"
        placeholderTextColor={theme.muted}
        style={[
          styles.search,
          { borderColor: theme.line, color: theme.ink, backgroundColor: theme.white },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
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
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: StoryFonts.body,
    fontSize: 15,
  },
});
