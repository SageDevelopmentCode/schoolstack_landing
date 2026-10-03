import { StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';

export function formatCountBadge(count: number): string {
  if (count > 99) return '99+';
  return String(count);
}

type StoryCountBadgeProps = {
  count: number;
};

export function StoryCountBadge({ count }: StoryCountBadgeProps) {
  const theme = useParentTheme();
  if (count <= 0) return null;

  return (
    <View style={[styles.pill, { backgroundColor: theme.primaryLight }]}>
      <Text style={[styles.label, { color: theme.primary }]}>{formatCountBadge(count)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minWidth: 18,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    lineHeight: 12,
  },
});
