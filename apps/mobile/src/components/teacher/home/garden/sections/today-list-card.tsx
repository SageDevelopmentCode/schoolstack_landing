import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GCard, GChip, GHand, GTick } from '@/components/parent/garden/ui';
import { AdminWorkRow } from '@/components/school-admin/garden/admin-ui';
import { focusItemIconName } from '@/lib/teacher/teacher-home-utils';
import type {
  TeacherDashboardFocusIcon,
  TeacherDashboardFocusItem,
} from '@/lib/teacher/teacher-portal-api';

const FOCUS_TINTS: Record<TeacherDashboardFocusIcon, string> = {
  message: Garden.lav,
  calendar: Garden.sky,
  attendance: Garden.peach,
  students: Garden.butter,
  signups: Garden.mint,
};

export function focusHeadline(count: number): string {
  return count > 0
    ? `${count} thing${count === 1 ? '' : 's'} need your attention`
    : "You're all caught up";
}

/**
 * "Start here": today's to-do list on ruled notebook paper. Every row is the
 * button; rows with no in-app screen explain themselves (feedback hook).
 */
export function TodayListCard({
  items,
  onPressItem,
  index = 0,
}: {
  items: TeacherDashboardFocusItem[];
  onPressItem: (item: TeacherDashboardFocusItem) => void;
  index?: number;
}) {
  const count = items.length;
  return (
    <GCard
      title="Start here"
      index={index}
      testID="teacher-home-start-here"
      action={count > 0 ? <GChip label={`${count} to do`} tone="warning" /> : null}>
      <Text style={styles.headline}>{focusHeadline(count)}</Text>
      {count > 0 ? (
        <View style={styles.notebook} accessibilityRole="list">
          {items.map((item, i) => (
            <AdminWorkRow
              key={item.id}
              testID={`teacher-home-focus-${item.id}`}
              step={i + 1}
              divider={i > 0}
              icon={focusItemIconName(item.icon)}
              tint={FOCUS_TINTS[item.icon] ?? Garden.sky}
              title={item.title}
              meta={item.subtitle}
              ctaLabel="Open"
              onPress={() => onPressItem(item)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.caughtUp} testID="teacher-home-caught-up">
          <GTick size={32} />
          <View style={styles.caughtUpCopy}>
            <Text style={styles.caughtUpText}>
              No urgent tasks right now. Check back for messages and school updates.
            </Text>
            <GHand>enjoy the quiet ✿</GHand>
          </View>
        </View>
      )}
    </GCard>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 14.5,
    lineHeight: 20,
    color: Garden.soft,
    marginTop: -6,
    marginBottom: 12,
  },
  notebook: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Garden.ink10,
    backgroundColor: Garden.notebook,
    paddingHorizontal: 12,
  },
  caughtUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    backgroundColor: Garden.mint,
    padding: 16,
  },
  caughtUpCopy: { flex: 1, gap: 2 },
  caughtUpText: { fontFamily: GardenFonts.bodyBold, fontSize: 14, lineHeight: 20, color: Garden.forestDeep },
});
