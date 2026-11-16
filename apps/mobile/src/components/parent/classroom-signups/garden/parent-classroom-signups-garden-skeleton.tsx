import { StyleSheet, View } from 'react-native';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { Garden } from '@/components/parent/garden/tokens';
import { GSkeleton } from '@/components/parent/garden/ui';

/** First-load layout for the signups list, or (`variant="detail"`) one signup. */
export function ParentClassroomSignupsGardenSkeleton({
  onBack,
  variant = 'list',
}: {
  onBack: () => void;
  variant?: 'list' | 'detail';
}) {
  const detail = variant === 'detail';
  return (
    <View
      style={styles.root}
      accessibilityLabel={detail ? 'Loading signup' : 'Loading classroom signups'}
      accessibilityState={{ busy: true }}>
      <GBackHeader
        backLabel={detail ? 'Classroom signups' : 'More'}
        backAccessibilityLabel="Back"
        onBack={onBack}
        title={detail ? ' ' : 'Classroom signups'}
      />
      <View style={styles.card}>
        <GSkeleton style={{ width: 90, height: 11 }} />
        <GSkeleton style={{ width: '70%', height: 20 }} />
        <GSkeleton style={{ height: 76, borderRadius: 16 }} />
      </View>
      <View style={styles.card}>
        <GSkeleton style={{ height: 40, borderRadius: 999 }} />
        {Array.from({ length: detail ? 3 : 4 }).map((_, i) => (
          <View key={i} style={styles.row}>
            <GSkeleton style={{ width: 36, height: 36, borderRadius: 18 }} />
            <View style={styles.copy}>
              <GSkeleton style={{ width: '65%', height: 14 }} />
              <GSkeleton style={{ width: '45%', height: 11 }} />
            </View>
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
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    padding: 18,
    gap: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, gap: 6 },
});
