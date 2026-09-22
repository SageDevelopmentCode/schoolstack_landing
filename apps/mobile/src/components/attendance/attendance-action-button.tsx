import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts, StoryRadius } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type AttendanceActionButtonVariant = 'soft' | 'outline' | 'primary' | 'disabled';

type AttendanceActionButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant: AttendanceActionButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
};

function getColors(
  variant: AttendanceActionButtonVariant,
  theme: ReturnType<typeof useParentTheme>,
) {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: theme.primary,
        borderColor: 'transparent',
        labelColor: Story.white,
        iconColor: Story.white,
      };
    case 'outline':
      return {
        backgroundColor: Story.white,
        borderColor: Story.line,
        labelColor: theme.primary,
        iconColor: theme.primary,
      };
    case 'disabled':
      return {
        backgroundColor: Story.line,
        borderColor: 'transparent',
        labelColor: theme.muted,
        iconColor: theme.muted,
      };
    case 'soft':
    default:
      return {
        backgroundColor: theme.successBg,
        borderColor: 'transparent',
        labelColor: theme.primary,
        iconColor: theme.primary,
      };
  }
}

export function AttendanceActionButton({
  label,
  icon,
  variant,
  disabled = false,
  loading = false,
  onPress,
}: AttendanceActionButtonProps) {
  const theme = useParentTheme();
  const colors = getColors(disabled ? 'disabled' : variant, theme);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          opacity: disabled ? 0.7 : pressed ? 0.92 : 1,
        },
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Story.white : theme.primary}
        />
      ) : (
        <>
          <Ionicons name={icon} size={18} color={colors.iconColor} />
          <Text style={[styles.label, { color: colors.labelColor }]} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

type AttendanceActionRowProps = {
  saving?: boolean;
  canPickup: boolean;
  isPickedUp: boolean;
  onMarkPresent: () => void;
  onMarkAbsent: () => void;
  onRecordPickup: () => void;
};

export function AttendanceActionRow({
  saving = false,
  canPickup,
  isPickedUp,
  onMarkPresent,
  onMarkAbsent,
  onRecordPickup,
}: AttendanceActionRowProps) {
  const actionsDisabled = saving || isPickedUp;

  return (
    <View style={styles.row}>
      <AttendanceActionButton
        label="Present"
        icon="checkmark-circle-outline"
        variant="soft"
        disabled={actionsDisabled}
        loading={saving}
        onPress={onMarkPresent}
      />
      <AttendanceActionButton
        label="Absent"
        icon="close-circle-outline"
        variant="outline"
        disabled={actionsDisabled}
        onPress={onMarkAbsent}
      />
      <AttendanceActionButton
        label="Pickup"
        icon="log-out-outline"
        variant={canPickup ? 'primary' : 'disabled'}
        disabled={!canPickup || actionsDisabled}
        onPress={onRecordPickup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  button: {
    flex: 1,
    minHeight: 64,
    borderRadius: StoryRadius.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.two,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
