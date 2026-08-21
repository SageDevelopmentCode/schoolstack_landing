import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';

type DetailProgressBarProps = {
  completed: number;
  total: number;
  label?: string;
};

export function DetailProgressBar({
  completed,
  total,
  label = 'Progress',
}: DetailProgressBarProps) {
  const theme = useAdminTheme();
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {label}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textTertiary }}>
          {completed}/{total}
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: theme.accent, width: `${progressPct}%` },
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
  track: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
