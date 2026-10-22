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
