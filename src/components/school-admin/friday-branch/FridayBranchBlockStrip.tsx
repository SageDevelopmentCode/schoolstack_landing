"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  formatBlockTabDateRange,
  getBlockDisplayLabel,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";

type FridayBranchBlockStripProps = {
  theme: ParentThemeTokens;
  blocks: FridayBranchBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddBlock: () => void;
};

export default function FridayBranchBlockStrip({
  theme,
  blocks,
  selectedId,
  onSelect,
  onAddBlock,
}: FridayBranchBlockStripProps) {
  return (
    <div className="flex gap-[9px] overflow-x-auto pb-1">
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
              backgroundColor: active ? "#EDF6EE" : "#fff",
              borderColor: active ? "#98BDA2" : "#DDE6DE",
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

      <button
        type="button"
        onClick={onAddBlock}
        className="min-w-[140px] shrink-0 rounded-[13px] border border-dashed p-[13px] text-left transition-colors hover:bg-[#F8FCF8]"
        style={{ borderColor: "#A9C4AF", color: theme.primary }}
      >
        <b className="block text-sm font-semibold">+ Add block</b>
      </button>
    </div>
  );
}
