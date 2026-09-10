import {
  COOP_SUPPLY_MAX_ASSIGNED_FAMILIES,
  COOP_SUPPLY_MONTH_OPTIONS,
  isSupplyFamilyAssigned,
  SUPPLY_ITEM_TYPE_OPTIONS,
  SUPPLY_USAGE_TIMING_OPTIONS,
  type CoopSupplyColorLegendEntry,
  type CoopSupplyListItem,
  type CoopSupplyMonth,
  type SupplyItemType,
  type SupplyUsageTiming,
} from "./program-coop-supply-list-mock";

export type CoopSupplyListAssignmentFilterParent =
  | "all"
  | "available"
  | "mine"
  | "signed_up"
  | "full";

export type CoopSupplyListAssignmentFilterAdmin =
  | "all"
  | "unassigned"
  | "signed_up"
  | "full";

export type CoopSupplyListFilters = {
  search: string;
  itemType: SupplyItemType | "all";
  usageTiming: SupplyUsageTiming | "all";
  month: CoopSupplyMonth | "all";
  colorId: string | "all" | "none";
  assignment: CoopSupplyListAssignmentFilterParent | CoopSupplyListAssignmentFilterAdmin;
};

export const DEFAULT_COOP_SUPPLY_LIST_FILTERS: CoopSupplyListFilters = {
  search: "",
  itemType: "all",
  usageTiming: "all",
  month: "all",
  colorId: "all",
  assignment: "all",
};

export type CoopSupplyListFilterContext =
  | { variant: "parent"; currentFamilyId: string }
  | { variant: "admin" };

function matchesSearch(item: CoopSupplyListItem, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    item.name,
    item.whereToBuy,
    item.quantityLabel,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function matchesAssignment(
  item: CoopSupplyListItem,
  assignment: CoopSupplyListFilters["assignment"],
  context: CoopSupplyListFilterContext,
): boolean {
  const assignedCount = item.assignedFamilyIds.length;
  const isFull = assignedCount >= COOP_SUPPLY_MAX_ASSIGNED_FAMILIES;
  const hasSignups = assignedCount > 0;

  if (context.variant === "parent") {
    const isMine = isSupplyFamilyAssigned(
      item.assignedFamilyIds,
      context.currentFamilyId,
    );
    switch (assignment as CoopSupplyListAssignmentFilterParent) {
      case "all":
        return true;
      case "available":
        return !isFull && !isMine;
      case "mine":
        return isMine;
      case "signed_up":
        return hasSignups;
      case "full":
        return isFull;
      default:
        return true;
    }
  }

  switch (assignment as CoopSupplyListAssignmentFilterAdmin) {
    case "all":
      return true;
    case "unassigned":
      return !hasSignups;
    case "signed_up":
      return hasSignups;
    case "full":
      return isFull;
    default:
      return true;
  }
}

export function filterCoopSupplyListItems(
  items: CoopSupplyListItem[],
  filters: CoopSupplyListFilters,
  context: CoopSupplyListFilterContext,
): CoopSupplyListItem[] {
  return items.filter((item) => {
    if (!matchesSearch(item, filters.search)) return false;
    if (filters.itemType !== "all" && item.itemType !== filters.itemType) return false;
    if (filters.usageTiming !== "all" && item.usageTiming !== filters.usageTiming) {
      return false;
    }
    if (filters.month !== "all" && !item.months.includes(filters.month)) return false;
    if (filters.colorId === "none" && item.colorId !== null) return false;
    if (
      filters.colorId !== "all" &&
      filters.colorId !== "none" &&
      item.colorId !== filters.colorId
    ) {
      return false;
    }
    if (!matchesAssignment(item, filters.assignment, context)) return false;
    return true;
  });
}

export function countActiveCoopSupplyFilters(
  filters: CoopSupplyListFilters,
): number {
  let count = 0;
  if (filters.search.trim()) count += 1;
  if (filters.itemType !== "all") count += 1;
  if (filters.usageTiming !== "all") count += 1;
  if (filters.month !== "all") count += 1;
  if (filters.colorId !== "all") count += 1;
  if (filters.assignment !== "all") count += 1;
  return count;
}

export function parentAssignmentFilterOptions(): ReadonlyArray<{
  value: CoopSupplyListAssignmentFilterParent;
  label: string;
}> {
  return [
    { value: "all", label: "All sign-up status" },
    { value: "available", label: "Available to sign up" },
    { value: "mine", label: "My sign-ups" },
    { value: "signed_up", label: "Has sign-ups" },
    { value: "full", label: "Full" },
  ];
}

export function adminAssignmentFilterOptions(): ReadonlyArray<{
  value: CoopSupplyListAssignmentFilterAdmin;
  label: string;
}> {
  return [
    { value: "all", label: "All sign-up status" },
    { value: "unassigned", label: "Unassigned" },
    { value: "signed_up", label: "Has sign-ups" },
    { value: "full", label: "Full" },
  ];
}

export function coopSupplyItemTypeFilterOptions() {
  return [
    { value: "all", label: "All types" },
    ...SUPPLY_ITEM_TYPE_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
    })),
  ];
}

export function coopSupplyUsageTimingFilterOptions() {
  return [
    { value: "all", label: "All timing" },
    ...SUPPLY_USAGE_TIMING_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
    })),
  ];
}

export function coopSupplyMonthFilterOptions() {
  return [
    { value: "all", label: "All months" },
    ...COOP_SUPPLY_MONTH_OPTIONS.map((month) => ({
      value: month,
      label: month,
    })),
  ];
}

export function coopSupplyColorFilterOptions(
  colorLegend: ReadonlyArray<CoopSupplyColorLegendEntry>,
) {
  return [
    { value: "all", label: "All colors" },
    { value: "none", label: "No highlight" },
    ...colorLegend.map((entry) => ({
      value: entry.id,
      label: entry.label,
    })),
  ];
}
