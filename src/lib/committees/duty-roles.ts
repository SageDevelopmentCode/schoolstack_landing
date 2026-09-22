import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { logCommitteeActivityEvent } from "@/lib/committees/committee-activity-log";
import { getCommittee } from "./committees";
import { mapDutyRoleRow, type CommitteeDutyRoleRow } from "./mappers";
import type { CommitteeDutyRole } from "./types";

export type CreateDutyRoleInput = {
  title: string;
  description?: string;
  assigneeMemberId?: string;
  sortOrder?: number;
};

export function stripDutyRoleFromAccessList(
  allowedDutyRoleIds: string[],
  dutyRoleId: string,
): string[] {
  return allowedDutyRoleIds.filter((id) => id !== dutyRoleId);
}

export async function createDutyRole(
  supabase: SupabaseClient,
  committeeId: string,
  input: CreateDutyRoleInput,
): Promise<CommitteeDutyRole> {
  const { data, error } = await supabase
    .from("committee_duty_roles")
    .insert({
      committee_id: committeeId,
      title: input.title.trim(),
      description: input.description ?? "",
      assignee_member_id: input.assigneeMemberId ?? null,
      sort_order: input.sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  const dutyRole = mapDutyRoleRow(data as CommitteeDutyRoleRow);
  logCommitteeActivityEvent(supabase, {
    committeeId,
    action: ACTIVITY_ACTIONS.COMMITTEE_DUTY_ROLE_CREATED,
    entityType: "committee_duty_role",
    entityId: dutyRole.id,
    summary: `Duty role "${dutyRole.title}" was created`,
    metadata: { dutyRoleTitle: dutyRole.title },
  });
  return dutyRole;
}

export type UpdateDutyRoleInput = {
  title?: string;
  description?: string;
  assigneeMemberId?: string | null;
};

export async function updateDutyRole(
  supabase: SupabaseClient,
  dutyRoleId: string,
  input: UpdateDutyRoleInput,
): Promise<CommitteeDutyRole> {
  const { data: existing, error: fetchError } = await supabase
    .from("committee_duty_roles")
    .select("committee_id, title")
    .eq("id", dutyRoleId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.assigneeMemberId !== undefined) {
    patch.assignee_member_id = input.assigneeMemberId;
  }

  const { data, error } = await supabase
    .from("committee_duty_roles")
    .update(patch)
    .eq("id", dutyRoleId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  const dutyRole = mapDutyRoleRow(data as CommitteeDutyRoleRow);
  if (existing?.committee_id) {
    logCommitteeActivityEvent(supabase, {
      committeeId: String(existing.committee_id),
      action: ACTIVITY_ACTIONS.COMMITTEE_DUTY_ROLE_UPDATED,
      entityType: "committee_duty_role",
      entityId: dutyRoleId,
      summary: `Duty role "${String(existing.title ?? dutyRole.title)}" was updated`,
      metadata: {
        dutyRoleTitle: existing.title ?? dutyRole.title,
        changes: input,
      },
    });
  }
  return dutyRole;
}

async function cleanupResourceAccessForDeletedRole(
  supabase: SupabaseClient,
  committeeId: string,
  dutyRoleId: string,
): Promise<void> {
  const { data: resources, error } = await supabase
    .from("committee_resources")
    .select("id, allowed_duty_role_ids")
    .eq("committee_id", committeeId)
    .contains("allowed_duty_role_ids", [dutyRoleId]);

  if (error) throw new Error(error.message);

  for (const resource of resources ?? []) {
    const currentIds = (resource.allowed_duty_role_ids as string[]) ?? [];
    const nextIds = stripDutyRoleFromAccessList(currentIds, dutyRoleId);
    if (nextIds.length === currentIds.length) continue;

    const { error: updateError } = await supabase
      .from("committee_resources")
      .update({ allowed_duty_role_ids: nextIds })
      .eq("id", resource.id);

    if (updateError) throw new Error(updateError.message);
  }
}

export async function deleteDutyRole(
  supabase: SupabaseClient,
  dutyRoleId: string,
  committeeId: string,
): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from("committee_duty_roles")
    .select("title")
    .eq("id", dutyRoleId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  await cleanupResourceAccessForDeletedRole(supabase, committeeId, dutyRoleId);

  const { error } = await supabase
    .from("committee_duty_roles")
    .delete()
    .eq("id", dutyRoleId);

  if (error) throw new Error(error.message);

  logCommitteeActivityEvent(supabase, {
    committeeId,
    action: ACTIVITY_ACTIONS.COMMITTEE_DUTY_ROLE_DELETED,
    entityType: "committee_duty_role",
    entityId: dutyRoleId,
    summary: `Duty role "${String(existing?.title ?? "Untitled")}" was deleted`,
    metadata: { dutyRoleTitle: existing?.title ?? null },
  });
}

export async function refreshCommitteeAfterDutyRoleChange(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
) {
  const committee = await getCommittee(supabase, organizationId, committeeId);
  if (!committee) throw new Error("Committee not found");
  return committee;
}

export type CommitteeDutyRoleSummary = Pick<
  CommitteeDutyRole,
  "id" | "title" | "assigneeId"
> & {
  assigneeName?: string;
};

export async function listDutyRolesByCommitteeIds(
  supabase: SupabaseClient,
  committeeIds: string[],
): Promise<Record<string, CommitteeDutyRoleSummary[]>> {
  const uniqueIds = [...new Set(committeeIds.filter(Boolean))];
  if (uniqueIds.length === 0) return {};

  const { data, error } = await supabase
    .from("committee_duty_roles")
    .select("id, committee_id, title, assignee_member_id, sort_order")
    .in("committee_id", uniqueIds)
    .order("sort_order");

  if (error) throw new Error(error.message);

  const assigneeIds = [
    ...new Set(
      (data ?? [])
        .map((row) => row.assignee_member_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const assigneeNamesById = new Map<string, string>();
  if (assigneeIds.length > 0) {
    const { data: members, error: membersError } = await supabase
      .from("committee_members")
      .select("id, display_name")
      .in("id", assigneeIds);

    if (membersError) throw new Error(membersError.message);

    for (const member of members ?? []) {
      assigneeNamesById.set(String(member.id), String(member.display_name));
    }
  }

  const byCommitteeId: Record<string, CommitteeDutyRoleSummary[]> = {};
  for (const row of data ?? []) {
    const committeeId = String(row.committee_id);
    if (!byCommitteeId[committeeId]) byCommitteeId[committeeId] = [];
    const assigneeId = row.assignee_member_id
      ? String(row.assignee_member_id)
      : undefined;
    byCommitteeId[committeeId].push({
      id: String(row.id),
      title: String(row.title),
      assigneeId,
      assigneeName: assigneeId
        ? assigneeNamesById.get(assigneeId)
        : undefined,
    });
  }

  return byCommitteeId;
}
