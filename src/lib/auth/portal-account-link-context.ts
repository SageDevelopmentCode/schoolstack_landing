import type { SupabaseClient } from "@supabase/supabase-js";

export type PortalAccountLinkContext = {
  groupId: string | null;
  primaryUserId: string;
  memberUserIds: string[];
  isPrimaryLogin: boolean;
};

async function findMemberRowForUser(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<{ id: string; group_id: string } | null> {
  const { data, error } = await supabase
    .from("organization_portal_account_link_members")
    .select("id, group_id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return { id: String(data.id), group_id: String(data.group_id) };
}

async function listMemberUserIdsForGroup(
  supabase: SupabaseClient,
  groupId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("organization_portal_account_link_members")
    .select("user_id")
    .eq("group_id", groupId);

  if (error) throw error;

  return (data ?? []).map((row) => String(row.user_id));
}

export async function getPortalAccountLinkContext(
  supabase: SupabaseClient,
  organizationId: string,
  sessionUserId: string,
): Promise<PortalAccountLinkContext> {
  const memberRow = await findMemberRowForUser(
    supabase,
    organizationId,
    sessionUserId,
  );

  if (!memberRow) {
    return {
      groupId: null,
      primaryUserId: sessionUserId,
      memberUserIds: [sessionUserId],
      isPrimaryLogin: true,
    };
  }

  const { data: group, error: groupError } = await supabase
    .from("organization_portal_account_link_groups")
    .select("id, primary_user_id")
    .eq("id", memberRow.group_id)
    .maybeSingle();

  if (groupError) throw groupError;
  if (!group) {
    return {
      groupId: null,
      primaryUserId: sessionUserId,
      memberUserIds: [sessionUserId],
      isPrimaryLogin: true,
    };
  }

  const memberUserIds = await listMemberUserIdsForGroup(
    supabase,
    memberRow.group_id,
  );
  const primaryUserId = String(group.primary_user_id);

  return {
    groupId: String(group.id),
    primaryUserId,
    memberUserIds: memberUserIds.length > 0 ? memberUserIds : [sessionUserId],
    isPrimaryLogin: sessionUserId === primaryUserId,
  };
}

export async function resolvePortalAccountMemberUserIds(
  supabase: SupabaseClient,
  organizationId: string,
  sessionUserId: string,
): Promise<string[]> {
  const context = await getPortalAccountLinkContext(
    supabase,
    organizationId,
    sessionUserId,
  );
  return context.memberUserIds;
}

export async function findMemberRowForUserInOrg(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<{ id: string; group_id: string } | null> {
  return findMemberRowForUser(supabase, organizationId, userId);
}

export async function listMemberUserIdsForLinkGroup(
  supabase: SupabaseClient,
  groupId: string,
): Promise<string[]> {
  return listMemberUserIdsForGroup(supabase, groupId);
}
