import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';

export type PreAuthLinkItem = {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

type PreAuthLinkRowProps = {
  items: PreAuthLinkItem[];
};

/** Secondary sign-in routes ("Use password", "Admin login") as quiet Garden chips. */
export function PreAuthLinkRow({ items }: PreAuthLinkRowProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <GPressable
          key={item.label}
          accessibilityRole="button"
          accessibilityLabel={item.accessibilityLabel ?? item.label}
          accessibilityState={{ disabled: Boolean(item.disabled) }}
          disabled={item.disabled}
          haptic="select"
          onPress={item.onPress}
          style={[styles.chip, item.disabled && styles.chipDisabled]}>
          {item.icon ? <Ionicons name={item.icon} size={16} color={Garden.ink} /> : null}
          <Text style={styles.label}>{item.label}</Text>
        </GPressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink15,
    backgroundColor: Garden.paper,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.ink,
  },
});
