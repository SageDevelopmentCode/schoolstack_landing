import { StyleSheet, View } from 'react-native';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { Garden } from '@/components/parent/garden/tokens';
import { GSkeleton } from '@/components/parent/garden/ui';

/** First-load layout for the list: header, next-up strip, progress, notebook rows. */
export function ParentFormsDocumentsGardenSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.root} accessibilityLabel="Loading forms" accessibilityState={{ busy: true }}>
      <GBackHeader
        backLabel="More"
        backAccessibilityLabel="Back"
        onBack={onBack}
        title="Forms & Documents"
        accentWord="Documents"
      />
      <View style={styles.card}>
        <GSkeleton style={{ width: 80, height: 11 }} />
        <GSkeleton style={{ height: 84, borderRadius: 16 }} />
      </View>
      <View style={styles.card}>
        <GSkeleton style={{ width: 110, height: 11 }} />
        <GSkeleton style={{ width: '55%', height: 22 }} />
        <GSkeleton style={{ height: 14, borderRadius: 999 }} />
      </View>
      <View style={styles.card}>
        <GSkeleton style={{ height: 44, borderRadius: 999 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={styles.row}>
            <GSkeleton style={{ width: 26, height: 26, borderRadius: 13 }} />
            <View style={styles.copy}>
              <GSkeleton style={{ width: '65%', height: 14 }} />
              <GSkeleton style={{ width: '40%', height: 11 }} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/** First-load layout for one form: header, steps, document, sign card. */
export function ParentFormDetailGardenSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.root} accessibilityLabel="Loading form" accessibilityState={{ busy: true }}>
      <GBackHeader
        backLabel="Forms"
        backAccessibilityLabel="Back to forms"
        onBack={onBack}
        title="Loading form…"
      />
      <View style={styles.card}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.row}>
            <GSkeleton style={{ width: 28, height: 28, borderRadius: 14 }} />
            <GSkeleton style={{ width: '50%', height: 14 }} />
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <GSkeleton style={{ height: 260, borderRadius: 16 }} />
      </View>
      <View style={styles.card}>
        <GSkeleton style={{ width: '45%', height: 14 }} />
        <GSkeleton style={{ height: 48, borderRadius: 14 }} />
        <GSkeleton style={{ width: 140, height: 44, borderRadius: 999 }} />
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
});
