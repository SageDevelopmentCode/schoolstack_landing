import type { SupabaseClient } from "@supabase/supabase-js";
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
  return mapDutyRoleRow(data as CommitteeDutyRoleRow);
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
  return mapDutyRoleRow(data as CommitteeDutyRoleRow);
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
  await cleanupResourceAccessForDeletedRole(supabase, committeeId, dutyRoleId);

  const { error } = await supabase
    .from("committee_duty_roles")
    .delete()
    .eq("id", dutyRoleId);

  if (error) throw new Error(error.message);
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
