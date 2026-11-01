import type {
  CoopSupplyColorLegendEntry,
  CoopSupplyEstimatedPrice,
  CoopSupplyListItem,
  SupplyItemType,
  SupplyUsageTiming,
} from '@/lib/committees/committee-supply-types';

export type CommitteeProjectStatus = 'draft' | 'active';

export type CommitteeProjectRow = {
  id: string;
  committee_id: string;
  organization_id: string;
  name: string;
  description: string;
  status: CommitteeProjectStatus;
  sort_order: number;
  created_by_member_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CommitteeProjectSupplyColorLegendRow = {
  id: string;
  project_id: string;
  organization_id: string;
  color_id: string;
  hex: string;
  label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CommitteeProjectSupplyItemRow = {
  id: string;
  project_id: string;
  organization_id: string;
  name: string;
  item_type: SupplyItemType;
  usage_timing: SupplyUsageTiming;
  months: string[];
  color_id: string | null;
  assigned_member_ids: string[];
  where_to_buy: string;
  quantity: number;
  quantity_label: string;
  estimated_price: CoopSupplyEstimatedPrice;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CommitteeProject = {
  id: string;
  committeeId: string;
  organizationId: string;
  name: string;
  description: string;
  status: CommitteeProjectStatus;
  sortOrder: number;
  createdByMemberId: string | null;
  createdAt: string;
  updatedAt: string;
  supplyItems: CoopSupplyListItem[];
  colorLegend: CoopSupplyColorLegendEntry[];
  supplyItemCount?: number;
};

export const COMMITTEE_PROJECT_SELECT =
  'id, committee_id, organization_id, name, description, status, sort_order, created_by_member_id, created_at, updated_at';

export const COMMITTEE_PROJECT_SUPPLY_COLOR_LEGEND_SELECT =
  'id, project_id, organization_id, color_id, hex, label, sort_order, created_at, updated_at';

export const COMMITTEE_PROJECT_SUPPLY_ITEM_SELECT =
  'id, project_id, organization_id, name, item_type, usage_timing, months, color_id, assigned_member_ids, where_to_buy, quantity, quantity_label, estimated_price, sort_order, created_at, updated_at';

export function mapCommitteeProjectRow(row: CommitteeProjectRow): CommitteeProject {
  return {
    id: row.id,
    committeeId: row.committee_id,
    organizationId: row.organization_id,
    name: row.name,
    description: row.description,
    status: row.status,
    sortOrder: row.sort_order,
    createdByMemberId: row.created_by_member_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    supplyItems: [],
    colorLegend: [],
  };
}

export function mapSupplyColorLegendRow(
  row: CommitteeProjectSupplyColorLegendRow,
): CoopSupplyColorLegendEntry {
  return {
    id: row.color_id,
    hex: row.hex,
    label: row.label,
  };
}

export function mapSupplyItemRow(row: CommitteeProjectSupplyItemRow): CoopSupplyListItem {
  return {
    id: row.id,
    name: row.name,
    itemType: row.item_type,
    usageTiming: row.usage_timing,
    months: row.months ?? [],
    colorId: row.color_id,
    assignedFamilyIds: (row.assigned_member_ids ?? []).map(String),
    whereToBuy: row.where_to_buy,
    quantity: row.quantity,
    quantityLabel: row.quantity_label,
    estimatedPrice: row.estimated_price ?? { mode: 'unset' },
    updatedAt: row.updated_at,
  };
}

export function committeeProjectDisplayName(project: { name: string }): string {
  const trimmed = project.name.trim();
  return trimmed || 'Untitled project';
}
