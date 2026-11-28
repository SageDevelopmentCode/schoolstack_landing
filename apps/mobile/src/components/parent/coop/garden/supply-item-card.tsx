import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  CoopActionPill,
  CoopSignedUpChip,
} from '@/components/parent/coop/garden/coop-garden-ui';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GChip, GLink, GPressable } from '@/components/parent/garden/ui';
import { calmEnter, staggerDelay } from '@/lib/motion/portal-motion';
import {
  formatSupplyAssignedFamilies,
  isSupplyFamilyAssigned,
  isSupplyItemFull,
  supplyItemDisplayName,
  supplyItemTypeChipTone,
  supplyItemTypeLabel,
  supplyUsageTimingLabel,
} from '@/lib/parent/coop/supply-list-helpers';
import type { ParentCoopSupplyListItem } from '@/lib/parent/parent-portal-api';

export function supplyMetaLine(item: ParentCoopSupplyListItem): string {
  return [supplyUsageTimingLabel(item), item.quantityLabel?.trim(), item.whereToBuy?.trim()]
    .filter(Boolean)
    .join(' · ');
}

/**
 * One supply item: the body opens the detail sheet; the footer holds the row
 * action (outline Sign up, or the signed-up chip with Withdraw, or Full).
 */
export const SupplyItemCard = memo(function SupplyItemCard({
  item,
  index,
  highlight,
  currentFamilyId,
  familyNameMap,
  pendingId,
  onOpen,
  onToggle,
}: {
  item: ParentCoopSupplyListItem;
  index: number;
  highlight: { hex: string; label: string } | null;
  currentFamilyId: string;
  familyNameMap: Record<string, string>;
  pendingId: string | null;
  onOpen: (item: ParentCoopSupplyListItem) => void;
  onToggle: (item: ParentCoopSupplyListItem) => void;
}) {
  const name = supplyItemDisplayName(item);
  const signedUp = isSupplyFamilyAssigned(item.assignedFamilyIds, currentFamilyId);
  const full = isSupplyItemFull(item);
  const pending = pendingId === item.id;
  const meta = supplyMetaLine(item);
  const families = formatSupplyAssignedFamilies(item.assignedFamilyIds, familyNameMap);
  const status = signedUp ? "you're signed up" : full ? 'full' : item.assignedFamilyIds.length ? families : 'open';

  return (
    <Animated.View
      entering={index < 6 ? calmEnter({ delay: staggerDelay(index) }) : undefined}
      style={[styles.card, signedUp && styles.cardMine]}
      testID={`parent-coop-supply-item-${item.id}`}>
      <GPressable
        accessibilityLabel={`${name}, ${supplyItemTypeLabel(item.itemType)}, ${status}`}
        accessibilityHint="Opens item details"
        pressedScale={0.99}
        onPress={() => onOpen(item)}
        style={styles.body}>
        <View style={styles.titleRow}>
          {highlight ? (
            <View
              style={[styles.swatch, { backgroundColor: highlight.hex }]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
          ) : null}
          <Text style={styles.title} numberOfLines={2}>
            {name}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={Garden.ink25} />
        </View>
        <View style={styles.chips}>
          <GChip tone={supplyItemTypeChipTone(item.itemType)} label={supplyItemTypeLabel(item.itemType)} />
        </View>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        <Text style={styles.meta} numberOfLines={2}>
          <Text style={styles.metaLabel}>Signed up: </Text>
          {families}
        </Text>
      </GPressable>

      <View style={styles.footer}>
        {signedUp ? (
          <>
            <CoopSignedUpChip />
            <GLink
              label={pending ? 'Withdrawing…' : 'Withdraw'}
              icon={null}
              accessibilityLabel={`Withdraw from ${name}`}
              onPress={() => onToggle(item)}
              style={styles.withdraw}
            />
          </>
        ) : full ? (
          <GChip tone="neutral" label="Full" />
        ) : (
          <CoopActionPill
            label="Sign up"
            accessibilityLabel={`Sign up for ${name}`}
            loading={pending}
            disabled={Boolean(pendingId) && !pending}
            onPress={() => onToggle(item)}
          />
        )}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    overflow: 'hidden',
  },
  cardMine: { borderColor: 'rgba(46,74,60,0.28)' },
  body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Garden.ink,
  },
  title: {
    flex: 1,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 17,
    lineHeight: 22,
    color: Garden.ink,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  meta: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft },
  metaLabel: { fontFamily: GardenFonts.bodyExtra, color: Garden.ink },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 2,
  },
  withdraw: { minHeight: 32 },
});
