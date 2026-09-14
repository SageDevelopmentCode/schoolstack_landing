import { StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type StoryProgressBarProps = {
  completed: number;
  total: number;
  label?: string;
};

export function StoryProgressBar({
  completed,
  total,
  label = 'Progress',
}: StoryProgressBarProps) {
  const theme = useParentTheme();
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
        <Text style={[styles.count, { color: theme.muted }]}>
          {completed}/{total}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.primarySoft }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: theme.primary, width: `${progressPct}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  count: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
