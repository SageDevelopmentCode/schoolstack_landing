import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { CoopSignedUpChip } from '@/components/parent/coop/garden/coop-garden-ui';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GChip, GKicker, GOutlineButton, GToyButton } from '@/components/parent/garden/ui';
import {
  COOP_SUPPLY_MAX_ASSIGNED_FAMILIES,
  formatSupplyAssignedFamilies,
  isSupplyFamilyAssigned,
  isSupplyItemFull,
  supplyItemDisplayName,
  supplyItemTypeChipTone,
  supplyItemTypeLabel,
  supplyUsageTimingLabel,
} from '@/lib/parent/coop/supply-list-helpers';
import type { ParentCoopSupplyListItem } from '@/lib/parent/parent-portal-api';

type IoniconName = keyof typeof Ionicons.glyphMap;

/**
 * Supply item details (web drawer parity): when, quantity, where to buy,
 * highlight and who signed up, with the one sign-up action in the footer.
 */
export function SupplyItemSheet({
  item,
  visible,
  onClose,
  highlight,
  currentFamilyId,
  familyNameMap,
  pending,
  readOnly,
  onToggle,
}: {
  item: ParentCoopSupplyListItem | null;
  visible: boolean;
  onClose: () => void;
  highlight: { hex: string; label: string } | null;
  currentFamilyId: string;
  familyNameMap: Record<string, string>;
  pending: boolean;
  readOnly: boolean;
  onToggle: (item: ParentCoopSupplyListItem) => void;
}) {
  if (!item) return null;
  const name = supplyItemDisplayName(item);
  const signedUp = isSupplyFamilyAssigned(item.assignedFamilyIds, currentFamilyId);
  const full = isSupplyItemFull(item);
  const count = item.assignedFamilyIds.length;

  const footer = readOnly ? (
    <GInlineBanner tone="info" title="Preview mode" description="Sign-ups are turned off here." />
  ) : signedUp ? (
    <GOutlineButton
      label={pending ? 'Removing…' : 'Remove me'}
      icon="close"
      accessibilityLabel={`Remove your sign-up for ${name}`}
      onPress={() => {
        if (!pending) onToggle(item);
      }}
      style={styles.footerButton}
    />
  ) : full ? (
    <GInlineBanner
      tone="info"
      title="This item is full"
      description={`${COOP_SUPPLY_MAX_ASSIGNED_FAMILIES} families have already signed up.`}
    />
  ) : (
    <GToyButton
      label="Sign up to bring this"
      icon="checkmark"
      size="md"
      fullWidth
      loading={pending}
      accessibilityLabel={`Sign up for ${name}`}
      onPress={() => onToggle(item)}
    />
  );

  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      title={name}
      subtitle={signedUp ? "Your family is bringing this." : undefined}
      headerAside={
        signedUp ? (
          <CoopSignedUpChip label="Signed up" />
        ) : (
          <GChip tone={supplyItemTypeChipTone(item.itemType)} label={supplyItemTypeLabel(item.itemType)} />
        )
      }
      footer={footer}>
      <View style={styles.fields}>
        <DetailRow icon="calendar-outline" label="When" value={supplyUsageTimingLabel(item)} />
        {item.quantityLabel?.trim() ? (
          <DetailRow icon="cube-outline" label="Quantity" value={item.quantityLabel.trim()} />
        ) : null}
        {item.whereToBuy?.trim() ? (
          <DetailRow icon="storefront-outline" label="Where to buy" value={item.whereToBuy.trim()} />
        ) : null}
        {signedUp ? (
          <DetailRow icon="pricetag-outline" label="Type" value={supplyItemTypeLabel(item.itemType)} />
        ) : null}
        {highlight ? (
          <DetailRow
            icon="color-palette-outline"
            label="Highlight"
            value={highlight.label}
            swatch={highlight.hex}
          />
        ) : null}
        <DetailRow
          icon="people-outline"
          label={`Signed-up families · ${count} of ${COOP_SUPPLY_MAX_ASSIGNED_FAMILIES}`}
          value={formatSupplyAssignedFamilies(item.assignedFamilyIds, familyNameMap)}
        />
      </View>
    </GSheet>
  );
}

function DetailRow({
  icon,
  label,
  value,
  swatch,
}: {
  icon: IoniconName;
  label: string;
  value: string;
  swatch?: string;
}) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={Garden.ink} />
      </View>
      <View style={styles.rowCopy}>
        <GKicker>{label}</GKicker>
        <View style={styles.valueRow}>
          {swatch ? <View style={[styles.swatch, { backgroundColor: swatch }]} /> : null}
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Garden.ink06,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: Garden.ink,
    backgroundColor: Garden.butter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: { flex: 1, gap: 3 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: Garden.ink },
  value: {
    flex: 1,
    fontFamily: GardenFonts.bodyBold,
    fontSize: 15,
    lineHeight: 21,
    color: Garden.ink,
  },
  footerButton: { alignSelf: 'stretch', justifyContent: 'center' },
});
