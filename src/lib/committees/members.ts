import type { SupabaseClient } from "@supabase/supabase-js";
import { getCommittee } from "./committees";
import { mapMemberRow, type CommitteeMemberRow } from "./mappers";
import type { CommitteeMember, CommitteeRole } from "./types";

export type InviteMemberInput = {
  displayName: string;
  email?: string;
  phone?: string;
  role?: CommitteeRole;
  grade?: string;
  bio?: string;
  guardianId?: string;
  userId?: string;
};

export async function listCommitteeMembers(
  supabase: SupabaseClient,
  committeeId: string,
): Promise<CommitteeMember[]> {
  const { data, error } = await supabase
    .from("committee_members")
    .select("*")
    .eq("committee_id", committeeId)
    .neq("status", "removed")
    .order("display_name");

  if (error) throw new Error(error.message);
  return (data as CommitteeMemberRow[]).map(mapMemberRow);
}

export async function inviteCommitteeMember(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
  input: InviteMemberInput,
): Promise<CommitteeMember> {
  let guardianId = input.guardianId ?? null;
  let userId = input.userId ?? null;

  if (!guardianId && input.email) {
    const { data: guardian } = await supabase
      .from("guardians")
      .select("id, user_id")
      .eq("organization_id", organizationId)
      .ilike("email", input.email.trim())
      .maybeSingle();

    if (guardian) {
      guardianId = guardian.id;
      userId = guardian.user_id ?? userId;
    }
  }

  const { data, error } = await supabase
    .from("committee_members")
    .insert({
      committee_id: committeeId,
      organization_id: organizationId,
      display_name: input.displayName.trim(),
      email: input.email?.trim() ?? null,
      phone: input.phone?.trim() ?? null,
      role: input.role ?? "member",
      grade: input.grade ?? null,
      bio: input.bio ?? null,
      guardian_id: guardianId,
      user_id: userId,
      status: "invited",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapMemberRow(data as CommitteeMemberRow);
}

export type UpdateMemberInput = {
  displayName?: string;
  email?: string;
  phone?: string;
  role?: CommitteeRole;
  grade?: string;
  bio?: string;
  status?: CommitteeMember["status"];
};

export async function updateCommitteeMember(
  supabase: SupabaseClient,
  memberId: string,
  input: UpdateMemberInput,
): Promise<CommitteeMember> {
  const patch: Record<string, unknown> = {};
  if (input.displayName !== undefined) patch.display_name = input.displayName;
  if (input.email !== undefined) patch.email = input.email;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.role !== undefined) patch.role = input.role;
  if (input.grade !== undefined) patch.grade = input.grade;
  if (input.bio !== undefined) patch.bio = input.bio;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabase
    .from("committee_members")
    .update(patch)
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapMemberRow(data as CommitteeMemberRow);
}

export async function removeCommitteeMember(
  supabase: SupabaseClient,
  memberId: string,
): Promise<void> {
  const { error } = await supabase
    .from("committee_members")
    .update({ status: "removed" })
    .eq("id", memberId);

  if (error) throw new Error(error.message);
}

export async function refreshCommitteeAfterMemberChange(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
) {
  const committee = await getCommittee(supabase, organizationId, committeeId);
  if (!committee) throw new Error("Committee not found");
  return committee;
}
