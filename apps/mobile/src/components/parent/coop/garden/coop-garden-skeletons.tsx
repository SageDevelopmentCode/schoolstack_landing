import { StyleSheet, View } from 'react-native';

import {
  CoopScreenRoot,
  coopContentStyle,
} from '@/components/parent/coop/garden/coop-garden-ui';
import { GBackHeader } from '@/components/parent/garden/back-header';
import { Garden } from '@/components/parent/garden/tokens';
import { GSkeleton } from '@/components/parent/garden/ui';

/**
 * Loading layouts shaped like the finished co-op screens. The real header
 * shows straight away (it is static copy), so only the data area pulses.
 */
function SkeletonFrame({
  title,
  accentWord,
  subtitle,
  label,
  children,
}: {
  title: string;
  accentWord: string;
  subtitle: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <CoopScreenRoot>
      <View
        style={coopContentStyle}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label}>
        <GBackHeader title={title} accentWord={accentWord} subtitle={subtitle} />
        {children}
      </View>
    </CoopScreenRoot>
  );
}

function StatStripSkeleton({ nextUp = false }: { nextUp?: boolean }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.statCell, i > 0 && styles.statDivider]}>
            <GSkeleton style={styles.statNumber} />
            <GSkeleton style={styles.statLabel} />
          </View>
        ))}
      </View>
      {nextUp ? (
        <View style={styles.nextUp}>
          <GSkeleton style={styles.kicker} />
          <GSkeleton style={styles.nextUpTitle} />
        </View>
      ) : null}
    </View>
  );
}

function SegmentedSkeleton() {
  return <GSkeleton style={styles.segmented} />;
}

export function CoopTeachingScheduleSkeleton({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <SkeletonFrame
      title={title}
      accentWord="schedule"
      subtitle={subtitle}
      label="Loading teaching schedule">
      <StatStripSkeleton nextUp />
      <SegmentedSkeleton />
      {[0, 1].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.ticket}>
            <GSkeleton style={styles.stamp} />
            <View style={styles.ticketCopy}>
              <GSkeleton style={styles.lineWide} />
              <GSkeleton style={styles.lineShort} />
            </View>
          </View>
          <View style={styles.rule} />
          <GSkeleton style={styles.lineMid} />
          <GSkeleton style={styles.pill} />
          <GSkeleton style={styles.lineMid} />
          <GSkeleton style={styles.pill} />
        </View>
      ))}
    </SkeletonFrame>
  );
}

export function CoopSupplyListSkeleton({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <SkeletonFrame title={title} accentWord="list" subtitle={subtitle} label="Loading supply list">
      <GSkeleton style={styles.search} />
      <StatStripSkeleton />
      <SegmentedSkeleton />
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.rowBetween}>
            <GSkeleton style={styles.lineWide} />
            <GSkeleton style={styles.chip} />
          </View>
          <GSkeleton style={styles.lineShort} />
          <GSkeleton style={styles.pill} />
        </View>
      ))}
    </SkeletonFrame>
  );
}

export function CoopCurriculumSkeleton({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <SkeletonFrame title={title} accentWord={title} subtitle={subtitle} label="Loading curriculum">
      <SegmentedSkeleton />
      <View style={styles.card}>
        <GSkeleton style={styles.lineWide} />
        <View style={styles.page}>
          <GSkeleton style={styles.pageTitle} />
          {[0, 1, 2, 3, 4].map((i) => (
            <GSkeleton key={i} style={[styles.pageLine, i === 4 && styles.pageLineShort]} />
          ))}
        </View>
        <GSkeleton style={styles.toy} />
      </View>
      <View style={styles.card}>
        <GSkeleton style={styles.lineMid} />
      </View>
    </SkeletonFrame>
  );
}

const styles = StyleSheet.create({
  statCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    overflow: 'hidden',
  },
  statRow: { flexDirection: 'row' },
  statCell: { flex: 1, padding: 16, gap: 8 },
  statDivider: { borderLeftWidth: 1.5, borderLeftColor: Garden.ink10 },
  statNumber: { width: 44, height: 30, borderRadius: 8 },
  statLabel: { width: 60, height: 12, borderRadius: 6 },
  nextUp: {
    borderTopWidth: 1.5,
    borderTopColor: Garden.ink10,
    padding: 16,
    gap: 8,
    backgroundColor: Garden.paper,
  },
  kicker: { width: 56, height: 10, borderRadius: 5 },
  nextUpTitle: { width: '60%', height: 20, borderRadius: 8 },
  segmented: { height: 46, borderRadius: 999 },
  search: { height: 48, borderRadius: 999 },
  card: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    padding: 16,
    gap: 12,
  },
  ticket: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ticketCopy: { flex: 1, gap: 8 },
  stamp: { width: 52, height: 60, borderRadius: 10 },
  rule: { height: 1, backgroundColor: Garden.ink10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  chip: { width: 72, height: 22, borderRadius: 999 },
  lineWide: { width: '70%', height: 16, borderRadius: 8 },
  lineMid: { width: '50%', height: 13, borderRadius: 7 },
  lineShort: { width: '40%', height: 12, borderRadius: 6 },
  pill: { width: 168, height: 38, borderRadius: 999 },
  page: {
    aspectRatio: 0.78,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.paper,
    padding: 22,
    gap: 12,
  },
  pageTitle: { width: '55%', height: 18, borderRadius: 8, marginBottom: 6 },
  pageLine: { height: 10, borderRadius: 5 },
  pageLineShort: { width: '60%' },
  toy: { width: 170, height: 46, borderRadius: 999 },
});
