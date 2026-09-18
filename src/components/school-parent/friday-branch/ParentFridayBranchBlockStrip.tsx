"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  formatBlockTabDateRange,
  getBlockDisplayLabel,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";

type ParentFridayBranchBlockStripProps = {
  theme: ParentThemeTokens;
  blocks: FridayBranchBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function ParentFridayBranchBlockStrip({
  theme,
  blocks,
  selectedId,
  onSelect,
}: ParentFridayBranchBlockStripProps) {
  if (blocks.length === 0) return null;

  return (
    <div className="mb-6 flex gap-[9px] overflow-x-auto pb-1">
      {blocks.map((block, index) => {
        const active = block.id === selectedId;
        const dateRange = formatBlockTabDateRange(block.startDate, block.endDate);

        return (
          <button
            key={block.id}
            type="button"
            onClick={() => onSelect(block.id)}
            className="min-w-[120px] shrink-0 rounded-[13px] border p-[13px] text-left transition-colors"
            style={{
              backgroundColor: active ? theme.primarySoft : theme.white,
              borderColor: active ? "#98BDA2" : theme.line,
            }}
          >
            <b className="block text-sm font-semibold" style={{ color: theme.ink }}>
              {getBlockDisplayLabel(block, index)}
            </b>
            <span
              className="mt-2 block text-[11px] font-medium"
              style={{ color: theme.muted }}
            >
              {dateRange}
            </span>
          </button>
        );
      })}
    </div>
  );
}
