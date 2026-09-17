"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  formatBlockStats,
  formatBlockStripLabel,
  getBlockStatusTag,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";
import FridayBranchStatusTag from "./FridayBranchStatusTag";

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
        const statusTag = getBlockStatusTag(block, index);

        return (
          <button
            key={block.id}
            type="button"
            onClick={() => onSelect(block.id)}
            className="min-w-[205px] shrink-0 rounded-[13px] border p-[13px] text-left transition-colors"
            style={{
              backgroundColor: active ? "#EDF6EE" : "#fff",
              borderColor: active ? "#98BDA2" : "#DDE6DE",
            }}
          >
            <b className="block text-xs" style={{ color: theme.ink }}>
              {formatBlockStripLabel(block)}
            </b>
            <span className="mt-0.5 block text-[10px]" style={{ color: theme.muted }}>
              {formatBlockStats(block)}
            </span>
            <FridayBranchStatusTag
              label={statusTag.label}
              variant={statusTag.variant}
              className="mt-[7px]"
            />
          </button>
        );
      })}

      <button
        type="button"
        onClick={onAddBlock}
        className="min-w-[205px] shrink-0 rounded-[13px] border border-dashed p-[13px] text-left transition-colors hover:bg-[#F8FCF8]"
        style={{ borderColor: "#A9C4AF", color: theme.primary }}
      >
        <b className="block text-xs">+ Add a new block</b>
        <span className="mt-0.5 block text-[10px]" style={{ color: theme.muted }}>
          Set dates and begin planning
        </span>
      </button>
    </div>
  );
}
