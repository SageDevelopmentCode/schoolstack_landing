"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import {
  COOP_SUPPLY_MAX_ASSIGNED_FAMILIES,
  formatSupplyAssignedFamilies,
  formatSupplyEstimatedPrice,
  formatSupplyQuantity,
  getSupplyColorLegendEntry,
  isSupplyFamilyAssigned,
  supplyColorLegendDisplayLabel,
  supplyItemDisplayName,
  supplyItemTypeChipTone,
  supplyItemTypeLabel,
  supplyUsageTimingLabel,
  type CoopSupplyColorLegendEntry,
  type CoopSupplyListItem,
  type SupplyItemType,
} from "@/lib/admissions/program-coop-supply-list-mock";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentChip, { type ParentChipTone } from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentCoopSupplyListItemDetailPanelProps = {
  item: CoopSupplyListItem;
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

function parentSupplyChipTone(type: SupplyItemType): ParentChipTone {
  const tone = supplyItemTypeChipTone(type);
  return tone === "purple" ? "info" : tone;
}

function DetailRow({
  label,
  children,
  theme,
}: {
  label: string;
  children: React.ReactNode;
  theme: ParentThemeTokens;
}) {
  return (
    <div>
      <div
        className="text-[10px] font-extrabold uppercase tracking-[0.08em]"
        style={{ color: theme.muted }}
      >
        {label}
      </div>
      <div className="mt-1 text-sm" style={{ color: theme.ink }}>
        {children}
      </div>
    </div>
  );
}

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
  const titleId = "parent-supply-item-detail-title";
  const colorEntry = getSupplyColorLegendEntry(colorLegend, item.colorId);
  const isSignedUp = isSupplyFamilyAssigned(item.assignedFamilyIds, currentFamilyId);
  const isFull = item.assignedFamilyIds.length >= COOP_SUPPLY_MAX_ASSIGNED_FAMILIES;
  const isPending = pendingAction?.itemId === item.id;
  const pendingType = pendingAction?.type;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[110]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        data-testid="parent-supply-item-detail-panel"
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={onClose}
          aria-hidden="true"
        />
        <motion.aside
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden border-l"
          style={{
            backgroundColor: theme.white,
            borderColor: theme.line,
            boxShadow: theme.shadowCard,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="flex shrink-0 flex-col gap-3 border-b px-4 py-4"
            style={{ borderColor: theme.line, backgroundColor: theme.paper }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <ParentSectionKicker theme={theme}>Supply item</ParentSectionKicker>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <ParentDisplayHeading
                    theme={theme}
                    as="h2"
                    size="section"
                    id={titleId}
                    className="truncate"
                  >
                    {supplyItemDisplayName(item)}
                  </ParentDisplayHeading>
                  <ParentChip theme={theme} tone={parentSupplyChipTone(item.itemType)}>
                    {supplyItemTypeLabel(item.itemType)}
                  </ParentChip>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close supply item details"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent"
                style={{ color: theme.muted }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              <DetailRow label="When" theme={theme}>
                {supplyUsageTimingLabel(item)}
              </DetailRow>
              <DetailRow label="Quantity" theme={theme}>
                {formatSupplyQuantity(item)}
              </DetailRow>
              <DetailRow label="Estimated price" theme={theme}>
                {formatSupplyEstimatedPrice(item.estimatedPrice)}
              </DetailRow>
              <DetailRow label="Where to buy" theme={theme}>
                {item.whereToBuy.trim() || "—"}
              </DetailRow>
              <DetailRow label="Highlight" theme={theme}>
                {colorEntry ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: colorEntry.hex }}
                      aria-hidden="true"
                    />
                    {supplyColorLegendDisplayLabel(colorEntry)}
                  </span>
                ) : (
                  "No highlight"
                )}
              </DetailRow>
              <DetailRow label="Signed up families" theme={theme}>
                {item.assignedFamilyIds.length > 0
                  ? formatSupplyAssignedFamilies(item.assignedFamilyIds, familyNameMap)
                  : "No sign-ups yet"}
              </DetailRow>
            </div>
          </div>

          <div
            className="shrink-0 border-t px-4 py-4"
            style={{ borderColor: theme.line, backgroundColor: theme.paper }}
          >
            {isSignedUp ? (
              <div className="space-y-3">
                <p className="text-sm font-medium" style={{ color: theme.success }}>
                  You&apos;re signed up for this item.
                </p>
                <ParentButton
                  theme={theme}
                  variant="outline"
                  className="w-full"
                  disabled={previewMode || isPending}
                  onClick={onUnclaim}
                >
                  {isPending && pendingType === "unclaim" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Remove me"
                  )}
                </ParentButton>
              </div>
            ) : isFull ? (
              <p className="text-sm" style={{ color: theme.muted }}>
                This item is full — all sign-up spots are taken.
              </p>
            ) : (
              <ParentButton
                theme={theme}
                variant="soft"
                className="w-full"
                disabled={previewMode || isPending}
                onClick={onClaim}
              >
                {isPending && pendingType === "claim" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Sign up for this item"
                )}
              </ParentButton>
            )}
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}
