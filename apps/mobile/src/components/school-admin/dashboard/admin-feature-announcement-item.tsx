import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { ResolvedAdminFeatureAnnouncement } from '@/lib/school-admin/dashboard-summary-types';

export function formatAnnouncementDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

type AdminFeatureAnnouncementItemProps = {
  announcement: ResolvedAdminFeatureAnnouncement;
};

export function AdminFeatureAnnouncementItem({ announcement }: AdminFeatureAnnouncementItemProps) {
  const theme = useAdminTheme();

  return (
    <View style={styles.announcementCard}>
      <ThemedText
        type="badge"
        style={{ color: theme.textTertiary, fontSize: 10, letterSpacing: 0.4 }}>
        {formatAnnouncementDate(announcement.publishedAt).toUpperCase()}
      </ThemedText>
      <ThemedText type="smallBold" style={{ color: theme.textPrimary, marginTop: 6 }}>
        {announcement.title}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.two }}>
        {announcement.description}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  announcementCard: {
    borderRadius: Radius.md + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E9EFEA',
    backgroundColor: '#FFFDF8',
    padding: Spacing.four,
  },
});
