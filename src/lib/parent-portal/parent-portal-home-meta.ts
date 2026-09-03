import type { SupabaseClient } from "@supabase/supabase-js";

export type ParentPortalHomeMeta = {
  childrenCount: number;
  enrolledChildrenCount: number;
};

type ParentPortalHomeMetaRow = {
  children_count?: number | string | null;
  enrolled_children_count?: number | string | null;
};

export function parseParentPortalHomeMetaRow(
  row: ParentPortalHomeMetaRow | null,
): ParentPortalHomeMeta | null {
  if (!row) return null;

  return {
    childrenCount: Number(row.children_count ?? 0),
    enrolledChildrenCount: Number(row.enrolled_children_count ?? 0),
  };
}

export async function fetchParentPortalHomeMetaFromRpc(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
): Promise<ParentPortalHomeMeta | null> {
  const { data, error } = await supabase.rpc("parent_portal_home_meta", {
    p_organization_id: organizationId,
    p_family_id: familyId,
  });

  if (error) throw error;
  if (!data || typeof data !== "object") return null;

  return parseParentPortalHomeMetaRow(data as ParentPortalHomeMetaRow);
}
