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

type AdmissionsMetricRowProps = {
  activeCount: number;
  draftCount: number;
  submittedCount: number;
  enrolledCount: number;
};

function AdmissionsMetricCard({ value, label, accent }: MetricItem) {
  const theme = useParentTheme();

  return (
    <StoryCard compact style={styles.metricCard}>
      <View style={[styles.accentBar, { backgroundColor: ACCENT_COLORS[accent] }]} />
      <Text style={[styles.value, { color: theme.ink }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
    </StoryCard>
  );
}

export function AdmissionsMetricRow({
  activeCount,
  draftCount,
  submittedCount,
  enrolledCount,
}: AdmissionsMetricRowProps) {
  const metrics: MetricItem[] = [
    { value: activeCount, label: 'All applications', accent: 'forest' },
    { value: draftCount, label: 'In progress', accent: 'sky' },
    { value: submittedCount, label: 'Ready to review', accent: 'gold' },
    { value: enrolledCount, label: 'Enrolled learners', accent: 'berry' },
  ];

  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <AdmissionsMetricCard key={metric.label} {...metric} />
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
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: '46%',
    padding: StoryCardPadding,
    paddingLeft: StoryCardPadding + 4,
    overflow: 'hidden',
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
    marginBottom: Spacing.one,
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
