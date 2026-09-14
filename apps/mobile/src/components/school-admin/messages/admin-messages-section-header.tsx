import { StyleSheet, Text, View } from 'react-native';

import { StoryFonts } from '@/constants/story-theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Spacing } from '@/constants/theme';

type AdminMessagesSectionHeaderProps = {
  label: string;
  description?: string;
};

export function AdminMessagesSectionHeader({ label, description }: AdminMessagesSectionHeaderProps) {
  const theme = useParentTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={[styles.line, { backgroundColor: theme.line }]} />
        <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: theme.line }]} />
      </View>
      {description ? (
        <Text style={[styles.description, { color: theme.muted }]}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  label: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
});
