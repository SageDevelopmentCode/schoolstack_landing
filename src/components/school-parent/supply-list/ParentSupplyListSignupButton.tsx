"use client";

import { Loader2 } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { GChip, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import {
  COOP_SUPPLY_MAX_ASSIGNED_FAMILIES,
  isSupplyFamilyAssigned,
  supplyItemDisplayName,
  supplyItemTypeChipTone,
  supplyItemTypeLabel,
  type CoopSupplyListItem,
  type SupplyItemType,
} from "@/lib/admissions/program-coop-supply-list-mock";

export type ParentSupplyListPendingAction = {
  itemId: string;
  type: "claim" | "unclaim";
};

type ParentSupplyListSignupButtonProps = {
  item: CoopSupplyListItem;
  currentFamilyId: string;
  previewMode?: boolean;
  pendingAction: ParentSupplyListPendingAction | null;
  onSignUp: () => void;
  className?: string;
};

/** Garden chip for a supply item's type (consumable / reusable / both). */
export function SupplyTypeChip({ type }: { type: SupplyItemType }) {
  const tone = supplyItemTypeChipTone(type);
  return (
    <GChip tone={tone === "purple" ? "warning" : tone} className="whitespace-nowrap">
      {supplyItemTypeLabel(type)}
    </GChip>
  );
}

/**
 * Row-level sign-up control (Garden). Rows never get toy buttons: "Sign up"
 * is an outline pill, signed-up is a mint chip with a tick, full is neutral.
 * Removing a sign-up happens in the item drawer.
 */
export default function ParentSupplyListSignupButton({
  item,
  currentFamilyId,
  previewMode = false,
  pendingAction,
  onSignUp,
  className = "",
}: ParentSupplyListSignupButtonProps) {
  const isSignedUp = isSupplyFamilyAssigned(item.assignedFamilyIds, currentFamilyId);
  const isFull = item.assignedFamilyIds.length >= COOP_SUPPLY_MAX_ASSIGNED_FAMILIES;
  const isPendingClaim = pendingAction?.itemId === item.id && pendingAction.type === "claim";

  if (isSignedUp) {
    return (
      <GChip tone="success" className={`whitespace-nowrap py-1 ${className}`}>
        <Tick className="h-3.5 w-3.5" />
        You&apos;re signed up
      </GChip>
    );
  }

  if (isFull) {
    return (
      <GChip tone="neutral" className={`py-1 ${className}`}>
        Full
      </GChip>
    );
  }

  return (
    <button
      type="button"
      disabled={previewMode || isPendingClaim}
      aria-busy={isPendingClaim || undefined}
      aria-label={`Sign up for ${supplyItemDisplayName(item)}`}
      className={`${gBtnOutlineSm} !px-3.5 !py-1.5 whitespace-nowrap hover:bg-[var(--sf-accent-wash)] ${className}`}
      onClick={(event) => {
        event.stopPropagation();
        onSignUp();
      }}
    >
      {isPendingClaim ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
      Sign up
    </button>
  );
}
