import { StyleSheet, View } from 'react-native';

import { PortalHomeHeaderToolbar } from '@/components/portal/portal-home-header-toolbar';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { Spacing } from '@/constants/theme';
import { greetingParts } from '@/lib/school-admin/greeting';

type AdminDashboardHeaderProps = {
  userFirstName?: string | null;
  unreadCount?: number;
  onPressBulletin?: () => void;
  onPressNotifications?: () => void;
};

export function AdminDashboardHeader({
  userFirstName,
  unreadCount = 0,
  onPressBulletin,
  onPressNotifications,
}: AdminDashboardHeaderProps) {
  const greetingName = userFirstName?.trim() || 'there';
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();

  const showToolbar = Boolean(onPressBulletin) || Boolean(onPressNotifications);

  return (
    <View style={styles.container}>
      {showToolbar ? (
        <PortalHomeHeaderToolbar
          bulletin={onPressBulletin ? { onPress: onPressBulletin } : undefined}
          notifications={
            onPressNotifications
              ? { unreadCount, onPress: onPressNotifications }
              : undefined
          }
        />
      ) : null}

      <StoryDisplayHeading size="display" style={styles.greeting}>
        {greetingPrefix}, {greetingName}. {greetingEmoji}
      </StoryDisplayHeading>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  greeting: {
    marginTop: 0,
  },
});
