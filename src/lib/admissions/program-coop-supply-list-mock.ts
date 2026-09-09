import type { CSSProperties } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { newAdmissionsId } from "./application-form-schema";

export type SupplyItemType = "consumable" | "reusable" | "both";
export type SupplyUsageTiming = "year_round" | "specific_months";

export type CoopSupplyEstimatedPrice =
  | { mode: "unset" }
  | { mode: "free" }
  | { mode: "single"; cents: number }
  | { mode: "range"; minCents: number; maxCents: number };

export type CoopSupplyListItem = {
  id: string;
  name: string;
  itemType: SupplyItemType;
  usageTiming: SupplyUsageTiming;
  months: string[];
  colorId: string | null;
  assignedFamilies: string[];
  whereToBuy: string;
  quantity: number;
  quantityLabel: string;
  estimatedPrice: CoopSupplyEstimatedPrice;
};

export type CoopSupplyColorLegendEntry = {
  id: string;
  hex: string;
  label: string;
};

export type CoopSupplyColorOption = {
  id: string;
  label: string;
  hex: string;
};

export const COOP_SUPPLY_COLOR_PALETTE: ReadonlyArray<CoopSupplyColorOption> = [
  { id: "sage", label: "Sage", hex: "#5B8A72" },
  { id: "clay", label: "Clay", hex: "#C4845C" },
  { id: "sky", label: "Sky", hex: "#5A9BB5" },
  { id: "lavender", label: "Lavender", hex: "#8B7BA8" },
  { id: "rose", label: "Rose", hex: "#C47B8B" },
  { id: "gold", label: "Gold", hex: "#C9A227" },
  { id: "slate", label: "Slate", hex: "#6B7B8C" },
  { id: "forest", label: "Forest", hex: "#3D6B4F" },
];

export function defaultCoopSupplyColorLegend(): CoopSupplyColorLegendEntry[] {
  return COOP_SUPPLY_COLOR_PALETTE.map((swatch) => ({
    id: swatch.id,
    hex: swatch.hex,
    label: swatch.label,
  }));
}

/** @deprecated Use defaultCoopSupplyColorLegend() — kept for reference/tests */
export const MOCK_COOP_SUPPLY_COLOR_LEGEND: CoopSupplyColorLegendEntry[] =
  defaultCoopSupplyColorLegend();

export const COOP_SUPPLY_MONTH_OPTIONS = [
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
] as const;

export type CoopSupplyMonth = (typeof COOP_SUPPLY_MONTH_OPTIONS)[number];

export const COOP_SUPPLY_MAX_ASSIGNED_FAMILIES = 5;

export const MOCK_COOP_PARENTS: ReadonlyArray<{ id: string; name: string }> = [
  { id: "parent-sarah", name: "Sarah Mitchell" },
  { id: "parent-chen", name: "James & Lisa Chen" },
  { id: "parent-rivera", name: "Maria Rivera" },
  { id: "parent-thompson", name: "David Thompson" },
  { id: "parent-patel", name: "Anita & Raj Patel" },
];

export const SUPPLY_ITEM_TYPE_OPTIONS: ReadonlyArray<{
  value: SupplyItemType;
  label: string;
}> = [
  { value: "consumable", label: "Consumable" },
  { value: "reusable", label: "Reusable (year-round)" },
  { value: "both", label: "Both" },
];

export const SUPPLY_USAGE_TIMING_OPTIONS: ReadonlyArray<{
  value: SupplyUsageTiming;
  label: string;
}> = [
  { value: "year_round", label: "Year-round" },
  { value: "specific_months", label: "Specific months" },
];

export function newCoopSupplyListItem(): CoopSupplyListItem {
  return {
    id: newAdmissionsId(),
    name: "",
    itemType: "consumable",
    usageTiming: "year_round",
    months: [],
    colorId: null,
    assignedFamilies: [],
    whereToBuy: "",
    quantity: 1,
    quantityLabel: "",
    estimatedPrice: { mode: "unset" },
  };
}

export const MOCK_COOP_SUPPLY_ITEMS: CoopSupplyListItem[] = [
  {
    id: "supply-glue-sticks",
    name: "Glue sticks (24-pack)",
    itemType: "consumable",
    usageTiming: "year_round",
    months: [],
    colorId: "sage",
    assignedFamilies: ["Sarah Mitchell"],
    whereToBuy: "Target or Amazon",
    quantity: 2,
    quantityLabel: "packs",
    estimatedPrice: { mode: "single", cents: 899 },
  },
  {
    id: "supply-paper-towels",
    name: "Paper towels (6 rolls)",
    itemType: "consumable",
    usageTiming: "specific_months",
    months: ["Sep", "Jan"],
    colorId: "clay",
    assignedFamilies: ["James & Lisa Chen"],
    whereToBuy: "Costco",
    quantity: 1,
    quantityLabel: "rolls",
    estimatedPrice: { mode: "range", minCents: 1000, maxCents: 1500 },
  },
  {
    id: "supply-dry-erase",
    name: "Dry-erase markers (assorted)",
    itemType: "both",
    usageTiming: "year_round",
    months: [],
    colorId: null,
    assignedFamilies: [],
    whereToBuy: "Staples",
    quantity: 3,
    quantityLabel: "sets",
    estimatedPrice: { mode: "single", cents: 1299 },
  },
  {
    id: "supply-scissors",
    name: "Child-safe scissors (set of 6)",
    itemType: "reusable",
    usageTiming: "year_round",
    months: [],
    colorId: "lavender",
    assignedFamilies: ["Maria Rivera", "David Thompson"],
    whereToBuy: "Amazon",
    quantity: 1,
    quantityLabel: "set",
    estimatedPrice: { mode: "single", cents: 1599 },
  },
  {
    id: "supply-tissues",
    name: "Facial tissues (3 boxes)",
    itemType: "consumable",
    usageTiming: "specific_months",
    months: ["Oct", "Nov", "Feb", "Mar"],
    colorId: "rose",
    assignedFamilies: ["David Thompson"],
    whereToBuy: "Walmart",
    quantity: 1,
    quantityLabel: "boxes",
    estimatedPrice: { mode: "free" },
  },
];

export function formatSupplyPriceCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function parseDollarAmount(value: string): number | null {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

export function formatSupplyQuantity(item: CoopSupplyListItem): string {
  const label = item.quantityLabel.trim();
  if (!label) return String(item.quantity);
  return `${item.quantity} ${label}`;
}

export function formatSupplyEstimatedPrice(price: CoopSupplyEstimatedPrice): string {
  switch (price.mode) {
    case "unset":
      return "—";
    case "free":
      return "Free";
    case "single":
      return formatSupplyPriceCents(price.cents);
    case "range":
      return `${formatSupplyPriceCents(price.minCents)}–${formatSupplyPriceCents(price.maxCents).slice(1)}`;
  }
}

function formatCentsAsDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function supplyPriceSingleDollars(price: CoopSupplyEstimatedPrice): string {
  if (price.mode === "single") {
    return formatCentsAsDollars(price.cents);
  }
  return "";
}

export function supplyPriceRangeDollars(price: CoopSupplyEstimatedPrice): {
  min: string;
  max: string;
} {
  if (price.mode === "range") {
    if (price.minCents === 0 && price.maxCents === 0) {
      return { min: "", max: "" };
    }
    return {
      min: formatCentsAsDollars(price.minCents),
      max: formatCentsAsDollars(price.maxCents),
    };
  }
  return { min: "", max: "" };
}

export function buildSupplySinglePrice(dollars: string): CoopSupplyEstimatedPrice {
  const trimmed = dollars.trim();
  if (!trimmed) return { mode: "unset" };
  const cents = parseDollarAmount(trimmed);
  if (cents === null) return { mode: "unset" };
  return { mode: "single", cents };
}

export function buildSupplyRangePrice(
  minDollars: string,
  maxDollars: string,
): CoopSupplyEstimatedPrice {
  const minTrimmed = minDollars.trim();
  const maxTrimmed = maxDollars.trim();
  const minCents = minTrimmed ? parseDollarAmount(minTrimmed) : null;
  const maxCents = maxTrimmed ? parseDollarAmount(maxTrimmed) : null;

  if (minCents === null && maxCents === null) {
    return { mode: "range", minCents: 0, maxCents: 0 };
  }
  if (minCents !== null && maxCents === null) {
    return { mode: "range", minCents, maxCents: minCents };
  }
  if (minCents === null && maxCents !== null) {
    return { mode: "range", minCents: maxCents, maxCents };
  }
  if (minCents !== null && maxCents !== null) {
    return { mode: "range", minCents, maxCents: Math.max(minCents, maxCents) };
  }
  return { mode: "range", minCents: 0, maxCents: 0 };
}

function supplyEstimatedPriceCentsForSummary(price: CoopSupplyEstimatedPrice): number {
  switch (price.mode) {
    case "single":
      return price.cents;
    case "range":
      return price.minCents;
    case "free":
    case "unset":
      return 0;
  }
}

function areCoopSupplyEstimatedPricesEqual(
  a: CoopSupplyEstimatedPrice,
  b: CoopSupplyEstimatedPrice,
): boolean {
  if (a.mode !== b.mode) return false;
  switch (a.mode) {
    case "unset":
    case "free":
      return true;
    case "single":
      return b.mode === "single" && a.cents === b.cents;
    case "range":
      return (
        b.mode === "range" &&
        a.minCents === b.minCents &&
        a.maxCents === b.maxCents
      );
  }
}

export function computeSupplyListSummary(items: CoopSupplyListItem[]) {
  const assignedCount = items.filter((item) => item.assignedFamilies.length > 0).length;
  const totalCents = items.reduce(
    (sum, item) =>
      sum + supplyEstimatedPriceCentsForSummary(item.estimatedPrice) * item.quantity,
    0,
  );
  return {
    itemCount: items.length,
    assignedCount,
    totalCents,
  };
}

export function areCoopSupplyItemsEqual(
  a: CoopSupplyListItem,
  b: CoopSupplyListItem,
): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.itemType === b.itemType &&
    a.usageTiming === b.usageTiming &&
    a.months.length === b.months.length &&
    a.months.every((month, index) => month === b.months[index]) &&
    a.colorId === b.colorId &&
    a.assignedFamilies.length === b.assignedFamilies.length &&
    a.assignedFamilies.every((family, index) => family === b.assignedFamilies[index]) &&
    a.whereToBuy === b.whereToBuy &&
    a.quantity === b.quantity &&
    a.quantityLabel === b.quantityLabel &&
    areCoopSupplyEstimatedPricesEqual(a.estimatedPrice, b.estimatedPrice)
  );
}

export function supplyItemDisplayName(item: CoopSupplyListItem): string {
  const trimmed = item.name.trim();
  return trimmed || "Untitled item";
}

export function supplyItemTypeLabel(type: SupplyItemType): string {
  return SUPPLY_ITEM_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function supplyItemTypeChipTone(
  type: SupplyItemType,
): "info" | "success" | "purple" {
  switch (type) {
    case "consumable":
      return "info";
    case "reusable":
      return "success";
    case "both":
      return "purple";
  }
}

export function supplyUsageTimingLabel(item: CoopSupplyListItem): string {
  if (item.usageTiming === "year_round") {
    return "Year-round";
  }
  if (item.months.length === 0) {
    return "Specific months";
  }
  return item.months.join(", ");
}

export function normalizeSupplyFamilyName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function canAddSupplyAssignedFamily(
  families: ReadonlyArray<string>,
  name: string,
): boolean {
  const normalized = normalizeSupplyFamilyName(name);
  if (!normalized) return false;
  if (families.length >= COOP_SUPPLY_MAX_ASSIGNED_FAMILIES) return false;
  const lower = normalized.toLowerCase();
  return !families.some((family) => family.toLowerCase() === lower);
}

export function formatSupplyAssignedFamilies(families: ReadonlyArray<string>): string {
  if (families.length === 0) return "Unassigned";
  return families.join(", ");
}

export function getSupplyColorLegendEntry(
  legend: ReadonlyArray<CoopSupplyColorLegendEntry>,
  colorId: string | null,
): CoopSupplyColorLegendEntry | null {
  if (!colorId) return null;
  return legend.find((entry) => entry.id === colorId) ?? null;
}

export function areCoopSupplyColorLegendsEqual(
  a: ReadonlyArray<CoopSupplyColorLegendEntry>,
  b: ReadonlyArray<CoopSupplyColorLegendEntry>,
): boolean {
  if (a.length !== b.length) return false;
  return a.every((entry, index) => {
    const other = b[index];
    return (
      entry.id === other.id &&
      entry.hex === other.hex &&
      entry.label === other.label
    );
  });
}

export function supplyColorLegendDisplayLabel(entry: CoopSupplyColorLegendEntry): string {
  const trimmed = entry.label.trim();
  return trimmed || "Unlabeled";
}

function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((value) => Number.isNaN(value))) return null;
  return { r, g, b };
}

export function mixColorWithSurface(
  colorHex: string,
  surfaceHex: string,
  alpha: number,
): string {
  const color = parseHexColor(colorHex);
  const surface = parseHexColor(surfaceHex);
  if (!color || !surface) return surfaceHex;

  const clampedAlpha = Math.min(Math.max(alpha, 0), 1);
  const r = Math.round(color.r * clampedAlpha + surface.r * (1 - clampedAlpha));
  const g = Math.round(color.g * clampedAlpha + surface.g * (1 - clampedAlpha));
  const b = Math.round(color.b * clampedAlpha + surface.b * (1 - clampedAlpha));
  return `rgb(${r}, ${g}, ${b})`;
}

export function supplyListRowStyle(
  C: AdminThemeTokens,
  {
    colorHex,
    isSelected,
    isHovered,
  }: {
    colorHex: string | null;
    isSelected: boolean;
    isHovered: boolean;
  },
): Pick<CSSProperties, "backgroundColor" | "borderLeft"> {
  const tintedBackground = colorHex
    ? mixColorWithSurface(colorHex, C.surface, 0.12)
    : C.surface;

  if (isSelected) {
    return {
      backgroundColor: C.accentLight,
      borderLeft: `3px solid ${C.accent}`,
    };
  }

  if (isHovered) {
    return {
      backgroundColor: colorHex
        ? mixColorWithSurface(colorHex, C.elevated, 0.14)
        : C.elevated,
      borderLeft: "3px solid transparent",
    };
  }

  return {
    backgroundColor: tintedBackground,
    borderLeft: "3px solid transparent",
  };
}
