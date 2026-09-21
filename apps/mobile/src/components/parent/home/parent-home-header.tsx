import { StyleSheet, View } from 'react-native';

import { PortalHomeHeaderToolbar } from '@/components/portal/portal-home-header-toolbar';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { Spacing } from '@/constants/theme';
import { firstName, greetingParts } from '@/lib/parent/parent-home-utils';

type ParentHomeHeaderProps = {
  displayName: string;
  bulletinEnabled?: boolean;
  bulletinPostCount?: number;
  notificationUnreadCount?: number;
  onOpenBulletin?: () => void;
  onPressNotifications?: () => void;
};

export function ParentHomeHeader({
  displayName,
  bulletinEnabled = false,
  bulletinPostCount = 0,
  notificationUnreadCount = 0,
  onOpenBulletin,
  onPressNotifications,
}: ParentHomeHeaderProps) {
  const name = firstName(displayName);
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();

  const showToolbar =
    (bulletinEnabled && onOpenBulletin) || Boolean(onPressNotifications);

  return (
    <View style={styles.container}>
      {showToolbar ? (
        <PortalHomeHeaderToolbar
          bulletin={
            bulletinEnabled && onOpenBulletin
              ? { postCount: bulletinPostCount, onPress: onOpenBulletin }
              : undefined
          }
          notifications={
            onPressNotifications
              ? { unreadCount: notificationUnreadCount, onPress: onPressNotifications }
              : undefined
          }
        />
      ) : null}

      <StoryDisplayHeading size="display">
        {greetingPrefix}, {name}. {greetingEmoji}
      </StoryDisplayHeading>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
});
