import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Garden } from '@/components/parent/garden/tokens';
import { GSkeleton } from '@/components/parent/garden/ui';

function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

/** The record card while a child's profile loads. */
export function ChildRecordSkeleton() {
  return (
    <View style={styles.stack} testID="parent-children-record-skeleton" accessibilityLabel="Loading school record">
      <Card>
        <GSkeleton style={{ width: 100, height: 11 }} />
        <GSkeleton style={{ width: '60%', height: 22 }} />
        <GSkeleton style={{ height: 52, borderRadius: 16 }} />
      </Card>
      <Card>
        <View style={styles.row}>
          <GSkeleton style={{ width: 96, height: 96, borderRadius: 8 }} />
          <View style={styles.copy}>
            <GSkeleton style={{ width: '70%', height: 20 }} />
            <GSkeleton style={{ width: 90, height: 20, borderRadius: 999 }} />
            <GSkeleton style={{ width: '50%', height: 14 }} />
          </View>
        </View>
        <GSkeleton style={{ height: 44, borderRadius: 999 }} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.row}>
            <GSkeleton style={{ width: 28, height: 28, borderRadius: 14 }} />
            <GSkeleton style={{ flex: 1, height: 16 }} />
          </View>
        ))}
      </Card>
    </View>
  );
}

/** First-load layout: header, learner strip and the record. */
export function ParentChildrenGardenSkeleton() {
  return (
    <View style={styles.root} accessibilityLabel="Loading your children" accessibilityState={{ busy: true }}>
      <View style={styles.header}>
        <GSkeleton style={{ width: 160, height: 11 }} />
        <GSkeleton style={{ width: '65%', height: 30 }} />
        <GSkeleton style={{ width: '45%', height: 14 }} />
      </View>
      <View style={styles.strip}>
        <GSkeleton style={{ width: 168, height: 70, borderRadius: 18 }} />
        <GSkeleton style={{ width: 168, height: 70, borderRadius: 18 }} />
      </View>
      <ChildRecordSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream, paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  header: { gap: 8 },
  strip: { flexDirection: 'row', gap: 10 },
  stack: { gap: 16 },
  card: {
    backgroundColor: Garden.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    padding: 18,
    gap: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  copy: { flex: 1, gap: 8 },
});
