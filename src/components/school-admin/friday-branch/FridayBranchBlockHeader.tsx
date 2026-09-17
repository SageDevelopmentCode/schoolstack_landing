"use client";

import SchoolAdminDatePicker, {
  schoolAdminDateRangeBounds,
} from "@/components/school-admin/ui/SchoolAdminDatePicker";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatBlockStats } from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";

type FridayBranchBlockHeaderProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  block: FridayBranchBlock;
  onChange: (block: FridayBranchBlock) => void;
};

export default function FridayBranchBlockHeader({
  C,
  theme,
  block,
  onChange,
}: FridayBranchBlockHeaderProps) {
  const { minDate, maxDate } = schoolAdminDateRangeBounds();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor={`fb-block-name-${block.id}`}>
          Block name
        </label>
        <input
          id={`fb-block-name-${block.id}`}
          value={block.label}
          onChange={(event) => onChange({ ...block, label: event.target.value })}
          className="w-full max-w-md border-0 bg-transparent p-0 font-heading text-2xl font-semibold outline-none focus:ring-0"
          style={{
            color: theme.ink,
            fontFamily: theme.fontDisplay,
          }}
          placeholder="Block name"
        />
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: theme.muted }}>
              Start
            </span>
            <SchoolAdminDatePicker
              id={`fb-block-${block.id}-start`}
              value={block.startDate}
              onChange={(iso) => onChange({ ...block, startDate: iso })}
              C={C}
              minDate={minDate}
              maxDate={block.endDate || maxDate}
            />
          </label>
          <span className="pb-2 text-sm" style={{ color: theme.muted }}>
            through
          </span>
          <label className="block space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: theme.muted }}>
              End
            </span>
            <SchoolAdminDatePicker
              id={`fb-block-${block.id}-end`}
              value={block.endDate}
              onChange={(iso) => onChange({ ...block, endDate: iso })}
              C={C}
              minDate={block.startDate || minDate}
              maxDate={maxDate}
            />
          </label>
        </div>
        <p className="pb-1 text-xs whitespace-nowrap" style={{ color: theme.muted }}>
          {formatBlockStats(block)}
        </p>
      </div>
    </div>
  );
}
