"use client";

import { Search } from "lucide-react";
import {
  adminAssignmentFilterOptions,
  coopSupplyColorFilterOptions,
  coopSupplyItemTypeFilterOptions,
  coopSupplyMonthFilterOptions,
  coopSupplyUsageTimingFilterOptions,
  countActiveCoopSupplyFilters,
  DEFAULT_COOP_SUPPLY_LIST_FILTERS,
  parentAssignmentFilterOptions,
  type CoopSupplyListFilters,
} from "@/lib/admissions/program-coop-supply-list-filters";
import {
  supplyColorLegendDisplayLabel,
  type CoopSupplyColorLegendEntry,
  type CoopSupplyMonth,
  type SupplyItemType,
  type SupplyUsageTiming,
} from "@/lib/admissions/program-coop-supply-list-mock";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import { GSearchInput, GSelect } from "@/components/school-parent/garden/fields";
import { GCard, gLinkSm } from "@/components/school-parent/garden/ui";

type CoopSupplyListFilterBarProps = {
  variant: "parent" | "admin";
  filters: CoopSupplyListFilters;
  onChange: (filters: CoopSupplyListFilters) => void;
  colorLegend: ReadonlyArray<CoopSupplyColorLegendEntry>;
  theme: ParentThemeTokens;
  C?: AdminThemeTokens;
  resultCount: number;
  totalCount: number;
};

export default function CoopSupplyListFilterBar({
  variant,
  filters,
  onChange,
  colorLegend,
  theme,
  C,
  resultCount,
  totalCount,
}: CoopSupplyListFilterBarProps) {
  const activeFilterCount = countActiveCoopSupplyFilters(filters);
  const assignmentOptions =
    variant === "parent"
      ? parentAssignmentFilterOptions()
      : adminAssignmentFilterOptions();

  const update = (patch: Partial<CoopSupplyListFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const clearFilters = () => {
    onChange(DEFAULT_COOP_SUPPLY_LIST_FILTERS);
  };

  const parentFilterFields = [
    {
      id: "coop-supply-filter-type",
      value: filters.itemType,
      onChange: (value: string) => update({ itemType: value as SupplyItemType | "all" }),
      options: coopSupplyItemTypeFilterOptions(),
      ariaLabel: "Filter by item type",
    },
    {
      id: "coop-supply-filter-timing",
      value: filters.usageTiming,
      onChange: (value: string) => update({ usageTiming: value as SupplyUsageTiming | "all" }),
      options: coopSupplyUsageTimingFilterOptions(),
      ariaLabel: "Filter by usage timing",
    },
    {
      id: "coop-supply-filter-month",
      value: filters.month,
      onChange: (value: string) => update({ month: value as CoopSupplyMonth | "all" }),
      options: coopSupplyMonthFilterOptions(),
      ariaLabel: "Filter by month",
    },
    {
      id: "coop-supply-filter-color",
      value: filters.colorId,
      onChange: (value: string) => update({ colorId: value }),
      options: coopSupplyColorFilterOptions(colorLegend),
      ariaLabel: "Filter by highlight color",
    },
    {
      id: "coop-supply-filter-assignment",
      value: filters.assignment,
      onChange: (value: string) =>
        update({ assignment: value as CoopSupplyListFilters["assignment"] }),
      options: assignmentOptions,
      ariaLabel: "Filter by sign-up status",
    },
  ] as const;

  if (variant === "parent") {
    // Parent Garden filter card (renders inside ParentGardenFrame).
    return (
      <GCard
        index={2}
        kicker="Find an item"
        action={
          activeFilterCount > 0 ? (
            <button type="button" onClick={clearFilters} className={gLinkSm}>
              Clear filters
            </button>
          ) : null
        }
        data-testid="parent-supply-list-filters"
      >
        <div className="flex flex-col gap-3">
          <GSearchInput
            value={filters.search}
            onChange={(search) => update({ search })}
            placeholder="Search items, stores, or quantity"
            label="Search supply list"
          />
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {parentFilterFields.map((field) => (
              <GSelect
                key={field.id}
                id={field.id}
                value={field.value}
                onChange={field.onChange}
                options={field.options.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                aria-label={field.ariaLabel}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]" aria-live="polite">
              Showing {resultCount} of {totalCount} items
            </p>
            {colorLegend.length > 0 ? (
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Highlight colours">
                {colorLegend.map((entry) => (
                  <li
                    key={entry.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sf-ink)]/[0.05] px-2.5 py-1 text-[12px] font-extrabold text-[var(--sf-ink)]/80"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-[1.5px] ring-[var(--sf-ink)]/20"
                      style={{ backgroundColor: entry.hex }}
                      aria-hidden="true"
                    />
                    {supplyColorLegendDisplayLabel(entry)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </GCard>
    );
  }

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium" style={{ color: theme.muted }}>
          Showing {resultCount} of {totalCount} items
        </p>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold underline-offset-2 hover:underline"
            style={{ color: theme.primary }}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
          style={{ color: theme.muted }}
          aria-hidden
        />
        <input
          type="search"
          value={filters.search}
          onChange={(event) => update({ search: event.target.value })}
          placeholder="Search items, stores, or quantity"
          className="w-full rounded-lg border py-2 pl-9 pr-3 text-[16px] outline-none transition-colors focus:ring-1 sm:text-[13px]"
          style={{
            backgroundColor: C?.input,
            borderColor: C?.inputBorder,
            color: C?.textPrimary,
          }}
          aria-label="Search supply list"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {C
          ? parentFilterFields.map((field) => (
              <SchoolAdminSelect
                key={field.id}
                id={field.id}
                value={field.value}
                onChange={field.onChange}
                options={field.options.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                ariaLabel={field.ariaLabel}
                C={C}
                className="min-w-[10rem]"
              />
            ))
          : null}
      </div>
    </div>
  );
}
