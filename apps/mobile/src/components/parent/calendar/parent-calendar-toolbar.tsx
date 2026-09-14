import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryPillNav } from '@/components/story/story-pill-nav';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

import type { ParentCalendarViewMode } from './use-parent-calendar-view';

type ParentCalendarToolbarProps = {
  periodLabel: string;
  viewMode: ParentCalendarViewMode;
  onViewModeChange: (mode: ParentCalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export function ParentCalendarToolbar({
  periodLabel,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
}: ParentCalendarToolbarProps) {
  const theme = useParentTheme();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.periodNav}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous period"
            onPress={onPrev}
            style={styles.navButton}>
            <Ionicons name="chevron-back" size={18} color={theme.muted} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next period"
            onPress={onNext}
            style={styles.navButton}>
            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
          </Pressable>
          <Text style={[styles.periodLabel, { color: theme.ink }]} numberOfLines={1}>
            {periodLabel}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to today"
          onPress={onToday}
          style={[
            styles.todayButton,
            {
              backgroundColor: theme.primarySoft,
              borderColor: theme.line,
            },
          ]}>
          <Text style={[styles.todayLabel, { color: theme.primary }]}>Today</Text>
        </Pressable>
      </View>

      <StoryPillNav
        fullWidth
        items={[
          { key: 'day', label: 'Day' },
          { key: 'week', label: 'Week' },
          { key: 'month', label: 'Month' },
        ]}
        activeKey={viewMode}
        onChange={(key) => onViewModeChange(key as ParentCalendarViewMode)}
        accessibilityLabel="Calendar view"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  periodNav: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minWidth: 0,
  },
  navButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodLabel: {
    flex: 1,
    fontFamily: StoryFonts.display,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    minWidth: 0,
  },
  todayButton: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  todayLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '700',
  },
});
