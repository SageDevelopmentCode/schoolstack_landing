export type SupplyItemType = 'consumable' | 'reusable' | 'both';
export type SupplyUsageTiming = 'year_round' | 'specific_months';

export type CoopSupplyEstimatedPrice =
  | { mode: 'unset' }
  | { mode: 'free' }
  | { mode: 'single'; cents: number }
  | { mode: 'range'; minCents: number; maxCents: number };

export type CoopSupplyListItem = {
  id: string;
  name: string;
  itemType: SupplyItemType;
  usageTiming: SupplyUsageTiming;
  months: string[];
  colorId: string | null;
  assignedFamilyIds: string[];
  whereToBuy: string;
  quantity: number;
  quantityLabel: string;
  estimatedPrice: CoopSupplyEstimatedPrice;
  updatedAt?: string;
};

export type CoopSupplyColorLegendEntry = {
  id: string;
  hex: string;
  label: string;
};

export const SUPPLY_ITEM_TYPE_OPTIONS: ReadonlyArray<{
  value: SupplyItemType;
  label: string;
}> = [
  { value: 'consumable', label: 'Consumable' },
  { value: 'reusable', label: 'Reusable (year-round)' },
  { value: 'both', label: 'Both' },
];

export const COOP_SUPPLY_COLOR_PALETTE: ReadonlyArray<{
  id: string;
  label: string;
  hex: string;
}> = [
  { id: 'sage', label: 'Sage', hex: '#5B8A72' },
  { id: 'clay', label: 'Clay', hex: '#C4845C' },
  { id: 'sky', label: 'Sky', hex: '#5A9BB5' },
  { id: 'lavender', label: 'Lavender', hex: '#8B7BA8' },
  { id: 'rose', label: 'Rose', hex: '#C47B8B' },
  { id: 'gold', label: 'Gold', hex: '#C9A227' },
  { id: 'slate', label: 'Slate', hex: '#6B7B8C' },
  { id: 'forest', label: 'Forest', hex: '#3D6B4F' },
];

export function defaultCoopSupplyColorLegend(): CoopSupplyColorLegendEntry[] {
  return COOP_SUPPLY_COLOR_PALETTE.map((swatch) => ({
    id: swatch.id,
    hex: swatch.hex,
    label: swatch.label,
  }));
}

export function newCoopSupplyListItem(): CoopSupplyListItem {
  return {
    id: crypto.randomUUID(),
    name: '',
    itemType: 'consumable',
    usageTiming: 'year_round',
    months: [],
    colorId: null,
    assignedFamilyIds: [],
    whereToBuy: '',
    quantity: 1,
    quantityLabel: '',
    estimatedPrice: { mode: 'unset' },
  };
}

export function supplyItemDisplayName(item: CoopSupplyListItem): string {
  const trimmed = item.name.trim();
  return trimmed || 'Untitled item';
}

export function supplyItemTypeLabel(type: SupplyItemType): string {
  return SUPPLY_ITEM_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function formatSupplyQuantity(item: CoopSupplyListItem): string {
  if (item.quantityLabel.trim()) return item.quantityLabel.trim();
  return String(item.quantity);
}
