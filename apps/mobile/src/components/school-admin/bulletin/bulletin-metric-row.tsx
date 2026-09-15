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

type BulletinMetricRowProps = {
  activeCount: number;
  draftsCount: number;
  scheduledCount: number;
  totalCount: number;
};

function BulletinMetricCard({ value, label, accent }: MetricItem) {
  const theme = useParentTheme();

  return (
    <StoryCard compact style={styles.metricCard}>
      <View style={[styles.accentBar, { backgroundColor: ACCENT_COLORS[accent] }]} />
      <Text style={[styles.value, { color: theme.ink }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
    </StoryCard>
  );
}

export function BulletinMetricRow({
  activeCount,
  draftsCount,
  scheduledCount,
  totalCount,
}: BulletinMetricRowProps) {
  const metrics: MetricItem[] = [
    { value: activeCount, label: 'Active', accent: 'forest' },
    { value: draftsCount, label: 'Drafts', accent: 'gold' },
    { value: scheduledCount, label: 'Scheduled', accent: 'sky' },
    { value: totalCount, label: 'Total posts', accent: 'berry' },
  ];

  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <BulletinMetricCard key={metric.label} {...metric} />
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
    width: '47%',
    flexGrow: 1,
    padding: StoryCardPadding,
    gap: Spacing.one,
  },
  accentBar: {
    width: 4,
    height: 28,
    borderRadius: 999,
    marginBottom: Spacing.one,
  },
  value: {
    fontFamily: StoryFonts.display,
    fontSize: 28,
    lineHeight: 32,
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
