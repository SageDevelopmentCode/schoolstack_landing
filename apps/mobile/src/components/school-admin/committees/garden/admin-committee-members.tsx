import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { closeThen, confirmDestructive, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GChoiceChips, GTextField } from '@/components/parent/garden/fields';
import { Garden, GardenFonts, useGardenAccent, type GChipTone } from '@/components/parent/garden/tokens';
import { GCard, GChip, GLink, GPressable } from '@/components/parent/garden/ui';
import { AdminJoinRequests } from '@/components/school-admin/committees/garden/admin-join-requests';
import { AdminInitialsAvatar } from '@/components/school-admin/garden/admin-people';
import { AdminFormSheet, errorText, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import { AdminEmptyPanel, AdminWorkRow } from '@/components/school-admin/garden/admin-ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import type { CommitteeRole } from '@/lib/parent/parent-committees-types';
import { inviteCommitteeMember, refreshCommitteeAfterMemberChange, removeCommitteeMember } from '@/lib/school-admin/committees/members';
import { COMMITTEE_ASSIGNABLE_ROLE_OPTIONS } from '@/lib/school-admin/committees/role-labels';

function roleTone(role: CommitteeRole): GChipTone {
  if (role === 'lead') return 'success';
  if (role === 'admin') return 'warning';
  return 'info';
}

type InviteForm = { displayName: string; email: string; phone: string; role: CommitteeRole };
const EMPTY_INVITE: InviteForm = { displayName: '', email: '', phone: '', role: 'member' };

/**
 * Admin workspace › Members (Garden): roster with remove (existing confirm),
 * invite sheet, and the committee's pending join requests. Same mutations
 * and `committees.members.*` operations as Story; every action now gives
 * feedback (before, failures were silent).
 */
export function AdminCommitteeMembers({
  committee,
  organizationId,
  schoolSlug,
  supabase,
  onCommitteeChange,
  onJoinRequestsChanged,
}: ParentCommitteeSectionProps) {
  const accent = useGardenAccent();
  const action = useAdminAction(organizationId);
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState<InviteForm>(EMPTY_INVITE);
  const [inviting, setInviting] = useState(false);
  const [inviteNotice, setInviteNotice] = useState<AdminSheetNotice | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const members = committee.members.filter((member) => member.status === 'active');
  const dutyRoles = useMemo(
    () => committee.dutyRoles.map((role) => ({ id: role.id, title: role.title, description: role.description })),
    [committee.dutyRoles],
  );

  const refreshCommittee = useCallback(async () => {
    onCommitteeChange(await refreshCommitteeAfterMemberChange(supabase, organizationId, committee.id));
  }, [committee.id, onCommitteeChange, organizationId, supabase]);

  const openInvite = () => {
    if (readOnly) return notifyReadOnly();
    setForm(EMPTY_INVITE);
    setInviteNotice(null);
    setInviteOpen(true);
  };

  const invite = async () => {
    if (!form.displayName.trim()) return;
    setInviting(true);
    setInviteNotice(null);
    let failure = '';
    const ok = await action.run(
      async () => {
        await inviteCommitteeMember(supabase, organizationId, committee.id, {
          displayName: form.displayName.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          role: form.role,
        });
        await refreshCommittee();
      },
      {
        key: 'committee-invite',
        silent: true,
        operation: 'committees.members.invite',
        metadata: { committeeId: committee.id },
        error: (err) => {
          failure = errorText(err, 'Invite failed.');
          return { title: "Couldn't send the invite" };
        },
      },
    );
    setInviting(false);
    if (!ok) {
      setInviteNotice({ tone: 'error', title: `${form.displayName.trim()} wasn't invited`, description: `${failure} Nothing was sent.` });
      return;
    }
    const name = form.displayName.trim();
    closeThen(
      () => setInviteOpen(false),
      () => action.toast.success(`${name} invited`, { id: 'committee-invite', description: `They're on the ${committee.name} roster now.` }),
    );
  };

  const remove = async (memberId: string, memberName: string) => {
    if (readOnly) return notifyReadOnly();
    const ok = await confirmDestructive({ title: 'Remove member', message: `Remove ${memberName} from this committee?`, confirmLabel: 'Remove' });
    if (!ok) return;
    setRemovingId(memberId);
    await action.run(
      async () => {
        await removeCommitteeMember(supabase, memberId);
        await refreshCommittee();
      },
      {
        key: `committee-remove-${memberId}`,
        operation: 'committees.members.remove',
        metadata: { memberId },
        retry: true,
        success: { title: `${memberName} removed`, description: `They're no longer on ${committee.name}.` },
        error: (err) => ({ title: `Couldn't remove ${memberName}`, description: `${errorText(err, 'Remove failed.')} They're still a member.` }),
      },
    );
    setRemovingId(null);
  };

  const inviteDirty = Boolean(form.displayName.trim() || form.email.trim() || form.phone.trim());

  return (
    <View style={styles.stack}>
      <GCard index={0} title={`Members (${members.length})`} action={<GLink label="Invite member" icon="person-add-outline" onPress={openInvite} />}>
        {members.length === 0 ? (
          <AdminEmptyPanel icon="people-outline" title="No members yet." actionLabel="Invite member" onAction={openInvite} />
        ) : (
          members.map((member, index) => {
            const roleLabel = COMMITTEE_ASSIGNABLE_ROLE_OPTIONS.find((option) => option.value === member.role)?.label ?? member.role;
            const removing = removingId === member.id;
            return (
              <AdminWorkRow
                key={member.id}
                divider={index > 0}
                title={member.name}
                meta={[member.email, member.grade].filter(Boolean).join(' · ') || null}
                leading={<AdminInitialsAvatar name={member.name} size="sm" />}
                trailing={
                  <View style={styles.trailing}>
                    <GChip label={roleLabel} tone={roleTone(member.role)} />
                    <GPressable
                      accessibilityLabel={`Remove ${member.name}`}
                      accessibilityState={{ busy: removing, disabled: removing }}
                      disabled={removing}
                      haptic="select"
                      onPress={() => void remove(member.id, member.name)}
                      style={styles.remove}>
                      {removing ? <ActivityIndicator size="small" color={accent.clayDeep} /> : <Text style={styles.removeLabel}>Remove</Text>}
                    </GPressable>
                  </View>
                }
              />
            );
          })
        )}
      </GCard>

      {schoolSlug ? (
        <GCard index={1} title="Pending requests">
          <AdminJoinRequests
            organizationId={organizationId}
            schoolSlug={schoolSlug}
            committeeId={committee.id}
            committeeDutyRoles={dutyRoles}
            onChanged={() => {
              void refreshCommittee();
              onJoinRequestsChanged?.();
            }}
          />
        </GCard>
      ) : null}

      <AdminFormSheet
        visible={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite member"
        subtitle={committee.name}
        isDirty={inviteDirty}
        saving={inviting}
        canSave={Boolean(form.displayName.trim())}
        saveLabel="Send invite"
        savingLabel="Inviting…"
        saveIcon="paper-plane-outline"
        statusLine={form.displayName.trim() ? null : 'Add their name to send the invite'}
        notice={inviteNotice}
        onSave={() => void invite()}>
        <GTextField label="Name" value={form.displayName} onChangeText={(displayName) => setForm((current) => ({ ...current, displayName }))} autoCapitalize="words" />
        <GTextField
          label="Email"
          optional
          value={form.email}
          onChangeText={(email) => setForm((current) => ({ ...current, email }))}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <GTextField label="Phone" optional value={form.phone} onChangeText={(phone) => setForm((current) => ({ ...current, phone }))} keyboardType="phone-pad" />
        <GChoiceChips<CommitteeRole>
          label="Role"
          options={COMMITTEE_ASSIGNABLE_ROLE_OPTIONS.map((option) => ({ id: option.value, label: option.label }))}
          value={form.role}
          onChange={(role) => setForm((current) => ({ ...current, role }))}
        />
      </AdminFormSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  trailing: { alignItems: 'flex-end', gap: 6 },
  remove: {
    minHeight: 32,
    minWidth: 72,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink15,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 12.5, color: Garden.ink },
});
