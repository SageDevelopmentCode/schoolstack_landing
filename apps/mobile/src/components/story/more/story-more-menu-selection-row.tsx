import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export type StoryMoreMenuSelectionRowProps = {
  icon: ReactNode;
  label: string;
  subtitle?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
  isFirst?: boolean;
  accessibilityLabel?: string;
};

export function StoryMoreMenuSelectionRow({
  icon,
  label,
  subtitle,
  selected = false,
  disabled = false,
  onPress,
  isFirst = false,
  accessibilityLabel,
}: StoryMoreMenuSelectionRowProps) {
  const theme = useParentTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isFirst && styles.rowBordered,
        selected && { backgroundColor: theme.primarySoft },
        pressed && !disabled && styles.pressed,
      ]}>
      {selected ? (
        <Ionicons name="checkmark" size={18} color={theme.primary} style={styles.checkmark} />
      ) : (
        <View style={styles.checkmarkSpacer} />
      )}
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: selected ? theme.primary : theme.ink }]} numberOfLines={2}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.muted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: 8,
  },
  rowBordered: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7EBE2',
  },
  pressed: {
    opacity: 0.85,
  },
  checkmark: {
    width: 18,
  },
  checkmarkSpacer: {
    width: 18,
  },
  iconWrap: {
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
