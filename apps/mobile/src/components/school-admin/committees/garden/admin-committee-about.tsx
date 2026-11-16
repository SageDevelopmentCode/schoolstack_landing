import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { closeThen, confirmDestructive, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GTextField } from '@/components/parent/garden/fields';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GChip, GLink, GOutlineButton, GPressable } from '@/components/parent/garden/ui';
import { AdminFormSheet, errorText, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import { AdminEmptyPanel, AdminIconChip } from '@/components/school-admin/garden/admin-ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { stripHtmlTags, type CommitteeDutyRole } from '@/lib/parent/parent-committees-types';
import {
  createDutyRole,
  deleteDutyRole,
  refreshCommitteeAfterDutyRoleChange,
  updateDutyRole,
} from '@/lib/school-admin/committees/duty-roles';
import { updateCommittee } from '@/lib/school-admin/committees/mutations';

type RoleForm = { title: string; description: string; assigneeMemberId: string };
const EMPTY_ROLE: RoleForm = { title: '', description: '', assigneeMemberId: '' };

/**
 * Admin workspace › Role & Duties (Garden): the about text and duty roles.
 * Same mutations and `committees.about.save` / `committees.duty_roles.*`
 * operations as Story; saves now confirm with a toast (or an in-sheet
 * banner) and deleting a role confirms first.
 */
export function AdminCommitteeAbout({ committee, organizationId, supabase, onCommitteeChange }: ParentCommitteeSectionProps) {
  const accent = useGardenAccent();
  const action = useAdminAction(organizationId);
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const savedAbout = stripHtmlTags(committee.aboutHtml);
  const [aboutText, setAboutText] = useState(savedAbout);
  const [savingAbout, setSavingAbout] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'edit' | null>(null);
  const [selectedRole, setSelectedRole] = useState<CommitteeDutyRole | null>(null);
  const [roleForm, setRoleForm] = useState<RoleForm>(EMPTY_ROLE);
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleNotice, setRoleNotice] = useState<AdminSheetNotice | null>(null);

  const activeMembers = useMemo(
    () => committee.members.filter((member) => member.status === 'active').map((member) => ({ id: member.id, name: member.name })),
    [committee.members],
  );

  const refreshCommittee = useCallback(async () => {
    onCommitteeChange(await refreshCommitteeAfterDutyRoleChange(supabase, organizationId, committee.id));
  }, [committee.id, onCommitteeChange, organizationId, supabase]);

  const aboutDirty = aboutText.trim() !== savedAbout.trim();

  const saveAbout = async () => {
    if (readOnly) return notifyReadOnly();
    setSavingAbout(true);
    await action.run(
      async () => {
        onCommitteeChange(await updateCommittee(supabase, organizationId, committee.id, { aboutHtml: aboutText.trim() }));
      },
      {
        key: 'committee-about',
        operation: 'committees.about.save',
        metadata: { committeeId: committee.id },
        retry: true,
        success: { title: 'About text saved', description: 'Members see it on the committee workspace.' },
        error: (err) => ({ title: "Couldn't save the about text", description: `${errorText(err, 'Save failed.')} Your edits are still here.` }),
      },
    );
    setSavingAbout(false);
  };

  const openRole = (role: CommitteeDutyRole | null) => {
    if (readOnly) return notifyReadOnly();
    setRoleNotice(null);
    setSelectedRole(role);
    setPanelMode(role ? 'edit' : 'create');
    setRoleForm(role ? { title: role.title, description: role.description, assigneeMemberId: role.assigneeId ?? '' } : EMPTY_ROLE);
  };

  const closePanel = () => {
    setPanelMode(null);
    setSelectedRole(null);
  };

  const saveRole = async () => {
    if (!roleForm.title.trim()) return;
    setRoleSaving(true);
    setRoleNotice(null);
    let failure = '';
    const mode = panelMode;
    const ok = await action.run(
      async () => {
        if (mode === 'create') {
          await createDutyRole(supabase, committee.id, {
            title: roleForm.title.trim(),
            description: roleForm.description.trim(),
            assigneeMemberId: roleForm.assigneeMemberId || undefined,
          });
        } else if (selectedRole) {
          await updateDutyRole(supabase, selectedRole.id, {
            title: roleForm.title.trim(),
            description: roleForm.description.trim(),
            assigneeMemberId: roleForm.assigneeMemberId || null,
          });
        }
        await refreshCommittee();
      },
      {
        key: 'committee-duty-role',
        silent: true,
        operation: 'committees.duty_roles.save',
        metadata: { committeeId: committee.id },
        error: (err) => {
          failure = errorText(err, 'Save failed.');
          return { title: "Couldn't save the role" };
        },
      },
    );
    setRoleSaving(false);
    if (!ok) {
      setRoleNotice({ tone: 'error', title: "The role wasn't saved", description: `${failure} Your edits are still here.` });
      return;
    }
    const title = roleForm.title.trim();
    closeThen(closePanel, () =>
      action.toast.success(mode === 'create' ? 'Duty role added' : 'Duty role saved', {
        id: 'committee-duty-role',
        description: `${title} is on the Role & Duties list.`,
      }),
    );
  };

  const deleteRole = async () => {
    if (!selectedRole) return;
    const role = selectedRole;
    const ok = await confirmDestructive({ title: `Delete ${role.title}?`, message: 'Members assigned to it lose the role.' });
    if (!ok) return;
    setRoleSaving(true);
    setRoleNotice(null);
    let failure = '';
    const deleted = await action.run(
      async () => {
        await deleteDutyRole(supabase, role.id, committee.id);
        await refreshCommittee();
      },
      {
        key: 'committee-duty-role-delete',
        silent: true,
        operation: 'committees.duty_roles.delete',
        metadata: { roleId: role.id },
        error: (err) => {
          failure = errorText(err, 'Delete failed.');
          return { title: "Couldn't delete the role" };
        },
      },
    );
    setRoleSaving(false);
    if (!deleted) {
      setRoleNotice({ tone: 'error', title: "The role wasn't deleted", description: failure });
      return;
    }
    closeThen(closePanel, () => action.toast.success('Duty role deleted', { id: 'committee-duty-role', description: `${role.title} was removed.` }));
  };

  const roleDirty =
    panelMode === 'create'
      ? Boolean(roleForm.title.trim() || roleForm.description.trim() || roleForm.assigneeMemberId)
      : Boolean(
          selectedRole &&
            (roleForm.title !== selectedRole.title ||
              roleForm.description !== selectedRole.description ||
              roleForm.assigneeMemberId !== (selectedRole.assigneeId ?? '')),
        );

  return (
    <View style={styles.stack}>
      <GCard index={0} title="About this committee" style={action.flashKey === 'committee-about' && styles.flash}>
        <GTextField
          label="About"
          value={aboutText}
          onChangeText={setAboutText}
          multiline
          placeholder="Describe the committee's purpose and expectations…"
        />
        <View style={styles.aboutFoot}>
          <Text style={styles.aboutStatus}>{savingAbout ? 'Saving…' : aboutDirty ? 'Not saved yet' : 'Saved'}</Text>
          <GPressable
            accessibilityLabel="Save about text"
            accessibilityState={{ disabled: savingAbout || !aboutDirty, busy: savingAbout }}
            disabled={savingAbout || !aboutDirty}
            onPress={() => void saveAbout()}
            style={[styles.save, { backgroundColor: accent.clay }, (savingAbout || !aboutDirty) && styles.dim]}>
            {savingAbout ? <ActivityIndicator size="small" color={Garden.white} /> : <Ionicons name="checkmark" size={16} color={Garden.white} />}
            <Text style={styles.saveLabel}>Save about text</Text>
          </GPressable>
        </View>
      </GCard>

      <GCard index={1} title="Duty roles" action={<GLink label="Add role" icon="add" onPress={() => openRole(null)} />}>
        {committee.dutyRoles.length === 0 ? (
          <AdminEmptyPanel icon="ribbon-outline" title="No duty roles yet." actionLabel="Add role" onAction={() => openRole(null)} />
        ) : (
          committee.dutyRoles.map((role, index) => {
            const assignee = committee.members.find((member) => member.id === role.assigneeId);
            return (
              <GPressable
                key={role.id}
                accessibilityLabel={`${role.title}. ${assignee?.name ?? 'Unassigned'}. Edit`}
                onPress={() => openRole(role)}
                style={[styles.role, index > 0 && styles.divider]}>
                <AdminIconChip name="ribbon-outline" tint={Garden.lav} />
                <View style={styles.roleCopy}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  {role.description ? (
                    <Text style={styles.roleDescription} numberOfLines={2}>
                      {role.description}
                    </Text>
                  ) : null}
                </View>
                <GChip label={assignee?.name ?? 'Unassigned'} tone={assignee ? 'success' : 'warning'} />
              </GPressable>
            );
          })
        )}
      </GCard>

      <AdminFormSheet
        visible={panelMode != null}
        onClose={closePanel}
        title={panelMode === 'create' ? 'Add duty role' : 'Edit duty role'}
        isDirty={roleDirty}
        saving={roleSaving}
        canSave={Boolean(roleForm.title.trim()) && roleDirty}
        notice={roleNotice}
        statusLine={roleForm.title.trim() ? null : 'Give the role a title'}
        secondaryAction={panelMode === 'edit' ? <GOutlineButton label="Delete" icon="trash-outline" onPress={() => void deleteRole()} /> : null}
        onSave={() => void saveRole()}>
        <GTextField label="Title" value={roleForm.title} onChangeText={(title) => setRoleForm((current) => ({ ...current, title }))} />
        <GTextField
          label="Description"
          optional
          value={roleForm.description}
          onChangeText={(description) => setRoleForm((current) => ({ ...current, description }))}
          multiline
        />
        <Text style={styles.fieldLabel}>Assignee</Text>
        <View style={styles.assignees}>
          {[{ id: '', name: 'Unassigned' }, ...activeMembers].map((member) => {
            const active = roleForm.assigneeMemberId === member.id;
            return (
              <GPressable
                key={member.id || 'none'}
                accessibilityRole="radio"
                accessibilityLabel={member.name}
                accessibilityState={{ selected: active }}
                haptic="select"
                onPress={() => setRoleForm((current) => ({ ...current, assigneeMemberId: member.id }))}
                style={[styles.assignee, active && { borderColor: accent.clay, backgroundColor: accent.wash }]}>
                <Text style={[styles.assigneeLabel, !member.id && { color: Garden.soft }]}>{member.name}</Text>
                {active ? <Ionicons name="checkmark-circle" size={18} color={accent.clay} /> : null}
              </GPressable>
            );
          })}
        </View>
      </AdminFormSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  flash: { backgroundColor: Garden.mint },
  aboutFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 },
  aboutStatus: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft },
  save: { minHeight: 44, borderRadius: 999, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  saveLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.white },
  dim: { opacity: 0.5 },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  role: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, minHeight: 56 },
  roleCopy: { flex: 1, minWidth: 0, gap: 2 },
  roleTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  roleDescription: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  fieldLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
  assignees: { gap: 8 },
  assignee: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  assigneeLabel: { fontFamily: GardenFonts.bodyBold, fontSize: 15, color: Garden.ink },
});
