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

/** Primary first, then other link-group members (school-scoped). */
export async function getOrderedPortalAccountUserIds(
  supabase: SupabaseClient,
  organizationId: string,
  sessionUserId: string,
): Promise<string[]> {
  const linkContext = await getPortalAccountLinkContext(
    supabase,
    organizationId,
    sessionUserId,
  );

  return [
    linkContext.primaryUserId,
    ...linkContext.memberUserIds.filter(
      (memberUserId) => memberUserId !== linkContext.primaryUserId,
    ),
  ];
}

/** All user ids in any link group the session user belongs to (for global school lists). */
export async function resolveAllPortalAccountPeerUserIds(
  supabase: SupabaseClient,
  sessionUserId: string,
): Promise<string[]> {
  const ids = new Set<string>([sessionUserId]);

  const { data: myRows, error: myRowsError } = await supabase
    .from("organization_portal_account_link_members")
    .select("group_id")
    .eq("user_id", sessionUserId);

  if (myRowsError) throw myRowsError;

  const groupIds = [
    ...new Set((myRows ?? []).map((row) => String(row.group_id))),
  ];

  for (const groupId of groupIds) {
    const memberUserIds = await listMemberUserIdsForGroup(supabase, groupId);
    for (const memberUserId of memberUserIds) {
      ids.add(memberUserId);
    }
  }

  return [...ids];
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
