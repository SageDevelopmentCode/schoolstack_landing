import { StyleSheet, View } from 'react-native';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { Garden } from '@/components/parent/garden/tokens';
import { GSkeleton } from '@/components/parent/garden/ui';

import { NEWSLETTERS_HEADER } from '@/components/parent/newsletters/garden/parent-newsletters-header';

/** First-load layout: header, the latest-edition card, then older edition rows. */
export function ParentNewslettersGardenSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <View
      style={styles.root}
      accessibilityLabel="Loading newsletters"
      accessibilityState={{ busy: true }}>
      <GBackHeader onBack={onBack} {...NEWSLETTERS_HEADER} />
      <View style={[styles.card, styles.latest]}>
        <View style={styles.top}>
          <GSkeleton style={{ width: 32, height: 32, borderRadius: 999 }} />
          <GSkeleton style={{ width: 64, height: 22, borderRadius: 999 }} />
        </View>
        <GSkeleton style={{ width: '100%', height: 140, borderRadius: 14 }} />
        <GSkeleton style={{ width: '40%', height: 11 }} />
        <GSkeleton style={{ width: '75%', height: 18 }} />
        <GSkeleton style={{ width: '30%', height: 12 }} />
      </View>
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={[styles.card, styles.row]}>
          <GSkeleton style={{ width: 64, height: 64, borderRadius: 12 }} />
          <View style={styles.copy}>
            <GSkeleton style={{ width: '45%', height: 11 }} />
            <GSkeleton style={{ width: '80%', height: 14 }} />
            <GSkeleton style={{ width: '35%', height: 11 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream, paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  card: {
    backgroundColor: Garden.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    padding: 16,
    gap: 10,
  },
  latest: { borderColor: Garden.ink06 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12 },
  copy: { flex: 1, gap: 8 },
});
