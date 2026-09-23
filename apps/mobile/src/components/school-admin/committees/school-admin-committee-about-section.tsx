import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ParentCommitteeDutyRoleCard } from '@/components/parent/committees/parent-committee-duty-role-card';
import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  createDutyRole,
  deleteDutyRole,
  refreshCommitteeAfterDutyRoleChange,
  updateDutyRole,
} from '@/lib/school-admin/committees/duty-roles';
import { updateCommittee } from '@/lib/school-admin/committees/mutations';
import type { CommitteeDutyRole } from '@/lib/parent/parent-committees-types';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { stripHtmlTags } from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';

type DutyRolePanelMode = 'create' | 'edit';

type DutyRoleFormState = {
  title: string;
  description: string;
  assigneeMemberId: string;
};

const EMPTY_DUTY_ROLE_FORM: DutyRoleFormState = {
  title: '',
  description: '',
  assigneeMemberId: '',
};

function DutyRoleFormSheet({
  visible,
  mode,
  initial,
  members,
  saving,
  onClose,
  onSave,
  onDelete,
}: {
  visible: boolean;
  mode: DutyRolePanelMode;
  initial: DutyRoleFormState;
  members: { id: string; name: string }[];
  saving: boolean;
  onClose: () => void;
  onSave: (form: DutyRoleFormState) => void;
  onDelete?: () => void;
}) {
  const theme = useParentTheme();
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (visible) setForm(initial);
  }, [initial, visible]);

  return (
    <StoryBottomSheet visible={visible} onClose={onClose}>
      <View style={styles.sheetContent}>
        <Text style={[styles.sheetTitle, { color: theme.ink }]}>
          {mode === 'create' ? 'Add duty role' : 'Edit duty role'}
        </Text>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.muted }]}>Title</Text>
          <TextInput
            value={form.title}
            onChangeText={(value) => setForm((current) => ({ ...current, title: value }))}
            style={[styles.input, { color: theme.ink, borderColor: theme.line, backgroundColor: theme.white }]}
            placeholderTextColor={theme.muted}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.muted }]}>Description</Text>
          <TextInput
            value={form.description}
            onChangeText={(value) => setForm((current) => ({ ...current, description: value }))}
            multiline
            style={[
              styles.input,
              styles.textArea,
              { color: theme.ink, borderColor: theme.line, backgroundColor: theme.white },
            ]}
            placeholderTextColor={theme.muted}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.muted }]}>Assignee</Text>
          <View style={styles.assigneeList}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setForm((current) => ({ ...current, assigneeMemberId: '' }))}
              style={({ pressed }) => [styles.assigneeOption, pressed && { opacity: 0.85 }]}>
              <Text style={[styles.assigneeLabel, { color: theme.muted }]}>Unassigned</Text>
            </Pressable>
            {members.map((member) => (
              <Pressable
                key={member.id}
                accessibilityRole="button"
                onPress={() =>
                  setForm((current) => ({ ...current, assigneeMemberId: member.id }))
                }
                style={({ pressed }) => [
                  styles.assigneeOption,
                  form.assigneeMemberId === member.id && { backgroundColor: '#EAF4EB' },
                  pressed && { opacity: 0.85 },
                ]}>
                <Text style={[styles.assigneeLabel, { color: theme.ink }]}>{member.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sheetActions}>
          {onDelete ? (
            <StoryButton label="Delete" variant="outline" onPress={onDelete} disabled={saving} />
          ) : null}
          <StoryButton label="Cancel" variant="soft" onPress={onClose} disabled={saving} />
          <StoryButton
            label={saving ? 'Saving…' : 'Save'}
            onPress={() => onSave(form)}
            disabled={saving || !form.title.trim()}
          />
        </View>
      </View>
    </StoryBottomSheet>
  );
}

export function SchoolAdminCommitteeAboutSection({
  committee,
  organizationId,
  supabase,
  onCommitteeChange,
}: ParentCommitteeSectionProps) {
  const theme = useParentTheme();
  const reportError = createSchoolAdminErrorReporter(organizationId);

  const [aboutText, setAboutText] = useState(stripHtmlTags(committee.aboutHtml));
  const [savingAbout, setSavingAbout] = useState(false);
  const [roleSaving, setRoleSaving] = useState(false);
  const [panelMode, setPanelMode] = useState<DutyRolePanelMode | null>(null);
  const [selectedRole, setSelectedRole] = useState<CommitteeDutyRole | null>(null);

  const activeMembers = committee.members
    .filter((member) => member.status === 'active')
    .map((member) => ({ id: member.id, name: member.name }));

  const refreshCommittee = useCallback(async () => {
    const refreshed = await refreshCommitteeAfterDutyRoleChange(
      supabase,
      organizationId,
      committee.id,
    );
    onCommitteeChange(refreshed);
  }, [committee.id, onCommitteeChange, organizationId, supabase]);

  const handleSaveAbout = async () => {
    setSavingAbout(true);
    try {
      const updated = await updateCommittee(supabase, organizationId, committee.id, {
        aboutHtml: aboutText.trim(),
      });
      onCommitteeChange(updated);
    } catch (error) {
      reportError('committees.about.save', error, {
        entityType: 'committee',
        entityId: committee.id,
      });
    } finally {
      setSavingAbout(false);
    }
  };

  const openCreateRole = () => {
    setSelectedRole(null);
    setPanelMode('create');
  };

  const openEditRole = (role: CommitteeDutyRole) => {
    setSelectedRole(role);
    setPanelMode('edit');
  };

  const closePanel = () => {
    setPanelMode(null);
    setSelectedRole(null);
  };

  const handleSaveRole = async (form: DutyRoleFormState) => {
    if (!form.title.trim()) return;
    setRoleSaving(true);
    try {
      if (panelMode === 'create') {
        await createDutyRole(supabase, committee.id, {
          title: form.title.trim(),
          description: form.description.trim(),
          assigneeMemberId: form.assigneeMemberId || undefined,
        });
      } else if (selectedRole) {
        await updateDutyRole(supabase, selectedRole.id, {
          title: form.title.trim(),
          description: form.description.trim(),
          assigneeMemberId: form.assigneeMemberId || null,
        });
      }
      await refreshCommittee();
      closePanel();
    } catch (error) {
      reportError('committees.duty_roles.save', error, {
        entityType: 'committee',
        entityId: committee.id,
      });
    } finally {
      setRoleSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    setRoleSaving(true);
    try {
      await deleteDutyRole(supabase, selectedRole.id, committee.id);
      await refreshCommittee();
      closePanel();
    } catch (error) {
      reportError('committees.duty_roles.delete', error, {
        entityType: 'committee_duty_role',
        entityId: selectedRole.id,
      });
    } finally {
      setRoleSaving(false);
    }
  };

  const panelInitial = useMemo((): DutyRoleFormState => {
    if (panelMode === 'edit' && selectedRole) {
      return {
        title: selectedRole.title,
        description: selectedRole.description,
        assigneeMemberId: selectedRole.assigneeId ?? '',
      };
    }
    return EMPTY_DUTY_ROLE_FORM;
  }, [panelMode, selectedRole]);

  return (
    <View style={styles.container}>
      <StoryDetailSection title="About this committee">
        <TextInput
          value={aboutText}
          onChangeText={setAboutText}
          multiline
          placeholder="Describe the committee's purpose and expectations…"
          style={[
            styles.input,
            styles.textArea,
            { color: theme.ink, borderColor: theme.line, backgroundColor: theme.white },
          ]}
          placeholderTextColor={theme.muted}
        />
        <StoryButton
          label={savingAbout ? 'Saving…' : 'Save about text'}
          onPress={() => void handleSaveAbout()}
          disabled={savingAbout}
        />
      </StoryDetailSection>

      <StoryDetailSection title="Duty roles">
        <StoryButton label="Add role" variant="soft" onPress={openCreateRole} />
        {committee.dutyRoles.length === 0 ? (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>No duty roles yet.</Text>
        ) : (
          <View style={styles.roleList}>
            {committee.dutyRoles.map((role) => {
              const assignee = committee.members.find((member) => member.id === role.assigneeId);
              return (
                <Pressable
                  key={role.id}
                  accessibilityRole="button"
                  onPress={() => openEditRole(role)}
                  style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
                  <ParentCommitteeDutyRoleCard role={role} assigneeName={assignee?.name} />
                </Pressable>
              );
            })}
          </View>
        )}
      </StoryDetailSection>

      <DutyRoleFormSheet
        visible={panelMode != null}
        mode={panelMode === 'create' ? 'create' : 'edit'}
        initial={panelInitial}
        members={activeMembers}
        saving={roleSaving}
        onClose={closePanel}
        onSave={(form) => void handleSaveRole(form)}
        onDelete={panelMode === 'edit' ? () => void handleDeleteRole() : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  roleList: {
    gap: Spacing.two,
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
  assigneeList: {
    gap: Spacing.one,
  },
  assigneeOption: {
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  assigneeLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  sheetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
