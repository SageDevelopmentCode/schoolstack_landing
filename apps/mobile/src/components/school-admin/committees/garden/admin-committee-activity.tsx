import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, type GChipTone } from '@/components/parent/garden/tokens';
import { GChip, GPressable } from '@/components/parent/garden/ui';
import { AdminEmptyPanel, AdminRowSkeleton } from '@/components/school-admin/garden/admin-ui';
import type { CommitteeActivityItem } from '@/lib/parent/parent-committees-types';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';

const CATEGORY_TONES: Record<string, GChipTone> = {
  Members: 'success',
  Tasks: 'info',
  Resources: 'info',
  Calendar: 'warning',
  Messages: 'info',
  Roles: 'alert',
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Members: 'people-outline',
  Tasks: 'checkbox-outline',
  Resources: 'folder-open-outline',
  Calendar: 'calendar-outline',
  Messages: 'chatbubbles-outline',
  Roles: 'ribbon-outline',
};

/** Garden committee activity list (same rows and copy as the Story feed). */
export function AdminCommitteeActivity({
  items,
  loading = false,
  limit,
  showCommitteeName = false,
  emptyMessage = 'No activity yet.',
  onItemPress,
}: {
  items: CommitteeActivityItem[];
  loading?: boolean;
  limit?: number;
  showCommitteeName?: boolean;
  emptyMessage?: string;
  onItemPress?: (item: CommitteeActivityItem) => void;
}) {
  if (loading) return <AdminRowSkeleton count={4} />;
  if (items.length === 0) return <AdminEmptyPanel icon="pulse-outline" title={emptyMessage} />;
  const visible = limit ? items.slice(0, limit) : items;
  return (
    <View>
      {visible.map((item, index) => {
        const meta = [item.actorName, formatRelativeTime(item.createdAt)].filter(Boolean).join(' · ');
        const body = (
          <>
            <View style={styles.icon}>
              <Ionicons name={CATEGORY_ICONS[item.category] ?? 'ellipse-outline'} size={16} color={Garden.ink65} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.summary} numberOfLines={2}>
                {showCommitteeName && item.committeeName ? <Text style={styles.committee}>{item.committeeName} · </Text> : null}
                {item.summary}
              </Text>
              <View style={styles.metaRow}>
                <GChip label={item.category.toLowerCase()} tone={CATEGORY_TONES[item.category] ?? 'info'} />
                {meta ? (
                  <Text style={styles.meta} numberOfLines={1}>
                    {meta}
                  </Text>
                ) : null}
              </View>
            </View>
            {onItemPress && item.committeeId ? <Ionicons name="chevron-forward" size={16} color={Garden.ink60} /> : null}
          </>
        );
        const rowStyle = [styles.row, index > 0 && styles.divider];
        return onItemPress && item.committeeId ? (
          <GPressable key={item.id} accessibilityLabel={`${item.summary}. ${meta}`} onPress={() => onItemPress(item)} style={rowStyle}>
            {body}
          </GPressable>
        ) : (
          <View key={item.id} style={rowStyle} accessible accessibilityLabel={`${item.summary}. ${meta}`}>
            {body}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  icon: { width: 32, height: 32, borderRadius: 11, backgroundColor: Garden.paper, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  summary: { fontFamily: GardenFonts.bodyBold, fontSize: 14, lineHeight: 19, color: Garden.ink },
  committee: { fontFamily: GardenFonts.bodyExtra, color: Garden.forest },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { flexShrink: 1, fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft },
});
