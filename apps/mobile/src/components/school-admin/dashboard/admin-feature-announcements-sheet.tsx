import { View } from 'react-native';

import { AdminFeatureAnnouncementItem } from '@/components/school-admin/dashboard/admin-feature-announcement-item';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import type { ResolvedAdminFeatureAnnouncement } from '@/lib/school-admin/dashboard-summary-types';
import { Spacing } from '@/constants/theme';

type AdminFeatureAnnouncementsSheetProps = {
  visible: boolean;
  onClose: () => void;
  announcements: ResolvedAdminFeatureAnnouncement[];
};

export function AdminFeatureAnnouncementsSheet({
  visible,
  onClose,
  announcements,
}: AdminFeatureAnnouncementsSheetProps) {
  const subtitle =
    announcements.length === 1 ? '1 update' : `${announcements.length} updates`;

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={onClose}
      title="New features for you"
      subtitle={subtitle}
      accessibilityLabel="Close feature announcements">
      <View style={{ gap: Spacing.three }}>
        {announcements.map((announcement) => (
          <AdminFeatureAnnouncementItem key={announcement.id} announcement={announcement} />
        ))}
      </View>
    </ParentBottomSheet>
  );
}
