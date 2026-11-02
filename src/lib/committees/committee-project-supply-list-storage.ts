import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  defaultCoopSupplyColorLegend,
  type CoopSupplyColorLegendEntry,
  type CoopSupplyListItem,
} from "@/lib/admissions/program-coop-supply-list-mock";
import { logCommitteeActivityForPortal } from "@/lib/committees/committee-activity-client";
import { logCommitteeActivityEvent } from "@/lib/committees/committee-activity-log";
import {
  COMMITTEE_PROJECT_SUPPLY_COLOR_LEGEND_SELECT,
  COMMITTEE_PROJECT_SUPPLY_ITEM_SELECT,
  mapSupplyColorLegendRow,
  mapSupplyItemRow,
  type CommitteeProjectSupplyColorLegendRow,
  type CommitteeProjectSupplyItemRow,
} from "@/lib/committees/committee-project-mappers";
import { supplyItemDisplayName } from "@/lib/admissions/program-coop-supply-list-mock";

export type CommitteeProjectSupplyListContext = {
  organizationId: string;
  committeeId: string;
  projectId: string;
  committeesApiBase?: string;
  createdByMemberId?: string | null;
};

function itemToRow(
  item: CoopSupplyListItem,
  ctx: CommitteeProjectSupplyListContext,
  sortOrder: number,
) {
  return {
    id: item.id,
    project_id: ctx.projectId,
    organization_id: ctx.organizationId,
    name: item.name,
    item_type: item.itemType,
    usage_timing: item.usageTiming,
    months: item.months,
    color_id: item.colorId,
    assigned_member_ids: item.assignedFamilyIds,
    where_to_buy: item.whereToBuy,
    quantity: item.quantity,
    quantity_label: item.quantityLabel,
    estimated_price: item.estimatedPrice,
    sort_order: sortOrder,
  };
}

async function nextItemSortOrder(
  supabase: SupabaseClient,
  projectId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("committee_project_supply_items")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!data?.length) return 0;
  return (data[0] as { sort_order: number }).sort_order + 1;
}

export async function listCommitteeProjectSupplyList(
  supabase: SupabaseClient,
  projectId: string,
): Promise<{ items: CoopSupplyListItem[]; colorLegend: CoopSupplyColorLegendEntry[] }> {
  const [legendResult, itemsResult] = await Promise.all([
    supabase
      .from("committee_project_supply_color_legend")
      .select(COMMITTEE_PROJECT_SUPPLY_COLOR_LEGEND_SELECT)
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("committee_project_supply_items")
      .select(COMMITTEE_PROJECT_SUPPLY_ITEM_SELECT)
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (legendResult.error) throw legendResult.error;
  if (itemsResult.error) throw itemsResult.error;

  const legendRows = (legendResult.data ?? []) as CommitteeProjectSupplyColorLegendRow[];
  const colorLegend =
    legendRows.length > 0
      ? legendRows.map(mapSupplyColorLegendRow)
      : defaultCoopSupplyColorLegend();

  const items = ((itemsResult.data ?? []) as CommitteeProjectSupplyItemRow[]).map(
    mapSupplyItemRow,
  );

  return { items, colorLegend };
}

async function loadProjectNameForSupplyLog(
  supabase: SupabaseClient,
  projectId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("committee_projects")
    .select("name")
    .eq("id", projectId)
    .maybeSingle();

  if (error || !data?.name) return null;
  const name = String(data.name).trim();
  return name || null;
}

function logSupplyActivity(
  supabase: SupabaseClient,
  ctx: CommitteeProjectSupplyListContext,
  action: string,
  item: CoopSupplyListItem,
  summary: string,
  projectName: string | null,
) {
  const metadata = {
    projectId: ctx.projectId,
    ...(projectName ? { projectName } : {}),
    supplyItemName: supplyItemDisplayName(item),
  };

  if (
    ctx.committeesApiBase &&
    action === ACTIVITY_ACTIONS.COMMITTEE_PROJECT_SUPPLY_CREATED
  ) {
    logCommitteeActivityForPortal(ctx.committeesApiBase, {
      organizationId: ctx.organizationId,
      committeeId: ctx.committeeId,
      action,
      entityType: "committee_project_supply_item",
      entityId: item.id,
      summary,
      metadata,
      actor: ctx.createdByMemberId
        ? { type: "parent", memberId: ctx.createdByMemberId }
        : undefined,
    });
    return;
  }

  logCommitteeActivityEvent(supabase, {
    committeeId: ctx.committeeId,
    organizationId: ctx.organizationId,
    action,
    entityType: "committee_project_supply_item",
    entityId: item.id,
    summary,
    metadata,
    actor: ctx.createdByMemberId
      ? { type: "parent", memberId: ctx.createdByMemberId }
      : undefined,
  });
}

export async function insertCommitteeProjectSupplyItem(
  supabase: SupabaseClient,
  ctx: CommitteeProjectSupplyListContext,
  item: CoopSupplyListItem,
): Promise<CoopSupplyListItem> {
  const sortOrder = await nextItemSortOrder(supabase, ctx.projectId);

  const { data, error } = await supabase
    .from("committee_project_supply_items")
    .insert(itemToRow(item, ctx, sortOrder))
    .select(COMMITTEE_PROJECT_SUPPLY_ITEM_SELECT)
    .single();

  if (error) throw error;
  const mapped = mapSupplyItemRow(data as CommitteeProjectSupplyItemRow);
  const projectName = await loadProjectNameForSupplyLog(supabase, ctx.projectId);

  logSupplyActivity(
    supabase,
    ctx,
    ACTIVITY_ACTIONS.COMMITTEE_PROJECT_SUPPLY_CREATED,
    mapped,
    `Supply item "${supplyItemDisplayName(mapped)}" was added`,
    projectName,
  );

  return mapped;
}

export async function saveCommitteeProjectSupplyItem(
  supabase: SupabaseClient,
  ctx: CommitteeProjectSupplyListContext,
  item: CoopSupplyListItem,
): Promise<CoopSupplyListItem> {
  const { data: existing, error: existingError } = await supabase
    .from("committee_project_supply_items")
    .select("sort_order")
    .eq("id", item.id)
    .eq("project_id", ctx.projectId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) throw new Error("Supply item not found.");

  const sortOrder = (existing as { sort_order: number }).sort_order;

  const { data, error } = await supabase
    .from("committee_project_supply_items")
    .update(itemToRow(item, ctx, sortOrder))
    .eq("id", item.id)
    .eq("project_id", ctx.projectId)
    .select(COMMITTEE_PROJECT_SUPPLY_ITEM_SELECT)
    .single();

  if (error) throw error;
  const mapped = mapSupplyItemRow(data as CommitteeProjectSupplyItemRow);
  const projectName = await loadProjectNameForSupplyLog(supabase, ctx.projectId);

  logSupplyActivity(
    supabase,
    ctx,
    ACTIVITY_ACTIONS.COMMITTEE_PROJECT_SUPPLY_UPDATED,
    mapped,
    `Supply item "${supplyItemDisplayName(mapped)}" was updated`,
    projectName,
  );

  return mapped;
}

export async function deleteCommitteeProjectSupplyItem(
  supabase: SupabaseClient,
  ctx: CommitteeProjectSupplyListContext,
  itemId: string,
  itemName?: string,
): Promise<void> {
  const { error } = await supabase
    .from("committee_project_supply_items")
    .delete()
    .eq("id", itemId)
    .eq("project_id", ctx.projectId);

  if (error) throw error;

  const projectName = await loadProjectNameForSupplyLog(supabase, ctx.projectId);
  const displayName = itemName?.trim() || "Item";

  logSupplyActivity(
    supabase,
    ctx,
    ACTIVITY_ACTIONS.COMMITTEE_PROJECT_SUPPLY_DELETED,
    { id: itemId, name: displayName } as CoopSupplyListItem,
    `Supply item "${displayName}" was removed`,
    projectName,
  );
}

export async function replaceCommitteeProjectSupplyColorLegend(
  supabase: SupabaseClient,
  ctx: CommitteeProjectSupplyListContext,
  legend: ReadonlyArray<CoopSupplyColorLegendEntry>,
): Promise<CoopSupplyColorLegendEntry[]> {
  const { data, error } = await supabase.rpc("replace_committee_project_supply_color_legend", {
    p_project_id: ctx.projectId,
    p_organization_id: ctx.organizationId,
    p_legend: legend.map((entry) => ({
      id: entry.id,
      hex: entry.hex,
      label: entry.label,
    })),
  });

  if (error) throw error;
  return ((data ?? []) as CommitteeProjectSupplyColorLegendRow[]).map(mapSupplyColorLegendRow);
}
