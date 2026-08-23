import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius } from '@/constants/theme';
import type { ParentTab } from '@/lib/parent/parent-nav';

export const PARENT_FLOATING_TAB_BAR_HEIGHT = 60;

type ParentFloatingTabBarProps = {
  activeTab: ParentTab;
  onChange: (tab: ParentTab) => void;
  messagesUnreadCount?: number;
};

const TABS: {
  id: ParentTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { id: 'billing', label: 'Billing', icon: 'card-outline', iconActive: 'card' },
  {
    id: 'messages',
    label: 'Messages',
    icon: 'chatbubble-outline',
    iconActive: 'chatbubble',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: 'calendar-outline',
    iconActive: 'calendar',
  },
  {
    id: 'more',
    label: 'More',
    icon: 'ellipsis-horizontal-outline',
    iconActive: 'ellipsis-horizontal',
  },
];

export function ParentFloatingTabBar({
  activeTab,
  onChange,
  messagesUnreadCount = 0,
}: ParentFloatingTabBarProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: insets.bottom + 4 }]}>
      <View style={styles.pill}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const showUnreadBadge = tab.id === 'messages' && messagesUnreadCount > 0;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(tab.id)}
              style={({ pressed }) => [
                styles.tab,
                active && { backgroundColor: theme.accentLight },
                pressed && styles.tabPressed,
              ]}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name={active ? tab.iconActive : tab.icon}
                  size={20}
                  color={active ? theme.accent : theme.textTertiary}
                />
                {showUnreadBadge ? (
                  <View style={[styles.unreadDot, { backgroundColor: theme.accent }]}>
                    <ThemedText type="badge" style={styles.unreadCount}>
                      {messagesUnreadCount > 9 ? '9+' : String(messagesUnreadCount)}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
              <ThemedText
                type="smallBold"
                style={{
                  color: active ? theme.accent : theme.textTertiary,
                  fontSize: 9,
                  lineHeight: 11,
                }}>
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 30,
  },
  pill: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 400,
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: Radius.md,
  },
  tabPressed: {
    opacity: 0.85,
  },
  iconWrap: {
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 8,
    lineHeight: 10,
  },
});
