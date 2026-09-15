import { StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type MetricAccent = 'forest' | 'sky' | 'gold' | 'berry';

const ACCENT_COLORS: Record<MetricAccent, string> = {
  forest: '#315E4F',
  sky: '#8ABAC6',
  gold: '#E4BD65',
  berry: '#B66A83',
};

type MetricItem = {
  value: number;
  label: string;
  accent: MetricAccent;
};

type StudentsMetricRowProps = {
  totalCount: number;
  unassignedCount: number;
  programCount: number;
  newEnrollmentCount: number;
};

function StudentsMetricCard({ value, label, accent }: MetricItem) {
  const theme = useParentTheme();

  return (
    <StoryCard compact style={styles.metricCard}>
      <View style={[styles.accentBar, { backgroundColor: ACCENT_COLORS[accent] }]} />
      <Text style={[styles.value, { color: theme.ink }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
    </StoryCard>
  );
}

export function StudentsMetricRow({
  totalCount,
  unassignedCount,
  programCount,
  newEnrollmentCount,
}: StudentsMetricRowProps) {
  const metrics: MetricItem[] = [
    { value: totalCount, label: 'All enrolled', accent: 'forest' },
    { value: unassignedCount, label: 'Needs attention', accent: 'sky' },
    { value: programCount, label: 'Programs', accent: 'gold' },
    { value: newEnrollmentCount, label: 'New enrollments', accent: 'berry' },
  ];

  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <StudentsMetricCard key={metric.label} {...metric} />
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
  metricCard: {
    width: '48%',
    flexGrow: 1,
    padding: StoryCardPadding,
    gap: Spacing.one,
    overflow: 'hidden',
  },
  accentBar: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginBottom: Spacing.one,
  },
  value: {
    fontFamily: StoryFonts.display,
    fontSize: 28,
    lineHeight: 32,
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
});
