import type { ParentCoopSupplyListItem } from '@/lib/parent/parent-portal-api';

export const COOP_SUPPLY_MAX_ASSIGNED_FAMILIES = 5;

export type SupplyListSummary = {
  itemCount: number;
  assignedCount: number;
  openCount: number;
};

export function computeSupplyListSummary(items: ParentCoopSupplyListItem[]): SupplyListSummary {
  const assignedCount = items.filter((item) => item.assignedFamilyIds.length > 0).length;
  return {
    itemCount: items.length,
    assignedCount,
    openCount: items.filter((item) => item.assignedFamilyIds.length === 0).length,
  };
}

export function supplyItemDisplayName(item: ParentCoopSupplyListItem): string {
  const trimmed = item.name.trim();
  return trimmed || 'Untitled item';
}

export function supplyItemTypeLabel(itemType: string): string {
  switch (itemType) {
    case 'consumable':
      return 'Consumable';
    case 'reusable':
      return 'Reusable';
    case 'both':
      return 'Consumable & reusable';
    default:
      return itemType;
  }
}

export type StoryChipToneForSupply = 'info' | 'success' | 'neutral';

export function supplyItemTypeChipTone(itemType: string): StoryChipToneForSupply {
  switch (itemType) {
    case 'consumable':
      return 'info';
    case 'reusable':
      return 'success';
    case 'both':
      return 'neutral';
    default:
      return 'info';
  }
}

export function supplyUsageTimingLabel(item: ParentCoopSupplyListItem): string {
  if (item.usageTiming === 'year_round') {
    return 'Year-round';
  }
  if (item.months.length === 0) {
    return 'Specific months';
  }
  return item.months.join(', ');
}

export function formatSupplyAssignedFamilies(
  familyIds: readonly string[],
  nameMap: Record<string, string> = {},
): string {
  if (familyIds.length === 0) return 'Open';
  return familyIds.map((id) => nameMap[id] ?? 'Family').join(', ');
}

export function isSupplyFamilyAssigned(
  assignedFamilyIds: readonly string[],
  familyId: string,
): boolean {
  return familyId.length > 0 && assignedFamilyIds.includes(familyId);
}

export type MobileSupplyFilterKey = 'all' | 'available' | 'mine' | 'full';

/** Same choices (and labels) as the web parent filter, minus "Has sign-ups". */
export const MOBILE_SUPPLY_FILTER_PILLS: readonly { key: MobileSupplyFilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'mine', label: 'My sign-ups' },
  { key: 'full', label: 'Full' },
];

export function isSupplyItemFull(item: ParentCoopSupplyListItem): boolean {
  return item.assignedFamilyIds.length >= COOP_SUPPLY_MAX_ASSIGNED_FAMILIES;
}

/** Search (name, where to buy, quantity) then the sign-up filter. */
export function filterMobileSupplyItems(
  items: ParentCoopSupplyListItem[],
  {
    search,
    filterKey,
    currentFamilyId,
  }: { search: string; filterKey: MobileSupplyFilterKey; currentFamilyId: string },
): ParentCoopSupplyListItem[] {
  const query = search.trim().toLowerCase();
  return items.filter((item) => {
    if (
      query &&
      ![item.name, item.whereToBuy, item.quantityLabel].join(' ').toLowerCase().includes(query)
    ) {
      return false;
    }
    const mine = isSupplyFamilyAssigned(item.assignedFamilyIds, currentFamilyId);
    switch (filterKey) {
      case 'available':
        return !mine && !isSupplyItemFull(item);
      case 'mine':
        return mine;
      case 'full':
        return isSupplyItemFull(item);
      default:
        return true;
    }
  });
}

export function countMySupplySignups(
  items: ParentCoopSupplyListItem[],
  currentFamilyId: string,
): number {
  return items.filter((item) => isSupplyFamilyAssigned(item.assignedFamilyIds, currentFamilyId)).length;
}
