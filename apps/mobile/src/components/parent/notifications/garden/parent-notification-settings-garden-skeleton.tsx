import { StyleSheet, View } from 'react-native';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { Garden } from '@/components/parent/garden/tokens';
import { GSkeleton } from '@/components/parent/garden/ui';

/** First-load layout: header, "Currently sending to", login row, editor card. */
export function ParentNotificationSettingsGardenSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <View
      style={styles.root}
      accessibilityLabel="Loading notification settings"
      accessibilityState={{ busy: true }}>
      <GBackHeader
        backLabel="More"
        backAccessibilityLabel="Back"
        onBack={onBack}
        title="Notification settings"
        accentWord="Notification"
      />
      <View style={styles.card}>
        <GSkeleton style={{ width: 80, height: 11 }} />
        <GSkeleton style={{ width: '60%', height: 20 }} />
        {Array.from({ length: 2 }).map((_, i) => (
          <View key={i} style={styles.row}>
            <GSkeleton style={{ width: 32, height: 32, borderRadius: 16 }} />
            <View style={styles.copy}>
              <GSkeleton style={{ width: '65%', height: 14 }} />
              <GSkeleton style={{ width: 120, height: 20, borderRadius: 999 }} />
            </View>
          </View>
        ))}
      </View>
      <View style={[styles.card, styles.paper]}>
        <View style={styles.row}>
          <GSkeleton style={{ width: 32, height: 32, borderRadius: 16 }} />
          <View style={styles.copy}>
            <GSkeleton style={{ width: 70, height: 11 }} />
            <GSkeleton style={{ width: '55%', height: 14 }} />
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <GSkeleton style={{ width: '50%', height: 20 }} />
          <GSkeleton style={{ width: 56, height: 22, borderRadius: 999 }} />
        </View>
        <GSkeleton style={{ width: '90%', height: 12 }} />
        <GSkeleton style={{ width: '75%', height: 12 }} />
        {Array.from({ length: 2 }).map((_, i) => (
          <GSkeleton key={i} style={{ height: 52, borderRadius: 14 }} />
        ))}
        <GSkeleton style={{ width: 110, height: 48, borderRadius: 999 }} />
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
  paper: { backgroundColor: Garden.paper },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  copy: { flex: 1, gap: 8 },
});
