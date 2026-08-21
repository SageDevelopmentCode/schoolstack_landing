import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius } from '@/constants/theme';

export type SchoolAdminTab = 'dashboard' | 'admissions' | 'students';

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
  {
    id: 'students',
    label: 'Students',
    icon: 'people-outline',
    iconActive: 'people',
  },
];

export function SchoolAdminFloatingTabBar({ activeTab, onChange }: SchoolAdminFloatingTabBarProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: insets.bottom + 8 }]}>
      <View style={styles.pill}>
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
                size={20}
                color={active ? theme.accent : theme.textTertiary}
              />
              <ThemedText
                type="smallBold"
                style={{
                  color: active ? theme.accent : theme.textTertiary,
                  fontSize: 10,
                  lineHeight: 12,
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
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: Radius.pill,
  },
  tabPressed: {
    opacity: 0.85,
  },
});
