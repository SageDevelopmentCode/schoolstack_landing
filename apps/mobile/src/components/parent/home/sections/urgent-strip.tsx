import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { ParentHomeAttentionItem } from '@/components/parent/home/parent-home-attention';
import { openAttentionItem, type ParentHomeCtx } from '@/components/parent/home/parent-home-ctx';
import { GPressable } from '@/components/parent/garden/ui';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';

/** Visual "Open" pill on the accent strip (the strip itself is the button). */
function OpenPill() {
  return (
    <View style={styles.pillWrap}>
      <View style={styles.pillUnderlay} />
      <View style={styles.pillFace}>
        <Text style={styles.pillLabel}>Open</Text>
        <Ionicons name="arrow-forward" size={14} color={Garden.ink} />
      </View>
    </View>
  );
}

/** The urgent first to-do as a solid accent strip; one tap target with the title in its name. */
export function UrgentStrip({ ctx, item }: { ctx: ParentHomeCtx; item: ParentHomeAttentionItem }) {
  const accent = useGardenAccent();
  return (
    <GPressable
      accessibilityLabel={`${item.title}${item.subtitle ? `. ${item.subtitle}` : ''}. Open`}
      haptic="press"
      onPress={() => openAttentionItem(ctx, item)}
      style={[styles.strip, { backgroundColor: accent.clay }]}>
      <View style={styles.stripCopy}>
        <Text style={styles.stripTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text style={styles.stripSubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
        ) : null}
      </View>
      <OpenPill />
    </GPressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
  },
  stripCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  stripTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 17,
    lineHeight: 22,
    color: Garden.white,
  },
  stripSubtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.85)',
  },
  pillWrap: {
    paddingBottom: 3,
  },
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
  pillLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.ink,
  },
});
