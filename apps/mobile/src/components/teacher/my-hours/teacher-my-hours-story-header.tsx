import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  formatCompactNavDate,
  formatMonthYear,
} from '@/lib/teacher/my-hours/format-duration';
import type { MyHoursView } from '@/lib/teacher/my-hours/types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type TeacherMyHoursStoryHeaderProps = {
  view: MyHoursView;
  focusDate: Date;
  monthDate: Date;
  onViewChange: (view: MyHoursView) => void;
  onPreviousDate: () => void;
  onNextDate: () => void;
};

const VIEW_ITEMS = [
  { key: 'day', label: 'Day', testID: 'teacher-my-hours-view-day' },
  { key: 'week', label: 'Week', testID: 'teacher-my-hours-view-week' },
  { key: 'month', label: 'Month', testID: 'teacher-my-hours-view-month' },
] as const;

export function TeacherMyHoursStoryHeader({
  view,
  focusDate,
  monthDate,
  onViewChange,
  onPreviousDate,
  onNextDate,
}: TeacherMyHoursStoryHeaderProps) {
  const theme = useParentTheme();
  const navLabel =
    view === 'month' ? formatMonthYear(monthDate) : formatCompactNavDate(focusDate);

  return (
    <View style={styles.container} testID="teacher-my-hours-story-header">
      <View style={styles.copyBlock}>
        <StorySectionKicker>Staff portal</StorySectionKicker>
        <StoryDisplayHeading size="section">My Hours</StoryDisplayHeading>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Clock in and out to track your daily work time.
        </Text>
      </View>

      <View style={[styles.dateNav, { borderColor: theme.line, backgroundColor: theme.white }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous date"
          onPress={onPreviousDate}
          style={({ pressed }) => [styles.dateNavButton, pressed && styles.pressed]}>
          <Ionicons name="chevron-back" size={18} color={theme.ink} />
        </Pressable>
        <Text style={[styles.dateNavLabel, { color: theme.ink }]}>{navLabel}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next date"
          onPress={onNextDate}
          style={({ pressed }) => [styles.dateNavButton, pressed && styles.pressed]}>
          <Ionicons name="chevron-forward" size={18} color={theme.ink} />
        </Pressable>
      </View>

      <StoryPillNav
        items={[...VIEW_ITEMS]}
        activeKey={view}
        onChange={(key) => onViewChange(key as MyHoursView)}
        accessibilityLabel="Hours view"
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  copyBlock: {
    gap: Spacing.one,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
  },
  dateNavButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dateNavLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    minWidth: 120,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
