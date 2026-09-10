"use client";

import type { CSSProperties } from "react";
import {
  formatSupplyEstimatedPrice,
  formatSupplyQuantity,
  supplyItemDisplayName,
  supplyItemTypeChipTone,
  supplyItemTypeLabel,
  supplyUsageTimingLabel,
  type CoopSupplyListItem,
  type SupplyItemType,
} from "@/lib/admissions/program-coop-supply-list-mock";
import ParentChip, { type ParentChipTone } from "@/components/school-parent/ui/ParentChip";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentSupplyListMobileItemCardProps = {
  item: CoopSupplyListItem;
  theme: ParentThemeTokens;
  rowStyle: Pick<CSSProperties, "backgroundColor" | "borderLeft">;
  statusLabel: string;
  isSelected: boolean;
  onSelect: () => void;
};

function parentSupplyChipTone(type: SupplyItemType): ParentChipTone {
  const tone = supplyItemTypeChipTone(type);
  return tone === "purple" ? "info" : tone;
}

export default function ParentSupplyListMobileItemCard({
  item,
  theme,
  rowStyle,
  statusLabel,
  isSelected,
  onSelect,
}: ParentSupplyListMobileItemCardProps) {
  const statusColor =
    statusLabel === "You"
      ? theme.success
      : statusLabel === "Full"
        ? theme.muted
        : theme.primary;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-lg border p-3.5 text-left transition-colors"
      style={{
        ...rowStyle,
        borderColor: isSelected ? theme.primary : theme.line,
        boxShadow: isSelected ? theme.shadowCard : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: theme.ink }}>
              {supplyItemDisplayName(item)}
            </span>
            <ParentChip theme={theme} tone={parentSupplyChipTone(item.itemType)}>
              {supplyItemTypeLabel(item.itemType)}
            </ParentChip>
          </div>
          <p className="mt-1.5 text-xs" style={{ color: theme.muted }}>
            {supplyUsageTimingLabel(item)}
            <span className="mx-1.5 opacity-50">·</span>
            {formatSupplyQuantity(item)}
            <span className="mx-1.5 opacity-50">·</span>
            {formatSupplyEstimatedPrice(item.estimatedPrice)}
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium" style={{ color: statusColor }}>
          {statusLabel}
        </span>
      </div>
    </button>
  );
}
