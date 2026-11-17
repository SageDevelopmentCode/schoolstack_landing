import { StyleSheet, View } from 'react-native';

import { Garden } from '@/components/parent/garden/tokens';
import { GSkeleton } from '@/components/parent/garden/ui';

/** Shaped like the screen: dark clock card, view switcher + pager, the day card. */
export function MyHoursSkeleton() {
  return (
    <View style={styles.root} testID="teacher-my-hours-skeleton" accessibilityLabel="Loading your hours">
      <View style={styles.clock}>
        <GSkeleton style={[styles.light, styles.clockTitle]} />
        <GSkeleton style={[styles.light, styles.clockTimer]} />
        <GSkeleton style={[styles.light, styles.clockBar]} />
        <GSkeleton style={[styles.light, styles.clockButton]} />
      </View>
      <GSkeleton style={styles.segmented} />
      <GSkeleton style={styles.pager} />
      <View style={styles.card}>
        <GSkeleton style={styles.cardTitle} />
        <GSkeleton style={styles.ticket} />
        <GSkeleton style={styles.ticket} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 14 },
  clock: { borderRadius: 24, padding: 18, gap: 14, backgroundColor: Garden.ink25 },
  light: { backgroundColor: 'rgba(255,255,255,0.22)' },
  clockTitle: { width: '35%', height: 20, borderRadius: 8 },
  clockTimer: { width: '60%', height: 40, borderRadius: 12 },
  clockBar: { height: 12, borderRadius: 6 },
  clockButton: { width: 150, height: 52, borderRadius: 26 },
  segmented: { height: 44, borderRadius: 22 },
  pager: { height: 58, borderRadius: 22 },
  card: { borderRadius: 24, padding: 18, gap: 12, backgroundColor: Garden.white },
  cardTitle: { width: '40%', height: 22, borderRadius: 8 },
  ticket: { height: 56, borderRadius: 16 },
});
