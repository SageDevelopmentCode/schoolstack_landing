import { StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ScheduleAvailabilityLegendProps = {
  openLabel: string;
};

export function ScheduleAvailabilityLegend({ openLabel }: ScheduleAvailabilityLegendProps) {
  const theme = useParentTheme();

  return (
    <View style={styles.row}>
      <View style={styles.item}>
        <View
          style={[
            styles.swatch,
            {
              backgroundColor: theme.paper,
              borderColor: theme.line,
              borderStyle: 'dashed',
            },
          ]}
        />
        <Text style={[styles.label, { color: theme.muted }]}>Not open</Text>
      </View>
      <View style={styles.item}>
        <View
          style={[
            styles.swatch,
            {
              backgroundColor: theme.primarySoft,
              borderColor: theme.primary,
              borderWidth: 2,
            },
          ]}
        />
        <Text style={[styles.label, { color: theme.muted }]}>{openLabel}</Text>
      </View>
      <View style={styles.item}>
        <View style={[styles.swatch, styles.bookedSwatch, { borderColor: theme.primary }]}>
          <View style={[styles.swatchFill, { backgroundColor: theme.primarySoft }]} />
          <View style={[styles.bookedStripe, { backgroundColor: theme.warning }]} />
        </View>
        <Text style={[styles.label, { color: theme.muted }]}>Has booking</Text>
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
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
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
    ...StyleSheet.absoluteFill,
  },
  bookedStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
  },
});
