import type { SupabaseClient } from '@supabase/supabase-js';

import { ACTIVITY_ACTIONS } from '@/lib/activity-log';
import { logCommitteeActivityEvent } from '@/lib/committees/committee-activity-log';
import {
  COMMITTEE_PROJECT_SUPPLY_COLOR_LEGEND_SELECT,
  COMMITTEE_PROJECT_SUPPLY_ITEM_SELECT,
  mapSupplyColorLegendRow,
  mapSupplyItemRow,
  type CommitteeProjectSupplyColorLegendRow,
  type CommitteeProjectSupplyItemRow,
} from '@/lib/committees/committee-project-mappers';
import type { CommitteeProjectWorkspaceRecordContext } from '@/lib/committees/committee-projects';
import type { CommitteePortalApiNamespace } from '@/lib/committees/notify-committee-task-assignment';
import { recordCommitteeWorkspaceCreate } from '@/lib/committees/record-committee-workspace-create';
import {
  defaultCoopSupplyColorLegend,
  supplyItemDisplayName,
  type CoopSupplyColorLegendEntry,
  type CoopSupplyListItem,
} from '@/lib/committees/committee-supply-types';

export type CommitteeProjectSupplyListContext = {
  organizationId: string;
  committeeId: string;
  projectId: string;
  workspaceRecord?: CommitteeProjectWorkspaceRecordContext;
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
    .from('committee_project_supply_items')
    .select('sort_order')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: false })
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
      .from('committee_project_supply_color_legend')
      .select(COMMITTEE_PROJECT_SUPPLY_COLOR_LEGEND_SELECT)
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true }),
    supabase
      .from('committee_project_supply_items')
      .select(COMMITTEE_PROJECT_SUPPLY_ITEM_SELECT)
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
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

function recordSupplyCreateActivity(
  ctx: CommitteeProjectSupplyListContext,
  itemId: string,
): void {
  if (!ctx.workspaceRecord) return;
  void recordCommitteeWorkspaceCreate({
    portalApiNamespace: ctx.workspaceRecord.portalApiNamespace,
    committeeId: ctx.committeeId,
    organizationId: ctx.workspaceRecord.organizationId,
    action: ACTIVITY_ACTIONS.COMMITTEE_PROJECT_SUPPLY_CREATED,
    entityId: itemId,
  }).catch(() => {});
}

export async function insertCommitteeProjectSupplyItem(
  supabase: SupabaseClient,
  ctx: CommitteeProjectSupplyListContext,
  item: CoopSupplyListItem,
): Promise<CoopSupplyListItem> {
  const sortOrder = await nextItemSortOrder(supabase, ctx.projectId);

  const { data, error } = await supabase
    .from('committee_project_supply_items')
    .insert(itemToRow(item, ctx, sortOrder))
    .select(COMMITTEE_PROJECT_SUPPLY_ITEM_SELECT)
    .single();

  if (error) throw error;
  const mapped = mapSupplyItemRow(data as CommitteeProjectSupplyItemRow);

  if (ctx.workspaceRecord) {
    recordSupplyCreateActivity(ctx, mapped.id);
  } else {
    logCommitteeActivityEvent(supabase, {
      committeeId: ctx.committeeId,
      organizationId: ctx.organizationId,
      action: ACTIVITY_ACTIONS.COMMITTEE_PROJECT_SUPPLY_CREATED,
      entityType: 'committee_project_supply_item',
      entityId: mapped.id,
      summary: `Supply item "${supplyItemDisplayName(mapped)}" was added`,
      metadata: {
        projectId: ctx.projectId,
        supplyItemName: supplyItemDisplayName(mapped),
      },
      actor: ctx.createdByMemberId
        ? { type: 'parent', memberId: ctx.createdByMemberId }
        : undefined,
    });
  }

  return mapped;
}

export async function saveCommitteeProjectSupplyItem(
  supabase: SupabaseClient,
  ctx: CommitteeProjectSupplyListContext,
  item: CoopSupplyListItem,
): Promise<CoopSupplyListItem> {
  const { data: existing, error: existingError } = await supabase
    .from('committee_project_supply_items')
    .select('sort_order')
    .eq('id', item.id)
    .eq('project_id', ctx.projectId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) throw new Error('Supply item not found.');

  const sortOrder = (existing as { sort_order: number }).sort_order;

  const { data, error } = await supabase
    .from('committee_project_supply_items')
    .update(itemToRow(item, ctx, sortOrder))
    .eq('id', item.id)
    .eq('project_id', ctx.projectId)
    .select(COMMITTEE_PROJECT_SUPPLY_ITEM_SELECT)
    .single();

  if (error) throw error;
  const mapped = mapSupplyItemRow(data as CommitteeProjectSupplyItemRow);

  logCommitteeActivityEvent(supabase, {
    committeeId: ctx.committeeId,
    organizationId: ctx.organizationId,
    action: ACTIVITY_ACTIONS.COMMITTEE_PROJECT_SUPPLY_UPDATED,
    entityType: 'committee_project_supply_item',
    entityId: mapped.id,
    summary: `Supply item "${supplyItemDisplayName(mapped)}" was updated`,
    metadata: {
      projectId: ctx.projectId,
      supplyItemName: supplyItemDisplayName(mapped),
    },
  });

  return mapped;
}

export async function deleteCommitteeProjectSupplyItem(
  supabase: SupabaseClient,
  ctx: CommitteeProjectSupplyListContext,
  itemId: string,
  itemName?: string,
): Promise<void> {
  const { error } = await supabase
    .from('committee_project_supply_items')
    .delete()
    .eq('id', itemId)
    .eq('project_id', ctx.projectId);

  if (error) throw error;

  const displayName = itemName?.trim() || 'Item';

  logCommitteeActivityEvent(supabase, {
    committeeId: ctx.committeeId,
    organizationId: ctx.organizationId,
    action: ACTIVITY_ACTIONS.COMMITTEE_PROJECT_SUPPLY_DELETED,
    entityType: 'committee_project_supply_item',
    entityId: itemId,
    summary: `Supply item "${displayName}" was removed`,
    metadata: {
      projectId: ctx.projectId,
      supplyItemName: displayName,
    },
  });
}

export function buildSupplyListContext(input: {
  organizationId: string;
  committeeId: string;
  projectId: string;
  portalApiNamespace?: CommitteePortalApiNamespace;
  createdByMemberId?: string | null;
  usePortalRecord?: boolean;
}): CommitteeProjectSupplyListContext {
  return {
    organizationId: input.organizationId,
    committeeId: input.committeeId,
    projectId: input.projectId,
    createdByMemberId: input.createdByMemberId,
    workspaceRecord:
      input.usePortalRecord && input.portalApiNamespace
        ? {
            organizationId: input.organizationId,
            portalApiNamespace: input.portalApiNamespace,
            createdByMemberId: input.createdByMemberId,
          }
        : undefined,
  };
}
