import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScalePressable } from '@/components/scale-pressable';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius } from '@/constants/theme';
import type { TeacherTab } from '@/lib/teacher/teacher-nav';

export const TEACHER_FLOATING_TAB_BAR_HEIGHT = 60;

type TeacherFloatingTabBarProps = {
  activeTab: TeacherTab;
  onChange: (tab: TeacherTab) => void;
};

const TABS: {
  id: TeacherTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  {
    id: 'my-students',
    label: 'My Students',
    icon: 'people-outline',
    iconActive: 'people',
  },
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

export function TeacherFloatingTabBar({ activeTab, onChange }: TeacherFloatingTabBarProps) {
  const theme = useAdminTheme();
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
              style={[styles.tab, active && { backgroundColor: theme.accentLight }]}>
              <Ionicons
                name={active ? tab.iconActive : tab.icon}
                size={20}
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
});
