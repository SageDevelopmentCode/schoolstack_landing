import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';

export type ReadOnlyFieldVariant = 'default' | 'consent' | 'signature' | 'upload';

type ReadOnlyFieldRowProps = {
  label: string;
  value: string;
  variant?: ReadOnlyFieldVariant;
};

function variantStyles(
  variant: ReadOnlyFieldVariant,
  theme: ReturnType<typeof useAdminTheme>,
): { backgroundColor: string; borderColor: string; valueColor: string; valueType: 'small' | 'smallBold' } {
  switch (variant) {
    case 'consent':
      return {
        backgroundColor: theme.successBg,
        borderColor: theme.success,
        valueColor: theme.textPrimary,
        valueType: 'smallBold',
      };
    case 'signature':
      return {
        backgroundColor: theme.accentLight,
        borderColor: theme.accent,
        valueColor: theme.accentDark,
        valueType: 'smallBold',
      };
    case 'upload':
      return {
        backgroundColor: theme.infoBg,
        borderColor: theme.border,
        valueColor: theme.textPrimary,
        valueType: 'small',
      };
    default:
      return {
        backgroundColor: theme.elevated,
        borderColor: theme.border,
        valueColor: theme.textPrimary,
        valueType: 'small',
      };
  }
}

export function ReadOnlyFieldRow({
  label,
  value,
  variant = 'default',
}: ReadOnlyFieldRowProps) {
  const theme = useAdminTheme();
  const colors = variantStyles(variant, theme);

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" style={{ color: theme.textTertiary, textTransform: 'uppercase' }}>
        {label}
      </ThemedText>
      <View
        style={[
          styles.valueBox,
          {
            backgroundColor: colors.backgroundColor,
            borderColor: colors.borderColor,
          },
          variant !== 'default' && styles.highlightedBox,
        ]}>
        <ThemedText
          type={colors.valueType}
          style={{
            color: colors.valueColor,
            fontSize: variant === 'signature' ? 16 : undefined,
          }}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  valueBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  highlightedBox: {
    borderWidth: 1,
  },
});
