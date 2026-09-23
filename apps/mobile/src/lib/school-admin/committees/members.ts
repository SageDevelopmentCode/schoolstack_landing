import type { SupabaseClient } from '@supabase/supabase-js';

import { mapMemberRow } from '@/lib/school-admin/committees/mappers';
import { getCommittee } from '@/lib/school-admin/committees/queries';
import type { CommitteeMember, CommitteeRole } from '@/lib/parent/parent-committees-types';

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
      .from('guardians')
      .select('id, user_id')
      .eq('organization_id', organizationId)
      .ilike('email', input.email.trim())
      .maybeSingle();

    if (guardian) {
      guardianId = guardian.id;
      userId = guardian.user_id ?? userId;
    }
  }

  const { data, error } = await supabase
    .from('committee_members')
    .insert({
      committee_id: committeeId,
      organization_id: organizationId,
      display_name: input.displayName.trim(),
      email: input.email?.trim() ?? null,
      phone: input.phone?.trim() ?? null,
      role: input.role ?? 'member',
      grade: input.grade ?? null,
      bio: input.bio ?? null,
      guardian_id: guardianId,
      user_id: userId,
      status: 'invited',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapMemberRow(data);
}

export async function removeCommitteeMember(
  supabase: SupabaseClient,
  memberId: string,
): Promise<void> {
  const { error } = await supabase
    .from('committee_members')
    .update({ status: 'removed' })
    .eq('id', memberId);

  if (error) throw new Error(error.message);
}

export async function refreshCommitteeAfterMemberChange(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
) {
  const committee = await getCommittee(supabase, organizationId, committeeId);
  if (!committee) throw new Error('Committee not found');
  return committee;
}
