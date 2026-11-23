"use client";

import {
  formatSupplyEstimatedPrice,
  formatSupplyQuantity,
  supplyItemDisplayName,
  supplyUsageTimingLabel,
  type CoopSupplyListItem,
} from "@/lib/admissions/program-coop-supply-list-mock";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import ParentSupplyListSignupButton, {
  SupplyTypeChip,
  type ParentSupplyListPendingAction,
} from "@/components/school-parent/supply-list/ParentSupplyListSignupButton";

type ParentSupplyListMobileItemCardProps = {
  item: CoopSupplyListItem;
  /** Highlight colour from the legend (drawn as the row's left edge). */
  colorHex: string | null;
  currentFamilyId: string;
  previewMode?: boolean;
  pendingAction: ParentSupplyListPendingAction | null;
  isSelected: boolean;
  onSelect: () => void;
  onSignUp: () => void;
};

/** One supply item on phones (Garden): opens the item drawer; sign up inline. */
export default function ParentSupplyListMobileItemCard({
  item,
  colorHex,
  currentFamilyId,
  previewMode = false,
  pendingAction,
  isSelected,
  onSelect,
  onSignUp,
}: ParentSupplyListMobileItemCardProps) {
  return (
    // The whole card opens the drawer on click; keyboard and screen-reader
    // users get the item name as a real button (no nested interactive roles).
    <div
      onClick={onSelect}
      className={`w-full cursor-pointer rounded-[16px] border-[1.5px] border-l-[5px] p-3.5 text-left transition-colors ${
        isSelected
          ? "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)]"
          : "border-[var(--sf-ink)]/10 bg-white hover:bg-[var(--sf-accent-wash)]"
      }`}
      style={{ borderLeftColor: colorHex ?? "rgba(43,36,29,0.1)" }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          aria-haspopup="dialog"
          className={`rounded-md text-left text-[15px] font-extrabold text-[var(--sf-ink)] hover:underline hover:decoration-2 hover:underline-offset-4 ${G_FOCUS}`}
        >
          {supplyItemDisplayName(item)}
        </button>
        <SupplyTypeChip type={item.itemType} />
      </div>
      <p className="m-0 mt-1 text-[13px] font-semibold text-[var(--sf-soft)]">
        {supplyUsageTimingLabel(item)}
        <span className="mx-1.5 opacity-50" aria-hidden>
          ·
        </span>
        {formatSupplyQuantity(item)}
        <span className="mx-1.5 opacity-50" aria-hidden>
          ·
        </span>
        {formatSupplyEstimatedPrice(item.estimatedPrice)}
      </p>
      <div className="mt-3">
        <ParentSupplyListSignupButton
          item={item}
          currentFamilyId={currentFamilyId}
          previewMode={previewMode}
          pendingAction={pendingAction}
          onSignUp={onSignUp}
        />
      </div>
    </div>
  );
}
