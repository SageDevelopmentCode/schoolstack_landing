import { Pressable, StyleSheet, Text } from 'react-native';

import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';
import type { MobileParentTheme } from '@/lib/organization-settings/parent-theme';

export type BroadcastChipVariant = 'program' | 'classroom' | 'grade';

type AdminMessagesBroadcastChipProps = {
  label: string;
  selected: boolean;
  variant: BroadcastChipVariant;
  theme: MobileParentTheme;
  onPress: () => void;
};

function chipColors(
  theme: MobileParentTheme,
  variant: BroadcastChipVariant,
  selected: boolean,
): { borderColor: string; backgroundColor: string; color: string } {
  if (!selected) {
    return {
      borderColor: theme.line,
      backgroundColor: theme.white,
      color: theme.ink,
    };
  }

  switch (variant) {
    case 'program':
      return {
        borderColor: theme.primary,
        backgroundColor: theme.primarySoft,
        color: theme.primary,
      };
    case 'classroom':
      return {
        borderColor: theme.sky,
        backgroundColor: theme.infoBg,
        color: theme.ink,
      };
    case 'grade':
      return {
        borderColor: theme.sun,
        backgroundColor: theme.warningBg,
        color: theme.ink,
      };
  }
}

export function AdminMessagesBroadcastChip({
  label,
  selected,
  variant,
  theme,
  onPress,
}: AdminMessagesBroadcastChipProps) {
  const colors = chipColors(theme, variant, selected);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: colors.borderColor,
          backgroundColor: colors.backgroundColor,
          opacity: pressed ? 0.88 : 1,
        },
      ]}>
      <Text style={[styles.label, { color: colors.color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  label: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
});
