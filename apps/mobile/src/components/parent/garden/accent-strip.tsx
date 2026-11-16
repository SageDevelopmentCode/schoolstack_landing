import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';

/** Visual white toy pill on the accent strip (the strip itself is the button). */
function OpenPill({ label }: { label: string }) {
  return (
    <View style={styles.pillWrap}>
      <View style={styles.pillUnderlay} />
      <View style={styles.pillFace}>
        <Text style={styles.pillLabel}>{label}</Text>
        <Ionicons name="arrow-forward" size={14} color={Garden.ink} />
      </View>
    </View>
  );
}

/**
 * Urgent strip (skill recipe): solid accent row; the whole strip is one
 * pressable with a white toy-style pill. Counts as the view's one toy button.
 */
export function GAccentStrip({
  title,
  subtitle,
  pillLabel = 'Open',
  onPress,
  accessibilityHint,
  testID,
  children,
}: {
  title: string;
  subtitle?: string | null;
  pillLabel?: string;
  onPress: () => void;
  accessibilityHint?: string;
  testID?: string;
  /** Extra content under the copy (e.g. progress pills). */
  children?: ReactNode;
}) {
  const accent = useGardenAccent();
  return (
    <GPressable
      testID={testID}
      accessibilityLabel={`${title}${subtitle ? `. ${subtitle}` : ''}. ${pillLabel}`}
      accessibilityHint={accessibilityHint}
      haptic="press"
      onPress={onPress}
      style={[styles.strip, { backgroundColor: accent.clay }]}>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {children}
      </View>
      <OpenPill label={pillLabel} />
    </GPressable>
  );
}

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16 },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  title: { fontFamily: GardenFonts.bodyExtra, fontSize: 17, lineHeight: 22, color: Garden.white },
  subtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.85)',
  },
  pillWrap: { paddingBottom: 3 },
  pillUnderlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 3,
    borderRadius: 999,
    backgroundColor: Garden.ink,
  },
  pillFace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Garden.ink,
    backgroundColor: Garden.white,
  },
  pillLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
});
