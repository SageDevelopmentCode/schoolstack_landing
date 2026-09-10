import type { SupabaseClient } from "@supabase/supabase-js";
import {
  canAddSupplyAssignedFamily,
  defaultCoopSupplyColorLegend,
  newCoopSupplyListItem,
  normalizeSupplyFamilyName,
  type CoopSupplyColorLegendEntry,
  type CoopSupplyEstimatedPrice,
  type CoopSupplyListItem,
  type SupplyItemType,
  type SupplyUsageTiming,
} from "./program-coop-supply-list-mock";

export type ProgramCoopSupplyListContext = {
  organizationId: string;
  programId: string;
};

type ProgramCoopSupplyColorLegendRow = {
  id: string;
  program_id: string;
  organization_id: string;
  color_id: string;
  hex: string;
  label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type ProgramCoopSupplyItemRow = {
  id: string;
  program_id: string;
  organization_id: string;
  name: string;
  item_type: SupplyItemType;
  usage_timing: SupplyUsageTiming;
  months: string[];
  color_id: string | null;
  assigned_families: string[];
  where_to_buy: string;
  quantity: number;
  quantity_label: string;
  estimated_price: CoopSupplyEstimatedPrice;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const COLOR_LEGEND_SELECT =
  "id, program_id, organization_id, color_id, hex, label, sort_order, created_at, updated_at";

const ITEM_SELECT =
  "id, program_id, organization_id, name, item_type, usage_timing, months, color_id, assigned_families, where_to_buy, quantity, quantity_label, estimated_price, sort_order, created_at, updated_at";

function mapColorLegendRow(row: ProgramCoopSupplyColorLegendRow): CoopSupplyColorLegendEntry {
  return {
    id: row.color_id,
    hex: row.hex,
    label: row.label,
  };
}

function mapItemRow(row: ProgramCoopSupplyItemRow): CoopSupplyListItem {
  return {
    id: row.id,
    name: row.name,
    itemType: row.item_type,
    usageTiming: row.usage_timing,
    months: row.months ?? [],
    colorId: row.color_id,
    assignedFamilies: row.assigned_families ?? [],
    whereToBuy: row.where_to_buy,
    quantity: row.quantity,
    quantityLabel: row.quantity_label,
    estimatedPrice: row.estimated_price ?? { mode: "unset" },
  };
}

function itemToInsertRow(
  item: CoopSupplyListItem,
  ctx: ProgramCoopSupplyListContext,
  sortOrder: number,
) {
  return {
    id: item.id,
    program_id: ctx.programId,
    organization_id: ctx.organizationId,
    name: item.name,
    item_type: item.itemType,
    usage_timing: item.usageTiming,
    months: item.months,
    color_id: item.colorId,
    assigned_families: item.assignedFamilies,
    where_to_buy: item.whereToBuy,
    quantity: item.quantity,
    quantity_label: item.quantityLabel,
    estimated_price: item.estimatedPrice,
    sort_order: sortOrder,
  };
}

async function nextItemSortOrder(
  supabase: SupabaseClient,
  programId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("program_coop_supply_items")
    .select("sort_order")
    .eq("program_id", programId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!data?.length) return 0;
  return (data[0] as { sort_order: number }).sort_order + 1;
}

export async function listProgramCoopSupplyList(
  supabase: SupabaseClient,
  programId: string,
): Promise<{ items: CoopSupplyListItem[]; colorLegend: CoopSupplyColorLegendEntry[] }> {
  const [legendResult, itemsResult] = await Promise.all([
    supabase
      .from("program_coop_supply_color_legend")
      .select(COLOR_LEGEND_SELECT)
      .eq("program_id", programId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("program_coop_supply_items")
      .select(ITEM_SELECT)
      .eq("program_id", programId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (legendResult.error) throw legendResult.error;
  if (itemsResult.error) throw itemsResult.error;

  const legendRows = (legendResult.data ?? []) as ProgramCoopSupplyColorLegendRow[];
  const colorLegend =
    legendRows.length > 0
      ? legendRows.map(mapColorLegendRow)
      : defaultCoopSupplyColorLegend();

  const items = ((itemsResult.data ?? []) as ProgramCoopSupplyItemRow[]).map(mapItemRow);

  return { items, colorLegend };
}

export async function insertProgramCoopSupplyItem(
  supabase: SupabaseClient,
  ctx: ProgramCoopSupplyListContext,
  partial?: Partial<CoopSupplyListItem>,
): Promise<CoopSupplyListItem> {
  const base = newCoopSupplyListItem();
  const item: CoopSupplyListItem = {
    ...base,
    ...partial,
    id: crypto.randomUUID(),
  };
  const sortOrder = await nextItemSortOrder(supabase, ctx.programId);

  const { data, error } = await supabase
    .from("program_coop_supply_items")
    .insert(itemToInsertRow(item, ctx, sortOrder))
    .select(ITEM_SELECT)
    .single();

  if (error) throw error;
  return mapItemRow(data as ProgramCoopSupplyItemRow);
}

export async function upsertProgramCoopSupplyItem(
  supabase: SupabaseClient,
  ctx: ProgramCoopSupplyListContext,
  item: CoopSupplyListItem,
): Promise<CoopSupplyListItem> {
  const { data: existing, error: existingError } = await supabase
    .from("program_coop_supply_items")
    .select("sort_order")
    .eq("id", item.id)
    .maybeSingle();

  if (existingError) throw existingError;

  const sortOrder =
    existing && typeof (existing as { sort_order: number }).sort_order === "number"
      ? (existing as { sort_order: number }).sort_order
      : await nextItemSortOrder(supabase, ctx.programId);

  const { data, error } = await supabase
    .from("program_coop_supply_items")
    .upsert(itemToInsertRow(item, ctx, sortOrder), { onConflict: "id" })
    .select(ITEM_SELECT)
    .single();

  if (error) throw error;
  return mapItemRow(data as ProgramCoopSupplyItemRow);
}

export async function getProgramCoopSupplyItem(
  supabase: SupabaseClient,
  ctx: ProgramCoopSupplyListContext,
  itemId: string,
): Promise<CoopSupplyListItem | null> {
  const { data, error } = await supabase
    .from("program_coop_supply_items")
    .select(ITEM_SELECT)
    .eq("id", itemId)
    .eq("program_id", ctx.programId)
    .eq("organization_id", ctx.organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapItemRow(data as ProgramCoopSupplyItemRow);
}

export async function appendProgramCoopSupplyAssignedFamily(
  supabase: SupabaseClient,
  ctx: ProgramCoopSupplyListContext,
  itemId: string,
  familyName: string,
): Promise<CoopSupplyListItem> {
  const item = await getProgramCoopSupplyItem(supabase, ctx, itemId);
  if (!item) {
    throw new Error("Supply item not found.");
  }
  if (!canAddSupplyAssignedFamily(item.assignedFamilies, familyName)) {
    throw new Error("This item cannot accept another sign-up.");
  }

  const normalized = normalizeSupplyFamilyName(familyName);
  return upsertProgramCoopSupplyItem(supabase, ctx, {
    ...item,
    assignedFamilies: [...item.assignedFamilies, normalized],
  });
}

export async function removeProgramCoopSupplyAssignedFamily(
  supabase: SupabaseClient,
  ctx: ProgramCoopSupplyListContext,
  itemId: string,
  familyName: string,
): Promise<CoopSupplyListItem> {
  const item = await getProgramCoopSupplyItem(supabase, ctx, itemId);
  if (!item) {
    throw new Error("Supply item not found.");
  }

  const normalized = normalizeSupplyFamilyName(familyName).toLowerCase();
  const assignedFamilies = item.assignedFamilies.filter(
    (family) => family.toLowerCase() !== normalized,
  );

  if (assignedFamilies.length === item.assignedFamilies.length) {
    throw new Error("You are not signed up for this item.");
  }

  return upsertProgramCoopSupplyItem(supabase, ctx, {
    ...item,
    assignedFamilies,
  });
}

export async function deleteProgramCoopSupplyItem(
  supabase: SupabaseClient,
  itemId: string,
): Promise<void> {
  const { error } = await supabase
    .from("program_coop_supply_items")
    .delete()
    .eq("id", itemId);

  if (error) throw error;
}

export async function replaceProgramCoopSupplyColorLegend(
  supabase: SupabaseClient,
  ctx: ProgramCoopSupplyListContext,
  legend: ReadonlyArray<CoopSupplyColorLegendEntry>,
): Promise<CoopSupplyColorLegendEntry[]> {
  const { error: deleteError } = await supabase
    .from("program_coop_supply_color_legend")
    .delete()
    .eq("program_id", ctx.programId);

  if (deleteError) throw deleteError;

  if (legend.length === 0) {
    return [];
  }

  const rows = legend.map((entry, index) => ({
    program_id: ctx.programId,
    organization_id: ctx.organizationId,
    color_id: entry.id,
    hex: entry.hex,
    label: entry.label,
    sort_order: index,
  }));

  const { data, error } = await supabase
    .from("program_coop_supply_color_legend")
    .insert(rows)
    .select(COLOR_LEGEND_SELECT)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ProgramCoopSupplyColorLegendRow[]).map(mapColorLegendRow);
}
