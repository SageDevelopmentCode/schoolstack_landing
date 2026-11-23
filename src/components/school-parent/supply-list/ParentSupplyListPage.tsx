"use client";

import { ClipboardList, Eye, SearchX } from "lucide-react";
import CoopSupplyListFilterBar from "@/components/admissions/CoopSupplyListFilterBar";
import ParentCoopSupplyListItemDetailPanel from "@/components/school-parent/supply-list/ParentCoopSupplyListItemDetailPanel";
import ParentSupplyListMobileItemCard from "@/components/school-parent/supply-list/ParentSupplyListMobileItemCard";
import ParentSupplyListSignupButton, {
  SupplyTypeChip,
} from "@/components/school-parent/supply-list/ParentSupplyListSignupButton";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { G_TABLE, G_TD, G_TH, gRowClass } from "@/components/school-parent/garden/fields";
import { GCard, GIcon, GKicker, GStatTile, G_FOCUS } from "@/components/school-parent/garden/ui";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import {
  formatSupplyAssignedFamilies,
  formatSupplyEstimatedPrice,
  formatSupplyQuantity,
  getSupplyColorLegendEntry,
  supplyItemDisplayName,
  supplyUsageTimingLabel,
  type CoopSupplyColorLegendEntry,
  type CoopSupplyListItem,
} from "@/lib/admissions/program-coop-supply-list-mock";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import { useParentSupplyListModel } from "./useParentSupplyListModel";

type ParentSupplyListPageProps = {
  organizationId: string;
  programId: string;
  initialItems: CoopSupplyListItem[];
  initialLegend: CoopSupplyColorLegendEntry[];
  currentFamilyId: string;
  currentFamilyLabel: string;
  familyNameMap: Record<string, string>;
  previewMode?: boolean;
};

const TABLE_HEADINGS = ["Item", "Type", "When", "Qty", "Est. price", "Parents", "Where to buy", "Sign up"] as const;

/**
 * Parent co-op Supply list (Garden): summary strip, filter card, then every
 * item in one card (table from md, rows on phones). Rows open the item
 * drawer, which is the only place to remove a sign-up. Preview shows
 * everything with sign-ups disabled.
 */
export default function ParentSupplyListPage({
  organizationId,
  programId,
  initialItems,
  initialLegend,
  currentFamilyId,
  currentFamilyLabel,
  familyNameMap,
  previewMode = false,
}: ParentSupplyListPageProps) {
  const { theme } = useParentTheme();
  const model = useParentSupplyListModel({
    organizationId,
    programId,
    initialItems,
    currentFamilyId,
    familyNameMap,
    previewMode,
  });
  const { filteredItems, familyNames } = model;
  const colorFor = (item: CoopSupplyListItem) => getSupplyColorLegendEntry(initialLegend, item.colorId)?.hex ?? null;

  return (
    <>
      <ParentGardenFrame theme={theme}>
        <div className={PORTAL_HOME_CONTAINER_CLASS} data-testid="parent-coop-supply-list-ready">
          <ParentGardenPageHeader
            kicker="Co-op"
            title={
              <>
                Supply <span className="text-[var(--sf-clay)]">list</span>
              </>
            }
            subtitle="Review shared supplies for the year and sign up for items your family can bring."
            data-testid="parent-coop-supply-list-header"
          />

          {previewMode ? (
            <p className="m-0 -mt-3 flex w-fit items-center gap-2 rounded-[12px] bg-[var(--sf-sky)] px-3 py-2 text-[12px] font-extrabold text-[#24507a]">
              <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Preview mode — items can be opened but not signed up for here.
            </p>
          ) : null}

          <GCard index={1} kicker="At a glance" className="overflow-hidden" bodyClassName="-mx-5 -mb-5 sm:-mx-6 sm:-mb-6">
            <div className="grid grid-cols-2 border-t-[1.5px] border-[var(--sf-ink)]/10 sm:grid-cols-4 sm:divide-x-[1.5px] sm:divide-[var(--sf-ink)]/10">
              <div className="border-b-[1.5px] border-r-[1.5px] border-[var(--sf-ink)]/10 sm:border-0">
                <GStatTile value={model.summary.itemCount} label={model.summary.itemCount === 1 ? "Item" : "Items"} />
              </div>
              <div className="border-b-[1.5px] border-[var(--sf-ink)]/10 sm:border-0">
                <GStatTile value={model.summary.assignedCount} label="With sign-ups" />
              </div>
              <div className="border-r-[1.5px] border-[var(--sf-ink)]/10 sm:border-0">
                <GStatTile
                  value={model.mySignupCount}
                  label={model.mySignupCount === 1 ? "Your sign-up" : "Your sign-ups"}
                  accent={model.mySignupCount > 0}
                />
              </div>
              <div className="flex flex-col items-start justify-center gap-1 px-5 py-4">
                <GKicker>Signed up as</GKicker>
                <span className="text-[15px] font-extrabold text-[var(--sf-ink)]">{currentFamilyLabel}</span>
              </div>
            </div>
          </GCard>

          <CoopSupplyListFilterBar
            variant="parent"
            filters={model.filters}
            onChange={model.setFilters}
            colorLegend={initialLegend}
            theme={theme}
            resultCount={filteredItems.length}
            totalCount={model.items.length}
          />

          <GCard index={3} kicker="Supplies" title="Everything the co-op needs" data-testid="parent-supply-list-items">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-start gap-3 rounded-[18px] bg-[var(--sf-paper)] p-5 sm:flex-row sm:items-center">
                <GIcon>{model.items.length === 0 ? <ClipboardList /> : <SearchX />}</GIcon>
                <p className="m-0 text-[15px] font-semibold text-[var(--sf-soft)]">
                  {model.items.length === 0
                    ? "No supply items have been added yet."
                    : "No supply items match the current filters."}
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2.5 md:hidden">
                  {filteredItems.map((item) => (
                    <ParentSupplyListMobileItemCard
                      key={item.id}
                      item={item}
                      colorHex={colorFor(item)}
                      currentFamilyId={currentFamilyId}
                      previewMode={previewMode}
                      pendingAction={model.pendingAction}
                      isSelected={item.id === model.selectedItemId}
                      onSelect={() => model.openItem(item.id)}
                      onSignUp={() => model.claim(item.id)}
                    />
                  ))}
                </div>

                <div className="-mx-5 hidden overflow-x-auto px-5 sm:-mx-6 sm:px-6 md:block">
                  <table className={`${G_TABLE} min-w-[980px]`}>
                    <thead>
                      <tr>
                        {TABLE_HEADINGS.map((heading) => (
                          <th key={heading} scope="col" className={G_TH}>
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => {
                        const colorHex = colorFor(item);
                        const parents = formatSupplyAssignedFamilies(item.assignedFamilyIds, familyNames);
                        return (
                          <tr
                            key={item.id}
                            onClick={() => model.openItem(item.id)}
                            className={gRowClass({ interactive: true, selected: item.id === model.selectedItemId })}
                          >
                            <td
                              className={`${G_TD} min-w-[200px] border-l-[4px]`}
                              style={{ borderLeftColor: colorHex ?? "transparent" }}
                            >
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  model.openItem(item.id);
                                }}
                                aria-haspopup="dialog"
                                className={`rounded-md text-left text-[14px] font-extrabold text-[var(--sf-ink)] hover:underline hover:decoration-2 hover:underline-offset-4 ${G_FOCUS}`}
                              >
                                {supplyItemDisplayName(item)}
                              </button>
                            </td>
                            <td className={G_TD}>
                              <SupplyTypeChip type={item.itemType} />
                            </td>
                            <td className={`${G_TD} min-w-[110px] text-[13px] font-semibold text-[var(--sf-soft)]`}>
                              {supplyUsageTimingLabel(item)}
                            </td>
                            <td className={`${G_TD} whitespace-nowrap text-[13px] font-semibold text-[var(--sf-soft)]`}>
                              {formatSupplyQuantity(item)}
                            </td>
                            <td className={`${G_TD} whitespace-nowrap text-[13px] font-semibold text-[var(--sf-soft)]`}>
                              {formatSupplyEstimatedPrice(item.estimatedPrice)}
                            </td>
                            <td className={`${G_TD} max-w-[180px]`}>
                              <div
                                className="truncate text-[13px] font-semibold text-[var(--sf-soft)]"
                                title={item.assignedFamilyIds.length > 0 ? parents : undefined}
                              >
                                {parents}
                              </div>
                            </td>
                            <td className={`${G_TD} max-w-[180px]`}>
                              <div
                                className="truncate text-[13px] font-semibold text-[var(--sf-soft)]"
                                title={item.whereToBuy || undefined}
                              >
                                {item.whereToBuy.trim() || "—"}
                              </div>
                            </td>
                            <td className={G_TD}>
                              <ParentSupplyListSignupButton
                                item={item}
                                currentFamilyId={currentFamilyId}
                                previewMode={previewMode}
                                pendingAction={model.pendingAction}
                                onSignUp={() => model.claim(item.id)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </GCard>
        </div>
      </ParentGardenFrame>

      <ParentCoopSupplyListItemDetailPanel
        item={model.selectedItem}
        colorLegend={initialLegend}
        theme={theme}
        currentFamilyId={currentFamilyId}
        familyNameMap={familyNames}
        previewMode={previewMode}
        pendingAction={model.pendingAction}
        onClose={model.closeItem}
        onClaim={() => model.selectedItem && model.claim(model.selectedItem.id)}
        onUnclaim={() => model.selectedItem && model.unclaim(model.selectedItem.id)}
      />
    </>
  );
}
