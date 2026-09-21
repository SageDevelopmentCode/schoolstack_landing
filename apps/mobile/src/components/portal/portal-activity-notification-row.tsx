import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';

export type PortalActivityNotificationItem = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  ctaLabel: string;
  category: string;
};

function categoryIcon(category: string): keyof typeof Ionicons.glyphMap {
  switch (category) {
    case 'messages':
      return 'chatbubble-outline';
    case 'payments':
      return 'card-outline';
    case 'applications':
    case 'enrollment':
      return 'document-text-outline';
    case 'announcements':
      return 'megaphone-outline';
    case 'events':
      return 'calendar-outline';
    case 'signups':
      return 'clipboard-outline';
    case 'health':
      return 'heart-outline';
    case 'committees':
    case 'coop':
      return 'people-outline';
    default:
      return 'notifications-outline';
  }
}

type PortalActivityNotificationRowProps = {
  item: PortalActivityNotificationItem;
  onPress: () => void;
  showDivider?: boolean;
  pressable?: boolean;
};

export function PortalActivityNotificationRow({
  item,
  onPress,
  showDivider = false,
  pressable = true,
}: PortalActivityNotificationRowProps) {
  const theme = useParentTheme();
  const isPayment = item.category === 'payments';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!pressable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        showDivider && {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: Story.line,
        },
        pressable && pressed && { opacity: 0.85 },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: theme.successBg }]}>
        <Ionicons name={categoryIcon(item.category)} size={16} color={theme.primary} />
      </View>

      <View style={styles.copy}>
        {isPayment ? (
          <Text style={[styles.detail, { color: theme.ink }]} numberOfLines={3}>
            {item.detail}
          </Text>
        ) : (
          <>
            <Text style={[styles.title, { color: theme.ink }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.detail, { color: theme.muted }]} numberOfLines={3}>
              {item.detail}
            </Text>
          </>
        )}
        <Text style={[styles.time, { color: theme.muted }]}>
          {formatRelativeTime(item.createdAt)}
        </Text>
      </View>

      {pressable ? (
        <Text style={[styles.cta, { color: theme.primary }]} numberOfLines={1}>
          {item.ctaLabel} →
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  detail: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  cta: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 0,
    maxWidth: 72,
    marginTop: 2,
  },
});
