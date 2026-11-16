import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GCard, GChip, GLink, GTape } from '@/components/parent/garden/ui';
import type { ResolvedAdminFeatureAnnouncement } from '@/lib/school-admin/dashboard-summary-types';

const PREVIEW_LIMIT = 3;

export function formatAnnouncementDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function AnnouncementItem({
  announcement,
  latest = false,
  divider = false,
}: {
  announcement: ResolvedAdminFeatureAnnouncement;
  latest?: boolean;
  divider?: boolean;
}) {
  const date = formatAnnouncementDate(announcement.publishedAt);
  return (
    <View
      accessible
      accessibilityLabel={`${announcement.title}. ${date}. ${announcement.description}`}
      style={[styles.item, latest && styles.itemLatest, divider && !latest && styles.divider]}>
      {latest ? <GTape /> : null}
      <View style={styles.itemHead}>
        <View style={[styles.itemIcon, { backgroundColor: latest ? Garden.white : Garden.lav }]}>
          <Ionicons name="sparkles-outline" size={16} color={Garden.ink65} />
        </View>
        <Text style={styles.date}>{date}</Text>
        {latest ? <GChip label="Latest" tone="warning" /> : null}
      </View>
      <Text style={styles.title}>{announcement.title}</Text>
      <Text style={styles.description}>{announcement.description}</Text>
    </View>
  );
}

/** New features for admins: the first three inline, the rest in a sheet. */
export function WhatsNewCard({
  announcements,
  onViewMore,
  index = 0,
}: {
  announcements: ResolvedAdminFeatureAnnouncement[];
  onViewMore: () => void;
  index?: number;
}) {
  if (announcements.length === 0) return null;
  const preview = announcements.slice(0, PREVIEW_LIMIT);
  return (
    <GCard
      title="New features for you"
      index={index}
      testID="dashboard-whats-new"
      action={
        announcements.length > PREVIEW_LIMIT ? (
          <GLink label="View more" accessibilityLabel="View more new features" onPress={onViewMore} />
        ) : null
      }>
      {preview.map((announcement, i) => (
        <AnnouncementItem
          key={announcement.id}
          announcement={announcement}
          latest={i === 0}
          divider={i > 0}
        />
      ))}
    </GCard>
  );
}

export function WhatsNewSheet({
  visible,
  onClose,
  announcements,
}: {
  visible: boolean;
  onClose: () => void;
  announcements: ResolvedAdminFeatureAnnouncement[];
}) {
  const count = announcements.length;
  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      title="New features for you"
      subtitle={count === 1 ? '1 update' : `${count} updates`}
      accessibilityLabel="Close feature announcements">
      {announcements.map((announcement, i) => (
        <AnnouncementItem
          key={announcement.id}
          announcement={announcement}
          latest={i === 0}
          divider={i > 0}
        />
      ))}
    </GSheet>
  );
}

const styles = StyleSheet.create({
  item: { gap: 4, paddingVertical: 12 },
  itemLatest: {
    backgroundColor: Garden.butter,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 16,
    marginBottom: 4,
  },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  itemHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: { flex: 1, fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft },
  title: { fontFamily: GardenFonts.bodyExtra, fontSize: 15.5, lineHeight: 21, color: Garden.ink, marginTop: 4 },
  description: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: Garden.ink65 },
});
