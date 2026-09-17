"use client";

import { Plus } from "lucide-react";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  formatBlockTabLabel,
  getBlockAccentColor,
} from "@/lib/school-admin/friday-branch/friday-branch-mock";
import type { FridayBranchBlock } from "@/lib/school-admin/friday-branch/friday-branch-types";

type FridayBranchBlockTabsProps = {
  theme: ParentThemeTokens;
  blocks: FridayBranchBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddBlock: () => void;
};

export default function FridayBranchBlockTabs({
  theme,
  blocks,
  selectedId,
  onSelect,
  onAddBlock,
}: FridayBranchBlockTabsProps) {
  return (
    <div
      className="flex items-end gap-1 overflow-x-auto border-b pb-0 snap-x snap-mandatory"
      style={{ borderColor: "#EEF2EE" }}
      role="tablist"
      aria-label="Friday Branch blocks"
    >
      {blocks.map((block) => {
        const active = block.id === selectedId;
        const accent = getBlockAccentColor(block.accent);

        return (
          <button
            key={block.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(block.id)}
            className="snap-start shrink-0 px-4 py-2.5 text-left text-sm font-medium transition-colors"
            style={{
              color: active ? theme.ink : theme.muted,
              borderBottom: active ? `2px solid ${accent}` : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {formatBlockTabLabel(block)}
          </button>
        );
      })}

      <AdminTextLink
        theme={theme}
        className="mb-2.5 ml-2 shrink-0 snap-start !text-xs"
        onClick={onAddBlock}
      >
        <span className="inline-flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" />
          Add block
        </span>
      </AdminTextLink>
    </div>
  );
}
