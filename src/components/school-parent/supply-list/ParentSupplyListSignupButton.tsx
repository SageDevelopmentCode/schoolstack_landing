"use client";

import { Loader2 } from "lucide-react";
import {
  COOP_SUPPLY_MAX_ASSIGNED_FAMILIES,
  isSupplyFamilyAssigned,
  type CoopSupplyListItem,
} from "@/lib/admissions/program-coop-supply-list-mock";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type ParentSupplyListPendingAction = {
  itemId: string;
  type: "claim" | "unclaim";
};

type ParentSupplyListSignupButtonProps = {
  theme: ParentThemeTokens;
  item: CoopSupplyListItem;
  currentFamilyId: string;
  previewMode?: boolean;
  pendingAction: ParentSupplyListPendingAction | null;
  onSignUp: () => void;
  className?: string;
};

const compactButtonClass = "px-3 py-1.5 text-xs whitespace-nowrap";

export default function ParentSupplyListSignupButton({
  theme,
  item,
  currentFamilyId,
  previewMode = false,
  pendingAction,
  onSignUp,
  className = "",
}: ParentSupplyListSignupButtonProps) {
  const isSignedUp = isSupplyFamilyAssigned(item.assignedFamilyIds, currentFamilyId);
  const isFull = item.assignedFamilyIds.length >= COOP_SUPPLY_MAX_ASSIGNED_FAMILIES;
  const isPendingClaim =
    pendingAction?.itemId === item.id && pendingAction.type === "claim";

  if (isSignedUp) {
    return (
      <ParentButton
        theme={theme}
        variant="outline"
        disabled
        className={`${compactButtonClass} ${className}`}
        style={{
          color: theme.success,
          borderColor: `${theme.success}55`,
          backgroundColor: theme.successBg,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        You&apos;re signed up
      </ParentButton>
    );
  }

  if (isFull) {
    return (
      <ParentButton
        theme={theme}
        variant="outline"
        disabled
        className={`${compactButtonClass} ${className}`}
        style={{ color: theme.muted }}
        onClick={(event) => event.stopPropagation()}
      >
        Full
      </ParentButton>
    );
  }

  return (
    <ParentButton
      theme={theme}
      variant="soft"
      disabled={previewMode || isPendingClaim}
      className={`${compactButtonClass} ${className}`}
      onClick={(event) => {
        event.stopPropagation();
        onSignUp();
      }}
    >
      {isPendingClaim ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        "Sign up"
      )}
    </ParentButton>
  );
}
