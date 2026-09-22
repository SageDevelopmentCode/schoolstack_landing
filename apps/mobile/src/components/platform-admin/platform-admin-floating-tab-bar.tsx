import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScalePressable } from '@/components/scale-pressable';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Radius } from '@/constants/theme';
import type { PlatformAdminTab } from '@/lib/platform-admin/platform-admin-nav';

export const PLATFORM_ADMIN_FLOATING_TAB_BAR_HEIGHT = 60;

type PlatformAdminFloatingTabBarProps = {
  activeTab: PlatformAdminTab;
  onChange: (tab: PlatformAdminTab) => void;
};

const TABS: {
  id: PlatformAdminTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'organizations',
    label: 'Organizations',
    icon: 'business-outline',
    iconActive: 'business',
  },
  {
    id: 'impersonate',
    label: 'Impersonate',
    icon: 'person-outline',
    iconActive: 'person',
  },
];

export function PlatformAdminFloatingTabBar({
  activeTab,
  onChange,
}: PlatformAdminFloatingTabBarProps) {
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: insets.bottom + 4 }]}>
      <View style={styles.pill}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <ScalePressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              pressedScale={0.94}
              onPress={() => onChange(tab.id)}
              style={[styles.tab, active && { backgroundColor: theme.primarySoft }]}>
              <Ionicons
                name={active ? tab.iconActive : tab.icon}
                size={20}
                color={active ? theme.primary : theme.muted}
              />
              <Text
                style={[
                  styles.label,
                  { color: active ? theme.primary : theme.muted },
                  active && styles.labelActive,
                ]}>
                {tab.label}
              </Text>
            </ScalePressable>
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
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '700',
  },
});
