import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius } from '@/constants/theme';

type SetupProgressBarProps = {
  completed: number;
  total: number;
  label: string;
  subtitle: string;
};

export function SetupProgressBar({ completed, total, label, subtitle }: SetupProgressBarProps) {
  const theme = useAdminTheme();
  const progress = total > 0 ? completed / total : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          {label}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {completed}/{total}
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.fill,
            { width: `${Math.round(progress * 100)}%`, backgroundColor: theme.accent },
          ]}
        />
      </View>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        {subtitle}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  track: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});
