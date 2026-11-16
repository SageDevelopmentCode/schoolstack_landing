import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';

export type ReadOnlyFieldVariant = 'default' | 'consent' | 'signature' | 'upload';

type ReadOnlyFieldRowProps = {
  label: string;
  value: string;
  variant?: ReadOnlyFieldVariant;
};

/**
 * One submitted answer (label + value box), Garden styled. Used inside the
 * application step, checklist item and payment sheets.
 */
export function ReadOnlyFieldRow({ label, value, variant = 'default' }: ReadOnlyFieldRowProps) {
  const accent = useGardenAccent();
  const box =
    variant === 'consent'
      ? { backgroundColor: Garden.mint, borderColor: Garden.forest }
      : variant === 'signature'
        ? { backgroundColor: accent.wash, borderColor: accent.clay }
        : variant === 'upload'
          ? { backgroundColor: Garden.sky, borderColor: Garden.ink12 }
          : { backgroundColor: Garden.white, borderColor: Garden.ink12 };

  return (
    <View style={styles.container} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.valueBox, box, variant !== 'default' && styles.highlightedBox]}>
        <Text
          selectable
          style={[
            styles.value,
            variant === 'consent' || variant === 'signature' ? styles.valueStrong : null,
            variant === 'signature' ? { color: accent.clayDeep, fontSize: 17 } : null,
          ]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Garden.soft,
  },
  valueBox: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  highlightedBox: { borderWidth: 2 },
  value: { fontFamily: GardenFonts.bodySemi, fontSize: 15, lineHeight: 21, color: Garden.ink },
  valueStrong: { fontFamily: GardenFonts.bodyExtra },
});
