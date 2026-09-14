import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type MetricAccent = 'forest' | 'sky' | 'gold';

const ACCENT_COLORS: Record<MetricAccent, string> = {
  forest: '#315E4F',
  sky: '#8ABAC6',
  gold: '#E4BD65',
};

type MetricItem = {
  value: string;
  label: string;
  accent: MetricAccent;
  onPress?: () => void;
};

type ScheduleMetricRowProps = {
  monthSlotCount: number | null;
  monthObservationDayCount: number | null;
  upcomingVisitCount: number | null;
  onPressTours: () => void;
  onPressShadow: () => void;
  onPressVisits: () => void;
};

function ScheduleMetricCard({ value, label, accent, onPress }: MetricItem) {
  const theme = useParentTheme();

  const content = (
    <StoryCard compact style={styles.metricCard}>
      <View style={[styles.accentBar, { backgroundColor: ACCENT_COLORS[accent] }]} />
      <View style={styles.valueRow}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
          style={[styles.value, { color: theme.ink }]}>
          {value}
        </Text>
      </View>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
    </StoryCard>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.metricPressable, pressed && { opacity: 0.95 }]}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.metricPressable}>{content}</View>;
}

export function ScheduleMetricRow({
  monthSlotCount,
  monthObservationDayCount,
  upcomingVisitCount,
  onPressTours,
  onPressShadow,
  onPressVisits,
}: ScheduleMetricRowProps) {
  const metrics: MetricItem[] = [
    {
      value: monthSlotCount == null ? '—' : String(monthSlotCount),
      label: 'Open time slots this month',
      accent: 'sky',
      onPress: onPressTours,
    },
    {
      value: monthObservationDayCount == null ? '—' : String(monthObservationDayCount),
      label: 'Open shadow days this month',
      accent: 'gold',
      onPress: onPressShadow,
    },
    {
      value: upcomingVisitCount == null ? '—' : String(upcomingVisitCount),
      label: 'Upcoming visits',
      accent: 'forest',
      onPress: onPressVisits,
    },
  ];

  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <ScheduleMetricCard key={metric.label} {...metric} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricPressable: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: '46%',
    alignSelf: 'stretch',
  },
  metricCard: {
    flex: 1,
    padding: StoryCardPadding,
    paddingLeft: StoryCardPadding + 4,
    overflow: 'hidden',
  },
  valueRow: {
    minHeight: 28,
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  value: {
    fontFamily: StoryFonts.display,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '600',
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
