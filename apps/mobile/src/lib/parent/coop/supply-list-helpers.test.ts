import {
  computeSupplyListSummary,
  supplyItemDisplayName,
  supplyUsageTimingLabel,
} from '@/lib/parent/coop/supply-list-helpers';
import type { ParentCoopSupplyListItem } from '@/lib/parent/parent-portal-api';

function item(partial: Partial<ParentCoopSupplyListItem> = {}): ParentCoopSupplyListItem {
  return {
    id: '1',
    name: 'Paper towels',
    quantityLabel: '2 rolls',
    whereToBuy: 'Costco',
    itemType: 'consumable',
    usageTiming: 'year_round',
    months: [],
    colorId: null,
    assignedFamilyIds: [],
    ...partial,
  };
}

describe('supply-list-helpers', () => {
  it('computeSupplyListSummary counts assigned and open items', () => {
    const summary = computeSupplyListSummary([
      item(),
      item({ id: '2', assignedFamilyIds: ['fam-1'] }),
    ]);
    expect(summary).toEqual({ itemCount: 2, assignedCount: 1, openCount: 1 });
  });

  it('supplyItemDisplayName falls back when name is blank', () => {
    expect(supplyItemDisplayName(item({ name: '   ' }))).toBe('Untitled item');
  });

  it('supplyUsageTimingLabel joins months when set', () => {
    expect(
      supplyUsageTimingLabel(item({ usageTiming: 'specific_months', months: ['Sep', 'Oct'] })),
    ).toBe('Sep, Oct');
  });

  it('supplyUsageTimingLabel falls back when specific_months has no months', () => {
    expect(supplyUsageTimingLabel(item({ usageTiming: 'specific_months', months: [] }))).toBe(
      'Specific months',
    );
  });
});
