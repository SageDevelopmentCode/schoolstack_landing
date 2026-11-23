"use client";

import { Search } from "lucide-react";
import {
  adminTeachingScheduleVolunteerFilterOptions,
  coopTeachingScheduleMonthFilterOptions,
  coopTeachingScheduleWhenFilterOptions,
  countActiveCoopTeachingScheduleFilters,
  DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS,
  parentTeachingScheduleVolunteerFilterOptions,
  type CoopTeachingScheduleFilters,
  type CoopTeachingScheduleMonth,
  type CoopTeachingScheduleWhenFilter,
} from "@/lib/admissions/program-coop-teaching-schedule-filters";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import { GSearchInput, GSelect } from "@/components/school-parent/garden/fields";
import { GCard, gLinkSm } from "@/components/school-parent/garden/ui";

type CoopTeachingScheduleFilterBarProps = {
  variant: "parent" | "admin";
  filters: CoopTeachingScheduleFilters;
  onChange: (filters: CoopTeachingScheduleFilters) => void;
  theme: ParentThemeTokens;
  C?: AdminThemeTokens;
  resultCount: number;
  totalCount: number;
};

export default function CoopTeachingScheduleFilterBar({
  variant,
  filters,
  onChange,
  theme,
  C,
  resultCount,
  totalCount,
}: CoopTeachingScheduleFilterBarProps) {
  const activeFilterCount = countActiveCoopTeachingScheduleFilters(filters);
  const volunteerOptions =
    variant === "parent"
      ? parentTeachingScheduleVolunteerFilterOptions()
      : adminTeachingScheduleVolunteerFilterOptions();

  const update = (patch: Partial<CoopTeachingScheduleFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const clearFilters = () => {
    onChange(DEFAULT_COOP_TEACHING_SCHEDULE_FILTERS);
  };

  const filterFields = [
    {
      id: "coop-teaching-filter-when",
      value: filters.when,
      onChange: (value: string) => update({ when: value as CoopTeachingScheduleWhenFilter }),
      options: coopTeachingScheduleWhenFilterOptions(),
      ariaLabel: "Filter by when",
    },
    {
      id: "coop-teaching-filter-month",
      value: filters.month,
      onChange: (value: string) => update({ month: value as CoopTeachingScheduleMonth | "all" }),
      options: coopTeachingScheduleMonthFilterOptions(),
      ariaLabel: "Filter by month",
    },
    {
      id: "coop-teaching-filter-volunteer",
      value: filters.volunteer,
      onChange: (value: string) =>
        update({ volunteer: value as CoopTeachingScheduleFilters["volunteer"] }),
      options: volunteerOptions,
      ariaLabel: "Filter by volunteer status",
    },
  ] as const;

  if (variant === "parent") {
    // Parent Garden filter card (renders inside ParentGardenFrame).
    return (
      <GCard
        index={2}
        kicker="Find a week"
        action={
          activeFilterCount > 0 ? (
            <button type="button" onClick={clearFilters} className={gLinkSm}>
              Clear filters
            </button>
          ) : null
        }
        data-testid="parent-teaching-schedule-filters"
      >
        <div className="flex flex-col gap-3">
          <GSearchInput
            value={filters.search}
            onChange={(search) => update({ search })}
            placeholder="Search weeks, themes, or parent names"
            label="Search teaching schedule"
          />
          <div className="grid gap-2.5 sm:grid-cols-3">
            {filterFields.map((field) => (
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
          <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]" aria-live="polite">
            Showing {resultCount} of {totalCount} weeks
          </p>
        </div>
      </GCard>
    );
  }

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium" style={{ color: theme.muted }}>
          Showing {resultCount} of {totalCount} weeks
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
          placeholder="Search weeks, themes, or parent names"
          className="w-full rounded-lg border py-2 pl-9 pr-3 text-[16px] outline-none transition-colors focus:ring-1 sm:text-[13px]"
          style={{
            backgroundColor: C?.input,
            borderColor: C?.inputBorder,
            color: C?.textPrimary,
          }}
          aria-label="Search teaching schedule"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {C
          ? filterFields.map((field) => (
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
