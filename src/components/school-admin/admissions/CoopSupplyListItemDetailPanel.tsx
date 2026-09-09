"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  areCoopSupplyItemsEqual,
  buildSupplyRangePrice,
  buildSupplySinglePrice,
  canAddSupplyAssignedFamily,
  COOP_SUPPLY_MAX_ASSIGNED_FAMILIES,
  COOP_SUPPLY_MONTH_OPTIONS,
  formatSupplyEstimatedPrice,
  normalizeSupplyFamilyName,
  formatSupplyQuantity,
  SUPPLY_ITEM_TYPE_OPTIONS,
  SUPPLY_USAGE_TIMING_OPTIONS,
  getSupplyColorLegendEntry,
  supplyItemDisplayName,
  supplyItemTypeChipTone,
  supplyItemTypeLabel,
  supplyPriceRangeDollars,
  supplyPriceSingleDollars,
  type CoopSupplyColorLegendEntry,
  type CoopSupplyListItem,
} from "@/lib/admissions/program-coop-supply-list-mock";
import { adminToast } from "@/lib/school-admin/admin-toast";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { BuilderQuestionCard } from "./builder-question-card";

type CoopSupplyListItemDetailPanelProps = {
  item: CoopSupplyListItem;
  colorLegend: ReadonlyArray<CoopSupplyColorLegendEntry>;
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  onClose: () => void;
  onSave: (item: CoopSupplyListItem) => void | Promise<void>;
  onRemove: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  canRemove: boolean;
};

function controlStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
}

export default function CoopSupplyListItemDetailPanel({
  item,
  colorLegend,
  C,
  theme,
  onClose,
  onSave,
  onRemove,
  onDirtyChange,
  canRemove,
}: CoopSupplyListItemDetailPanelProps) {
  const [draftItem, setDraftItem] = useState<CoopSupplyListItem>(() => ({ ...item }));
  const [savedItem, setSavedItem] = useState<CoopSupplyListItem>(() => ({ ...item }));
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [familyNameDraft, setFamilyNameDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftItem({ ...item });
    setSavedItem({ ...item });
    setFamilyNameDraft("");
  }, [item]);

  const isDirty = useMemo(
    () => !areCoopSupplyItemsEqual(draftItem, savedItem),
    [draftItem, savedItem],
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const itemTypeOptions = useMemo(
    () =>
      SUPPLY_ITEM_TYPE_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [],
  );

  const usageTimingOptions = useMemo(
    () =>
      SUPPLY_USAGE_TIMING_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [],
  );

  const colorCategoryOptions = useMemo(
    () => [
      { value: "", label: "None" },
      ...colorLegend.map((entry) => ({
        value: entry.id,
        label: entry.label.trim() || entry.id,
      })),
    ],
    [colorLegend],
  );

  const updateDraft = (patch: Partial<CoopSupplyListItem>) => {
    setDraftItem((current) => ({ ...current, ...patch }));
  };

  const atFamilyLimit = draftItem.assignedFamilies.length >= COOP_SUPPLY_MAX_ASSIGNED_FAMILIES;

  const addAssignedFamily = () => {
    if (!canAddSupplyAssignedFamily(draftItem.assignedFamilies, familyNameDraft)) {
      return;
    }
    const normalized = normalizeSupplyFamilyName(familyNameDraft);
    updateDraft({
      assignedFamilies: [...draftItem.assignedFamilies, normalized],
    });
    setFamilyNameDraft("");
  };

  const removeAssignedFamily = (familyName: string) => {
    updateDraft({
      assignedFamilies: draftItem.assignedFamilies.filter((family) => family !== familyName),
    });
  };

  const toggleMonth = (month: string) => {
    const nextMonths = draftItem.months.includes(month)
      ? draftItem.months.filter((value) => value !== month)
      : [...draftItem.months, month];
    updateDraft({ months: nextMonths });
  };

  const requestClose = () => {
    if (!isDirty) {
      onClose();
      return;
    }
    setDiscardDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draftItem);
      setSavedItem({ ...draftItem });
      adminToast.success("Supply item saved");
    } catch {
      // Parent surfaces persistence errors.
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDiscard = () => {
    setDiscardDialogOpen(false);
    onClose();
  };

  const handleConfirmRemove = () => {
    setRemoveDialogOpen(false);
    onRemove();
  };

  const displayName = supplyItemDisplayName(draftItem);
  const colorEntry = getSupplyColorLegendEntry(colorLegend, draftItem.colorId);
  const isPriceFree = draftItem.estimatedPrice.mode === "free";
  const isPriceRange = draftItem.estimatedPrice.mode === "range";
  const priceRangeDollars = supplyPriceRangeDollars(draftItem.estimatedPrice);

  const handleFreeToggle = (checked: boolean) => {
    updateDraft({
      estimatedPrice: checked ? { mode: "free" } : { mode: "unset" },
    });
  };

  const handleRangeToggle = (checked: boolean) => {
    const current = draftItem.estimatedPrice;
    if (checked) {
      if (current.mode === "single") {
        updateDraft({
          estimatedPrice: {
            mode: "range",
            minCents: current.cents,
            maxCents: current.cents,
          },
        });
      } else {
        updateDraft({ estimatedPrice: { mode: "range", minCents: 0, maxCents: 0 } });
      }
      return;
    }

    if (current.mode === "range" && current.minCents > 0) {
      updateDraft({ estimatedPrice: { mode: "single", cents: current.minCents } });
    } else {
      updateDraft({ estimatedPrice: { mode: "unset" } });
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(34,48,44,0.47)" }}
          onClick={requestClose}
          aria-hidden="true"
        />
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,44rem)] max-w-full flex-col overflow-hidden"
          style={{
            backgroundColor: "#F8FAF8",
            borderLeft: "1px solid #E0E8E0",
            boxShadow: "0 -18px 45px rgba(26,47,37,0.2)",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="flex flex-shrink-0 items-start justify-between gap-3 bg-white px-[21px] py-[17px]"
            style={{ borderBottom: "1px solid #E0E8E0" }}
          >
            <div className="min-w-0 flex-1">
              <AdminSectionKicker theme={theme}>Supply item</AdminSectionKicker>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <AdminDisplayHeading theme={theme} as="h2" size="section" className="truncate">
                  {displayName}
                </AdminDisplayHeading>
                <AdminChip theme={theme} tone={supplyItemTypeChipTone(draftItem.itemType)}>
                  {supplyItemTypeLabel(draftItem.itemType)}
                </AdminChip>
              </div>
              <p className="mt-1 text-[11px]" style={{ color: theme.muted }}>
                Qty {formatSupplyQuantity(draftItem)}
                <span className="mx-1.5 opacity-50">·</span>
                {draftItem.estimatedPrice.mode === "single" ||
                draftItem.estimatedPrice.mode === "range"
                  ? `${formatSupplyEstimatedPrice(draftItem.estimatedPrice)} each`
                  : draftItem.estimatedPrice.mode === "free"
                    ? "Free"
                    : "No price set"}
                {colorEntry ? (
                  <>
                    <span className="mx-1.5 opacity-50">·</span>
                    {colorEntry.label}
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <AdminButton
                theme={theme}
                variant="danger"
                size="compact"
                onClick={() => setRemoveDialogOpen(true)}
                disabled={!canRemove}
              >
                Remove item
              </AdminButton>
              <AdminButton
                theme={theme}
                variant="soft"
                size="compact"
                onClick={requestClose}
                aria-label="Close"
              >
                Close ×
              </AdminButton>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-[21px] py-5">
            <div className="space-y-3">
              <BuilderQuestionCard
                C={C}
                tone="accent"
                question="What is this supply item called?"
                helper="e.g. Glue sticks (24-pack)"
              >
                <input
                  type="text"
                  value={draftItem.name}
                  onChange={(event) => updateDraft({ name: event.target.value })}
                  placeholder="e.g. Glue sticks (24-pack)"
                  style={controlStyle(C)}
                />
              </BuilderQuestionCard>

              <BuilderQuestionCard
                C={C}
                tone="clay"
                question="Is this consumable, reusable, or both?"
                helper="How families should treat this item throughout the year."
              >
                <SchoolAdminSelect
                  C={C}
                  value={draftItem.itemType}
                  onChange={(value) =>
                    updateDraft({ itemType: value as CoopSupplyListItem["itemType"] })
                  }
                  options={itemTypeOptions}
                  ariaLabel="Item type"
                />
              </BuilderQuestionCard>

              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <BuilderQuestionCard
                    C={C}
                    tone="info"
                    question="How many are needed?"
                    helper="Total quantity for the co-op — add a unit if helpful (sets, sheets, per child)."
                  >
                    <div className="space-y-2">
                      <input
                        type="number"
                        min={1}
                        value={draftItem.quantity}
                        onChange={(event) => {
                          const next = Number.parseInt(event.target.value, 10);
                          updateDraft({
                            quantity: Number.isFinite(next) && next >= 1 ? next : 1,
                          });
                        }}
                        className="w-full"
                        style={controlStyle(C)}
                      />
                      <input
                        type="text"
                        value={draftItem.quantityLabel}
                        onChange={(event) =>
                          updateDraft({ quantityLabel: event.target.value })
                        }
                        placeholder="e.g. sets, sheets, per child"
                        style={controlStyle(C)}
                      />
                    </div>
                  </BuilderQuestionCard>
                </div>

                <div className="min-w-0">
                  <BuilderQuestionCard
                    C={C}
                    tone="info"
                    question="What's the estimated price per unit?"
                    helper="Optional — enter a price, a min–max range, or mark as free."
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <label
                          className="inline-flex min-h-[36px] flex-1 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium"
                          style={{ color: C.textPrimary }}
                        >
                          <input
                            type="checkbox"
                            checked={isPriceFree}
                            onChange={(event) => handleFreeToggle(event.target.checked)}
                            className="h-5 w-5 shrink-0 rounded"
                            style={{ accentColor: C.accent }}
                          />
                          Free
                        </label>
                        <label
                          className="inline-flex min-h-[36px] flex-1 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium"
                          style={{
                            color: isPriceFree ? C.textTertiary : C.textPrimary,
                            cursor: isPriceFree ? "not-allowed" : "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isPriceRange}
                            disabled={isPriceFree}
                            onChange={(event) => handleRangeToggle(event.target.checked)}
                            className="h-5 w-5 shrink-0 rounded disabled:cursor-not-allowed"
                            style={{ accentColor: C.accent }}
                          />
                          Price range
                        </label>
                      </div>

                      {!isPriceFree ? (
                        isPriceRange ? (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={priceRangeDollars.min}
                              onChange={(event) =>
                                updateDraft({
                                  estimatedPrice: buildSupplyRangePrice(
                                    event.target.value,
                                    priceRangeDollars.max,
                                  ),
                                })
                              }
                              placeholder="Min"
                              style={controlStyle(C)}
                            />
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={priceRangeDollars.max}
                              onChange={(event) =>
                                updateDraft({
                                  estimatedPrice: buildSupplyRangePrice(
                                    priceRangeDollars.min,
                                    event.target.value,
                                  ),
                                })
                              }
                              placeholder="Max"
                              style={controlStyle(C)}
                            />
                          </div>
                        ) : (
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={supplyPriceSingleDollars(draftItem.estimatedPrice)}
                            onChange={(event) =>
                              updateDraft({
                                estimatedPrice: buildSupplySinglePrice(event.target.value),
                              })
                            }
                            placeholder="0.00"
                            style={controlStyle(C)}
                          />
                        )
                      ) : null}
                    </div>
                  </BuilderQuestionCard>
                </div>
              </div>

              <BuilderQuestionCard
                C={C}
                tone="success"
                question="Where should families buy this?"
                helper="Store, link, or general guidance."
              >
                <input
                  type="text"
                  value={draftItem.whereToBuy}
                  onChange={(event) => updateDraft({ whereToBuy: event.target.value })}
                  placeholder="e.g. Costco, Amazon"
                  style={controlStyle(C)}
                />
              </BuilderQuestionCard>

              <BuilderQuestionCard
                C={C}
                tone="warning"
                question="When is this supply needed?"
                helper="Year-round or specific months."
              >
                <SchoolAdminSelect
                  C={C}
                  value={draftItem.usageTiming}
                  onChange={(value) =>
                    updateDraft({
                      usageTiming: value as CoopSupplyListItem["usageTiming"],
                      months: value === "year_round" ? [] : draftItem.months,
                    })
                  }
                  options={usageTimingOptions}
                  ariaLabel="When used"
                />
              </BuilderQuestionCard>

              {draftItem.usageTiming === "specific_months" ? (
                <BuilderQuestionCard
                  C={C}
                  tone="warning"
                  question="Which months apply?"
                  helper="Select every month this supply is needed."
                >
                  <div className="flex flex-wrap gap-1.5">
                    {COOP_SUPPLY_MONTH_OPTIONS.map((month) => {
                      const active = draftItem.months.includes(month);
                      return (
                        <button
                          key={month}
                          type="button"
                          onClick={() => toggleMonth(month)}
                          className="rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors"
                          style={{
                            backgroundColor: active ? theme.primarySoft : C.bg,
                            color: active ? theme.primary : C.textSecondary,
                            border: `1px solid ${active ? theme.primary : C.border}`,
                          }}
                        >
                          {month}
                        </button>
                      );
                    })}
                  </div>
                </BuilderQuestionCard>
              ) : null}

              <BuilderQuestionCard
                C={C}
                tone="accent"
                question="Which families are signed up to provide this?"
                helper="Add up to 5 family names. Leave empty until a parent claims it."
              >
                <div className="space-y-3">
                  {draftItem.assignedFamilies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {draftItem.assignedFamilies.map((familyName) => (
                        <span
                          key={familyName}
                          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium"
                          style={{
                            borderColor: C.border,
                            backgroundColor: C.bg,
                            color: C.textPrimary,
                          }}
                        >
                          {familyName}
                          <button
                            type="button"
                            onClick={() => removeAssignedFamily(familyName)}
                            className="inline-flex rounded p-0.5 transition-colors hover:opacity-70"
                            style={{ color: C.textTertiary }}
                            aria-label={`Remove ${familyName}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                    <input
                      type="text"
                      value={familyNameDraft}
                      onChange={(event) => setFamilyNameDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addAssignedFamily();
                        }
                      }}
                      placeholder="Family name"
                      disabled={atFamilyLimit}
                      className="sm:flex-1"
                      style={controlStyle(C)}
                    />
                    <button
                      type="button"
                      onClick={addAssignedFamily}
                      disabled={
                        atFamilyLimit ||
                        !canAddSupplyAssignedFamily(
                          draftItem.assignedFamilies,
                          familyNameDraft,
                        )
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-1 px-3 py-2 text-xs font-medium disabled:opacity-50"
                      style={{
                        backgroundColor: C.accentLight,
                        color: C.accent,
                        border: `1px solid ${C.secondaryBtnBorder}`,
                        borderRadius: C.r.md,
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>

                  {atFamilyLimit ? (
                    <p className="text-[11px]" style={{ color: C.textTertiary }}>
                      Maximum of 5 families reached.
                    </p>
                  ) : null}
                </div>
              </BuilderQuestionCard>

              <BuilderQuestionCard
                C={C}
                tone="clay"
                question="Does this item belong to a color category?"
                helper="Optional — matches your legend above the list."
              >
                <SchoolAdminSelect
                  C={C}
                  value={draftItem.colorId ?? ""}
                  onChange={(value) => updateDraft({ colorId: value || null })}
                  options={colorCategoryOptions}
                  ariaLabel="Color category"
                />
                {colorEntry ? (
                  <div
                    className="mt-2 rounded-md border px-3 py-2 text-xs"
                    style={{
                      borderColor: C.border,
                      backgroundColor: `${colorEntry.hex}18`,
                      color: C.textSecondary,
                    }}
                  >
                    Row preview: {colorEntry.label}
                  </div>
                ) : null}
              </BuilderQuestionCard>
            </div>
          </div>

          <div
            className="flex flex-shrink-0 justify-end bg-white px-[21px] py-4"
            style={{ borderTop: "1px solid #E0E8E0" }}
          >
            <AdminButton
              theme={theme}
              variant="primary"
              size="compact"
              onClick={handleSave}
              disabled={!isDirty || saving}
            >
              Save changes
            </AdminButton>
          </div>
        </motion.div>
      </motion.div>

      <ConfirmDialog
        C={C}
        open={discardDialogOpen}
        title="Unsaved changes"
        description="You have unsaved changes. If you close now, your changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={handleConfirmDiscard}
        onClose={() => setDiscardDialogOpen(false)}
      />

      <ConfirmDialog
        C={C}
        open={removeDialogOpen}
        title="Remove this supply item?"
        description="This item will be removed from the supply list. This cannot be undone."
        confirmLabel="Remove item"
        variant="destructive"
        onConfirm={handleConfirmRemove}
        onClose={() => setRemoveDialogOpen(false)}
      />
    </>
  );
}
