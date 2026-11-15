import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Garden } from '@/components/parent/garden/tokens';
import { GSkeleton } from '@/components/parent/garden/ui';

/** Loading layout shaped like the Garden Calendar (header, note, calendar card, agenda). */
export function ParentCalendarGardenSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.root, { marginTop: -insets.top, paddingTop: insets.top }]}
      accessible
      accessibilityLabel="Loading calendar">
      <StatusBar style="dark" />
      <ScrollView scrollEnabled={false} contentContainerStyle={styles.content}>
        <View style={styles.pane}>
          <GSkeleton style={styles.segmented} />
          <GSkeleton style={styles.period} />
          <GSkeleton style={styles.legend} />
          <View style={styles.week}>
            {Array.from({ length: 7 }, (_, i) => (
              <GSkeleton key={i} style={styles.day} />
            ))}
          </View>
          <GSkeleton style={styles.timeline} />
        </View>
        <View style={styles.lower}>
          <GSkeleton style={styles.note} />
          <View style={styles.card}>
            <GSkeleton style={styles.kicker} />
            <GSkeleton style={styles.row} />
            <GSkeleton style={styles.row} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Garden.white,
  },
  content: {
    flexGrow: 1,
  },
  pane: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: Garden.white,
    borderBottomWidth: 1.5,
    borderBottomColor: Garden.ink10,
  },
  lower: {
    flexGrow: 1,
    gap: 16,
    padding: 16,
    backgroundColor: Garden.cream,
  },
  kicker: {
    width: 110,
    height: 12,
    borderRadius: 6,
  },
  note: {
    height: 72,
    borderRadius: 12,
  },
  card: {
    gap: 14,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  segmented: {
    height: 50,
    borderRadius: 999,
  },
  period: {
    alignSelf: 'center',
    width: 200,
    height: 44,
    borderRadius: 12,
  },
  legend: {
    width: 180,
    height: 14,
    borderRadius: 7,
  },
  week: {
    flexDirection: 'row',
    gap: 5,
  },
  day: {
    flex: 1,
    height: 72,
    borderRadius: 14,
  },
  timeline: {
    height: 200,
    borderRadius: 12,
  },
  row: {
    height: 84,
    borderRadius: 16,
  },
});
