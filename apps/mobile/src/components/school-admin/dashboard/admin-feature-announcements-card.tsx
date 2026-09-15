import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AdminCard } from '@/components/admin/admin-card';
import { AdminFeatureAnnouncementItem } from '@/components/school-admin/dashboard/admin-feature-announcement-item';
import { AdminFeatureAnnouncementsSheet } from '@/components/school-admin/dashboard/admin-feature-announcements-sheet';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import type { ResolvedAdminFeatureAnnouncement } from '@/lib/school-admin/dashboard-summary-types';

const PREVIEW_LIMIT = 3;

type AdminFeatureAnnouncementsCardProps = {
  announcements: ResolvedAdminFeatureAnnouncement[];
};

export function AdminFeatureAnnouncementsCard({
  announcements,
}: AdminFeatureAnnouncementsCardProps) {
  const theme = useAdminTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (announcements.length === 0) {
    return null;
  }

  const preview = announcements.slice(0, PREVIEW_LIMIT);
  const hasMore = announcements.length > PREVIEW_LIMIT;

  return (
    <>
      <AdminCard
        style={[
          styles.card,
          {
            backgroundColor: '#FFFDF8',
            borderColor: '#E9EFEA',
          },
        ]}>
        <ThemedText type="badge" style={{ color: theme.textTertiary, letterSpacing: 1.2 }}>
          WHAT&apos;S NEW
        </ThemedText>
        <ThemedText type="title" style={{ color: theme.textPrimary }}>
          New features for you
        </ThemedText>

        <View style={styles.list}>
          {preview.map((announcement) => (
            <AdminFeatureAnnouncementItem key={announcement.id} announcement={announcement} />
          ))}
        </View>

        {hasMore ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setSheetOpen(true)}
            style={({ pressed }) => [styles.viewMore, pressed && { opacity: 0.85 }]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              View more →
            </ThemedText>
          </Pressable>
        ) : null}
      </AdminCard>

      <AdminFeatureAnnouncementsSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        announcements={announcements}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  list: {
    marginTop: Spacing.two,
    gap: Spacing.three,
  },
  viewMore: {
    marginTop: Spacing.one,
  },
});
