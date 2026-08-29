import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';

type ScheduleAvailabilityLegendProps = {
  openLabel: string;
};

export function ScheduleAvailabilityLegend({ openLabel }: ScheduleAvailabilityLegendProps) {
  const theme = useAdminTheme();

  return (
    <View style={styles.row}>
      <View style={styles.item}>
        <View
          style={[
            styles.swatch,
            {
              backgroundColor: theme.bg,
              borderColor: theme.border,
              borderStyle: 'dashed',
            },
          ]}
        />
        <ThemedText type="small" style={{ color: theme.textTertiary }}>
          Not open
        </ThemedText>
      </View>
      <View style={styles.item}>
        <View
          style={[
            styles.swatch,
            {
              backgroundColor: theme.accentLight,
              borderColor: theme.accent,
              borderWidth: 2,
            },
          ]}
        />
        <ThemedText type="small" style={{ color: theme.textTertiary }}>
          {openLabel}
        </ThemedText>
      </View>
      <View style={styles.item}>
        <View style={[styles.swatch, styles.bookedSwatch, { borderColor: theme.accent }]}>
          <View style={[styles.swatchFill, { backgroundColor: theme.accentLight }]} />
          <View style={[styles.bookedStripe, { backgroundColor: theme.warning }]} />
        </View>
        <ThemedText type="small" style={{ color: theme.textTertiary }}>
          Has booking
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.5,
  },
  bookedSwatch: {
    overflow: 'hidden',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  swatchFill: {
    ...StyleSheet.absoluteFillObject,
  },
  bookedStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
  },
});
