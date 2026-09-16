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

type TeacherMyStudentsMetricRowProps = {
  totalCount: number;
  totalLabel: string;
  unassignedTeacherCount?: number;
  healthFlagCount?: number;
  programCount?: number;
  showProgramMetric?: boolean;
};

function TeacherMetricCard({ value, label, accent }: MetricItem) {
  const theme = useParentTheme();

  return (
    <StoryCard compact style={styles.metricCard}>
      <View style={[styles.accentBar, { backgroundColor: ACCENT_COLORS[accent] }]} />
      <Text style={[styles.value, { color: theme.ink }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
    </StoryCard>
  );
}

export function TeacherMyStudentsMetricRow({
  totalCount,
  totalLabel,
  unassignedTeacherCount = 0,
  healthFlagCount = 0,
  programCount = 0,
  showProgramMetric = false,
}: TeacherMyStudentsMetricRowProps) {
  const metrics: MetricItem[] = [
    { value: totalCount, label: totalLabel, accent: 'forest' },
  ];

  if (unassignedTeacherCount > 0) {
    metrics.push({
      value: unassignedTeacherCount,
      label: 'Unassigned teacher',
      accent: 'gold',
    });
  }

  if (healthFlagCount > 0) {
    metrics.push({
      value: healthFlagCount,
      label: 'Health flags',
      accent: 'berry',
    });
  }

  if (showProgramMetric && programCount > 0) {
    metrics.push({
      value: programCount,
      label: 'Programs',
      accent: 'sky',
    });
  }

  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <TeacherMetricCard key={metric.label} {...metric} />
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
