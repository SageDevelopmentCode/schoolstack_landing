import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { ParentBillingChildView } from '@/lib/parent/parent-portal-api';
import { PARENT_BILLING_SUMMARY_TAB } from '@/lib/tuition/billing-helpers';

type ParentBillingChildPickerProps = {
  children: ParentBillingChildView[];
  activeKey: string;
  onChange: (key: string) => void;
};

export function ParentBillingChildPicker({
  children,
  activeKey,
  onChange,
}: ParentBillingChildPickerProps) {
  const theme = useAdminTheme();

  if (children.length <= 1) return null;

  const tabs = [
    { key: PARENT_BILLING_SUMMARY_TAB, label: 'Summary' },
    ...children.map((child) => ({
      key: child.childKey,
      label: child.studentName.split(/\s+/)[0] ?? child.studentName,
    })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.pill,
              {
                backgroundColor: active ? theme.accent : theme.surface,
                borderColor: active ? theme.accent : theme.border,
              },
            ]}>
            <ThemedText
              type="small"
              style={{
                color: active ? '#FFFFFF' : theme.textSecondary,
                fontWeight: active ? '600' : '400',
              }}>
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  pill: {
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
});
