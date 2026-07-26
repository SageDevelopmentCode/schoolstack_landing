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

export async function deleteDutyRole(
  supabase: SupabaseClient,
  dutyRoleId: string,
): Promise<void> {
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
