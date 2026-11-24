"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, Coins, Eye, Loader2, Package, Palette, Store, Users } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GIcon, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import {
  COOP_SUPPLY_MAX_ASSIGNED_FAMILIES,
  formatSupplyAssignedFamilies,
  formatSupplyEstimatedPrice,
  formatSupplyQuantity,
  getSupplyColorLegendEntry,
  isSupplyFamilyAssigned,
  supplyColorLegendDisplayLabel,
  supplyItemDisplayName,
  supplyUsageTimingLabel,
  type CoopSupplyColorLegendEntry,
  type CoopSupplyListItem,
} from "@/lib/admissions/program-coop-supply-list-mock";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { SupplyTypeChip } from "./ParentSupplyListSignupButton";

type ParentCoopSupplyListItemDetailPanelProps = {
  item: CoopSupplyListItem | null;
  colorLegend: ReadonlyArray<CoopSupplyColorLegendEntry>;
  theme: ParentThemeTokens;
  currentFamilyId: string;
  familyNameMap: ReadonlyMap<string, string>;
  previewMode?: boolean;
  pendingAction: { itemId: string; type: "claim" | "unclaim" } | null;
  onClose: () => void;
  onClaim: () => void;
  onUnclaim: () => void;
};

function DetailRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3.5">
      <GIcon size="sm">{icon}</GIcon>
      <div className="min-w-0">
        <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">{label}</p>
        <div className="mt-0.5 text-[15px] font-semibold text-[var(--sf-ink)]">{children}</div>
      </div>
    </div>
  );
}

/**
 * Supply item drawer (Garden). Mount it OUTSIDE the page frame: GSidePanel
 * carries its own frame, Escape, focus-to-close and focus return.
 * The only place to remove a sign-up ("Remove me").
 */
export default function ParentCoopSupplyListItemDetailPanel({
  item,
  colorLegend,
  theme,
  currentFamilyId,
  familyNameMap,
  previewMode = false,
  pendingAction,
  onClose,
  onClaim,
  onUnclaim,
}: ParentCoopSupplyListItemDetailPanelProps) {
  // Keep the last item while the panel animates out.
  const [shown, setShown] = useState<CoopSupplyListItem | null>(item);
  useEffect(() => {
    if (item) queueMicrotask(() => setShown(item));
  }, [item]);
  const current = item ?? shown;

  const colorEntry = current ? getSupplyColorLegendEntry(colorLegend, current.colorId) : null;
  const isSignedUp = current ? isSupplyFamilyAssigned(current.assignedFamilyIds, currentFamilyId) : false;
  const isFull = current ? current.assignedFamilyIds.length >= COOP_SUPPLY_MAX_ASSIGNED_FAMILIES : false;
  const isPending = current != null && pendingAction?.itemId === current.id;
  const pendingType = pendingAction?.type;

  const footer = !current ? null : isSignedUp ? (
    <div className="flex w-full flex-col gap-3">
      <p className="m-0 flex items-center gap-2 text-[14px] font-extrabold text-[var(--sf-forest)]">
        <Tick className="h-5 w-5" fill="var(--sf-mint)" />
        You&apos;re signed up for this item.
      </p>
      <button
        type="button"
        className={`${gBtnOutlineSm} w-full`}
        disabled={previewMode || isPending}
        aria-busy={(isPending && pendingType === "unclaim") || undefined}
        onClick={onUnclaim}
      >
        {isPending && pendingType === "unclaim" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        Remove me
      </button>
    </div>
  ) : isFull ? (
    <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">
      This item is full — all sign-up spots are taken.
    </p>
  ) : (
    <button
      type="button"
      className={`${gBtnPopSm} w-full`}
      disabled={previewMode || isPending}
      aria-busy={(isPending && pendingType === "claim") || undefined}
      onClick={onClaim}
    >
      {isPending && pendingType === "claim" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      Sign up for this item
    </button>
  );

  return (
    <GSidePanel
      theme={theme}
      open={item != null}
      onClose={onClose}
      kicker="Supply item"
      title={current ? supplyItemDisplayName(current) : ""}
      subtitle={current ? <SupplyTypeChip type={current.itemType} /> : null}
      closeLabel="Close supply item details"
      testId="parent-supply-item-detail-panel"
      panelId="parent-supply-item-detail"
      footer={
        <div className="flex w-full flex-col gap-2">
          {previewMode ? (
            <p className="m-0 flex items-center gap-1.5 text-[12px] font-extrabold text-[var(--sf-soft)]">
              <Eye className="h-3.5 w-3.5" aria-hidden />
              Preview mode — sign-ups are turned off here.
            </p>
          ) : null}
          {footer}
        </div>
      }
    >
      {current ? (
        <div className="flex flex-col gap-4">
          <DetailRow icon={<CalendarDays />} label="When">
            {supplyUsageTimingLabel(current)}
          </DetailRow>
          <DetailRow icon={<Package />} label="Quantity">
            {formatSupplyQuantity(current)}
          </DetailRow>
          <DetailRow icon={<Coins />} label="Estimated price">
            {formatSupplyEstimatedPrice(current.estimatedPrice)}
          </DetailRow>
          <DetailRow icon={<Store />} label="Where to buy">
            {current.whereToBuy.trim() || "—"}
          </DetailRow>
          <DetailRow icon={<Palette />} label="Highlight">
            {colorEntry ? (
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full ring-[1.5px] ring-[var(--sf-ink)]/20"
                  style={{ backgroundColor: colorEntry.hex }}
                  aria-hidden="true"
                />
                {supplyColorLegendDisplayLabel(colorEntry)}
              </span>
            ) : (
              "No highlight"
            )}
          </DetailRow>
          <DetailRow icon={<Users />} label="Signed up families">
            {current.assignedFamilyIds.length > 0
              ? formatSupplyAssignedFamilies(current.assignedFamilyIds, familyNameMap)
              : "No sign-ups yet"}
          </DetailRow>
        </div>
      ) : null}
    </GSidePanel>
  );
}
