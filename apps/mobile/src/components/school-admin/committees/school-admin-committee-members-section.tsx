import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { SchoolAdminCommitteeJoinRequestsSection } from '@/components/school-admin/committees/school-admin-committee-join-requests-section';
import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { AdmissionsFilterPill } from '@/components/school-admin/admissions/admissions-filter-pill';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  inviteCommitteeMember,
  refreshCommitteeAfterMemberChange,
  removeCommitteeMember,
} from '@/lib/school-admin/committees/members';
import { COMMITTEE_ASSIGNABLE_ROLE_OPTIONS } from '@/lib/school-admin/committees/role-labels';
import type { CommitteeRole } from '@/lib/parent/parent-committees-types';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';

function roleTone(role: CommitteeRole) {
  if (role === 'lead') return 'success';
  if (role === 'faculty_liaison') return 'info';
  if (role === 'admin') return 'warning';
  return 'info';
}

type InviteFormState = {
  displayName: string;
  email: string;
  phone: string;
  role: CommitteeRole;
};

const EMPTY_INVITE_FORM: InviteFormState = {
  displayName: '',
  email: '',
  phone: '',
  role: 'member',
};

export function SchoolAdminCommitteeMembersSection({
  committee,
  organizationId,
  schoolSlug,
  supabase,
  onCommitteeChange,
  onJoinRequestsChanged,
}: ParentCommitteeSectionProps) {
  const theme = useParentTheme();
  const reportError = createSchoolAdminErrorReporter(organizationId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteFormState>(EMPTY_INVITE_FORM);
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const members = committee.members.filter((member) => member.status === 'active');

  useEffect(() => {
    if (!inviteOpen) {
      setInviteForm(EMPTY_INVITE_FORM);
    }
  }, [inviteOpen]);

  const refreshCommittee = useCallback(async () => {
    const refreshed = await refreshCommitteeAfterMemberChange(
      supabase,
      organizationId,
      committee.id,
    );
    onCommitteeChange(refreshed);
  }, [committee.id, onCommitteeChange, organizationId, supabase]);

  const handleInvite = async () => {
    if (!inviteForm.displayName.trim()) return;
    setInviting(true);
    try {
      await inviteCommitteeMember(supabase, organizationId, committee.id, {
        displayName: inviteForm.displayName.trim(),
        email: inviteForm.email.trim() || undefined,
        phone: inviteForm.phone.trim() || undefined,
        role: inviteForm.role,
      });
      await refreshCommittee();
      setInviteOpen(false);
    } catch (error) {
      reportError('committees.members.invite', error, {
        entityType: 'committee',
        entityId: committee.id,
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = (memberId: string, memberName: string) => {
    Alert.alert('Remove member', `Remove ${memberName} from this committee?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setRemovingId(memberId);
            try {
              await removeCommitteeMember(supabase, memberId);
              await refreshCommittee();
            } catch (error) {
              reportError('committees.members.remove', error, {
                entityType: 'committee_member',
                entityId: memberId,
              });
            } finally {
              setRemovingId(null);
            }
          })();
        },
      },
    ]);
  };

  const dutyRoleSummaries = committee.dutyRoles.map((role) => ({
    id: role.id,
    title: role.title,
    description: role.description,
  }));

  return (
    <View style={styles.container}>
      <StoryDetailSection title={`Members (${members.length})`}>
        <StoryButton label="Invite member" variant="soft" onPress={() => setInviteOpen(true)} />
        {members.length === 0 ? (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>No members yet.</Text>
        ) : (
          <View style={styles.list}>
            {members.map((member) => (
              <StoryCard key={member.id} compact style={styles.card}>
                <View style={styles.headerRow}>
                  <Text style={[styles.name, { color: theme.ink }]}>{member.name}</Text>
                  <StoryChip
                    tone={roleTone(member.role)}
                    label={
                      COMMITTEE_ASSIGNABLE_ROLE_OPTIONS.find((option) => option.value === member.role)
                        ?.label ?? member.role
                    }
                  />
                </View>
                {member.email ? (
                  <Text style={[styles.meta, { color: theme.muted }]}>{member.email}</Text>
                ) : null}
                {member.grade ? (
                  <Text style={[styles.meta, { color: theme.muted }]}>Grade: {member.grade}</Text>
                ) : null}
                <StoryButton
                  label={removingId === member.id ? 'Removing…' : 'Remove'}
                  variant="outline"
                  onPress={() => handleRemove(member.id, member.name)}
                  disabled={removingId === member.id}
                />
              </StoryCard>
            ))}
          </View>
        )}
      </StoryDetailSection>

      {schoolSlug ? (
        <SchoolAdminCommitteeJoinRequestsSection
          organizationId={organizationId}
          schoolSlug={schoolSlug}
          committeeId={committee.id}
          committeeDutyRoles={dutyRoleSummaries}
          compact
          onChanged={onJoinRequestsChanged}
        />
      ) : null}

      <StoryBottomSheet visible={inviteOpen} onClose={() => setInviteOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: theme.ink }]}>Invite member</Text>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.muted }]}>Name</Text>
            <TextInput
              value={inviteForm.displayName}
              onChangeText={(value) =>
                setInviteForm((current) => ({ ...current, displayName: value }))
              }
              style={[styles.input, { color: theme.ink, borderColor: theme.line, backgroundColor: theme.white }]}
              placeholderTextColor={theme.muted}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.muted }]}>Email</Text>
            <TextInput
              value={inviteForm.email}
              onChangeText={(value) => setInviteForm((current) => ({ ...current, email: value }))}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { color: theme.ink, borderColor: theme.line, backgroundColor: theme.white }]}
              placeholderTextColor={theme.muted}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.muted }]}>Phone</Text>
            <TextInput
              value={inviteForm.phone}
              onChangeText={(value) => setInviteForm((current) => ({ ...current, phone: value }))}
              keyboardType="phone-pad"
              style={[styles.input, { color: theme.ink, borderColor: theme.line, backgroundColor: theme.white }]}
              placeholderTextColor={theme.muted}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.muted }]}>Role</Text>
            <View style={styles.pickerRow}>
              {COMMITTEE_ASSIGNABLE_ROLE_OPTIONS.map((option) => (
                <AdmissionsFilterPill
                  key={option.value}
                  active={inviteForm.role === option.value}
                  label={option.label}
                  onPress={() => setInviteForm((current) => ({ ...current, role: option.value }))}
                />
              ))}
            </View>
          </View>

          <View style={styles.sheetActions}>
            <StoryButton label="Cancel" variant="soft" onPress={() => setInviteOpen(false)} disabled={inviting} />
            <StoryButton
              label={inviting ? 'Inviting…' : 'Send invite'}
              onPress={() => void handleInvite()}
              disabled={inviting || !inviteForm.displayName.trim()}
            />
          </View>
        </View>
      </StoryBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  list: {
    gap: Spacing.two,
  },
  card: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    flex: 1,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  sheetContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  sheetTitle: {
    fontFamily: StoryFonts.display,
    fontSize: 20,
    fontWeight: '700',
  },
  fieldBlock: {
    gap: Spacing.one,
  },
  fieldLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
