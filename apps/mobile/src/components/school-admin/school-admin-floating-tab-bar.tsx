import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';
import { Radius, Spacing } from '@/constants/theme';

export type SchoolAdminTab = 'dashboard' | 'admissions';

type SchoolAdminFloatingTabBarProps = {
  activeTab: SchoolAdminTab;
  onChange: (tab: SchoolAdminTab) => void;
};

const TABS: {
  id: SchoolAdminTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline', iconActive: 'grid' },
  {
    id: 'admissions',
    label: 'Admissions',
    icon: 'document-text-outline',
    iconActive: 'document-text',
  },
];

export function SchoolAdminFloatingTabBar({ activeTab, onChange }: SchoolAdminFloatingTabBarProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: insets.bottom + 8 }]}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
          adminCardShadow(theme),
        ]}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
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
              <Ionicons
                name={active ? tab.iconActive : tab.icon}
                size={16}
                color={active ? theme.accent : theme.textTertiary}
              />
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
  },
  pill: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 360,
    borderRadius: 22,
    borderWidth: 1,
    padding: 2,
    gap: 2,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.pill,
  },
  tabPressed: {
    opacity: 0.85,
  },
});
