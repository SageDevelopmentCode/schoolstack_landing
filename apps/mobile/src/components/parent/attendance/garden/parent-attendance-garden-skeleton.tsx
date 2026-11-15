import { StyleSheet, View } from 'react-native';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { Garden } from '@/components/parent/garden/tokens';
import { GSkeleton } from '@/components/parent/garden/ui';

/** First-load layout: header, latest-day card, weeks grid, history rows. */
export function ParentAttendanceGardenSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <View
      style={styles.root}
      accessibilityLabel="Loading attendance"
      accessibilityState={{ busy: true }}>
      <GBackHeader
        backLabel="More"
        backAccessibilityLabel="Back"
        onBack={onBack}
        kicker="Attendance"
        title="Attendance"
      />
      <GSkeleton style={{ height: 44, borderRadius: 999 }} />
      <View style={styles.card}>
        <GSkeleton style={{ width: 90, height: 11 }} />
        <View style={styles.row}>
          <GSkeleton style={{ width: 72, height: 84, borderRadius: 12 }} />
          <View style={styles.copy}>
            <GSkeleton style={{ width: 80, height: 20, borderRadius: 999 }} />
            <GSkeleton style={{ width: '70%', height: 14 }} />
            <GSkeleton style={{ width: '50%', height: 12 }} />
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <GSkeleton style={{ width: 120, height: 11 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={styles.week}>
            {Array.from({ length: 5 }).map((__, d) => (
              <GSkeleton key={d} style={{ flex: 1, height: 44, borderRadius: 12 }} />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.card}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.copy}>
              <GSkeleton style={{ width: '45%', height: 14 }} />
              <GSkeleton style={{ width: '30%', height: 11 }} />
            </View>
            <GSkeleton style={{ width: 64, height: 22, borderRadius: 999 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream, paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  card: {
    backgroundColor: Garden.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    padding: 18,
    gap: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  copy: { flex: 1, gap: 8 },
  week: { flexDirection: 'row', gap: 6 },
});
