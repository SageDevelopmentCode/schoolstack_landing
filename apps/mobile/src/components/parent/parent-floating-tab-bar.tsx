import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScalePressable } from '@/components/scale-pressable';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius } from '@/constants/theme';
import type { MobileParentTabDefinition } from '@/lib/parent/mobile-parent-portal-nav';
import type { ParentTab } from '@/lib/parent/parent-nav';

export const PARENT_FLOATING_TAB_BAR_HEIGHT = 60;

type ParentFloatingTabBarProps = {
  tabs: MobileParentTabDefinition[];
  activeTab: ParentTab;
  onChange: (tab: ParentTab) => void;
  messagesUnreadCount?: number;
  /** When true, omit absolute positioning (parent supplies bottom chrome stack). */
  embedded?: boolean;
};

export function ParentFloatingTabBar({
  tabs,
  activeTab,
  onChange,
  messagesUnreadCount = 0,
  embedded = false,
}: ParentFloatingTabBarProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        embedded ? styles.wrapperEmbedded : { bottom: insets.bottom + 4 },
      ]}>
      <View style={styles.pillInset}>
        <View style={styles.pill}>
        {tabs.map((tab) => {
          const active = activeTab === tab.tabId;
          const showUnreadBadge = tab.tabId === 'messages' && messagesUnreadCount > 0;
          return (
            <ScalePressable
              key={tab.tabId}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              pressedScale={0.94}
              onPress={() => onChange(tab.tabId)}
              style={[styles.tab, active && { backgroundColor: theme.accentLight }]}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name={
                    (active ? tab.iconFilled : tab.iconOutline) as keyof typeof Ionicons.glyphMap
                  }
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
                }}
                numberOfLines={1}>
                {tab.label}
              </ThemedText>
            </ScalePressable>
          );
        })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'stretch',
    zIndex: 30,
  },
  wrapperEmbedded: {
    position: 'relative',
  },
  pillInset: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
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
