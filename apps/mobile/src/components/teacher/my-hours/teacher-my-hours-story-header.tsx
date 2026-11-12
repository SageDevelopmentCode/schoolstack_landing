import { StyleSheet, View } from 'react-native';

import { StoryPillNav } from '@/components/story/story-pill-nav';
import type { MyHoursView } from '@/lib/teacher/my-hours/types';
import { Spacing } from '@/constants/theme';

type TeacherMyHoursViewNavProps = {
  view: MyHoursView;
  onViewChange: (view: MyHoursView) => void;
};

const VIEW_ITEMS = [
  { key: 'day', label: 'Day', icon: 'sunny-outline' as const, testID: 'teacher-my-hours-view-day' },
  { key: 'week', label: 'Week', icon: 'calendar-outline' as const, testID: 'teacher-my-hours-view-week' },
  { key: 'month', label: 'Month', icon: 'calendar-number-outline' as const, testID: 'teacher-my-hours-view-month' },
  { key: 'adjust', label: 'Adjust', icon: 'pencil-outline' as const, testID: 'teacher-my-hours-view-adjust' },
] as const;

export function TeacherMyHoursViewNav({ view, onViewChange }: TeacherMyHoursViewNavProps) {
  return (
    <View style={styles.container} testID="teacher-my-hours-view-nav">
      <StoryPillNav
        items={[...VIEW_ITEMS]}
        activeKey={view}
        onChange={(key) => onViewChange(key as MyHoursView)}
        accessibilityLabel="Hours view"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
