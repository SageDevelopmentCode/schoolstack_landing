import { StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';

type StatusBadgeProps = {
  label: string;
  colors: {
    backgroundColor: string;
    color: string;
  };
  style?: ViewStyle;
};

export function StatusBadge({ label, colors, style }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: colors.backgroundColor }, style]}>
      <ThemedText type="smallBold" style={[styles.label, { color: colors.color }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
  },
});
