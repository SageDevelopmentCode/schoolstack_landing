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
import ParentSupplyListSignupButton, {
  type ParentSupplyListPendingAction,
} from "@/components/school-parent/supply-list/ParentSupplyListSignupButton";
import ParentChip, { type ParentChipTone } from "@/components/school-parent/ui/ParentChip";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentSupplyListMobileItemCardProps = {
  item: CoopSupplyListItem;
  theme: ParentThemeTokens;
  rowStyle: Pick<CSSProperties, "backgroundColor" | "borderLeft">;
  currentFamilyId: string;
  previewMode?: boolean;
  pendingAction: ParentSupplyListPendingAction | null;
  isSelected: boolean;
  onSelect: () => void;
  onSignUp: () => void;
};

function parentSupplyChipTone(type: SupplyItemType): ParentChipTone {
  const tone = supplyItemTypeChipTone(type);
  return tone === "purple" ? "info" : tone;
}

export default function ParentSupplyListMobileItemCard({
  item,
  theme,
  rowStyle,
  currentFamilyId,
  previewMode = false,
  pendingAction,
  isSelected,
  onSelect,
  onSignUp,
}: ParentSupplyListMobileItemCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className="w-full cursor-pointer rounded-lg border p-3.5 text-left transition-colors"
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
        <ParentSupplyListSignupButton
          theme={theme}
          item={item}
          currentFamilyId={currentFamilyId}
          previewMode={previewMode}
          pendingAction={pendingAction}
          onSignUp={onSignUp}
          className="shrink-0"
        />
      </div>
    </div>
  );
}
