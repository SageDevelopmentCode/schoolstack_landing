import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';

import type { ParentCalendarViewMode } from './use-parent-calendar-view';

type ParentCalendarViewToggleProps = {
  viewMode: ParentCalendarViewMode;
  onViewModeChange: (mode: ParentCalendarViewMode) => void;
};

export function ParentCalendarViewToggle({
  viewMode,
  onViewModeChange,
}: ParentCalendarViewToggleProps) {
  const theme = useAdminTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.accentLight }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: viewMode === 'week' }}
        onPress={() => onViewModeChange('week')}
        style={[
          styles.segment,
          viewMode === 'week' && { backgroundColor: theme.surface },
        ]}>
        <ThemedText
          type="smallBold"
          style={{ color: viewMode === 'week' ? theme.textPrimary : theme.textTertiary }}>
          Week
        </ThemedText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: viewMode === 'month' }}
        onPress={() => onViewModeChange('month')}
        style={[
          styles.segment,
          viewMode === 'month' && { backgroundColor: theme.surface },
        ]}>
        <ThemedText
          type="smallBold"
          style={{ color: viewMode === 'month' ? theme.textPrimary : theme.textTertiary }}>
          Month
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 3,
    gap: 2,
  },
  segment: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
