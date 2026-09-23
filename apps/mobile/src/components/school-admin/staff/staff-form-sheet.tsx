import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { StoryButton } from '@/components/story/story-button';
import { StoryChip } from '@/components/story/story-chip';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StoryTextField } from '@/components/story/story-text-field';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { StaffPortalRole } from '@/lib/school-admin-api';
import { createStaffMember } from '@/lib/school-admin-api';
import { formatStaffApiError } from '@/lib/school-admin/staff-labels';
import { requestCloseIfClean } from '@/lib/unsaved-changes';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type StaffFormState = {
  firstName: string;
  lastName: string;
  email: string;
  roleTitle: string;
  portalRole: StaffPortalRole;
};

export const EMPTY_STAFF_FORM: StaffFormState = {
  firstName: '',
  lastName: '',
  email: '',
  roleTitle: '',
  portalRole: 'teacher',
};

type StaffFormSheetProps = {
  visible: boolean;
  slug: string;
  onClose: () => void;
  onCreated: (staffMemberId: string) => void;
};

const PORTAL_ROLES: StaffPortalRole[] = ['teacher', 'staff'];

export function StaffFormSheet({ visible, slug, onClose, onCreated }: StaffFormSheetProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter();
  const [form, setForm] = useState<StaffFormState>(EMPTY_STAFF_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setForm(EMPTY_STAFF_FORM);
    setError(null);
  }, [visible]);

  const isDirty = useMemo(
    () =>
      Boolean(
        form.firstName.trim() ||
          form.lastName.trim() ||
          form.email.trim() ||
          form.roleTitle.trim(),
      ),
    [form],
  );

  const canSave = useMemo(
    () =>
      isDirty &&
      Boolean(
        form.firstName.trim() &&
          form.lastName.trim() &&
          form.email.trim() &&
          form.roleTitle.trim(),
      ),
    [form, isDirty],
  );

  const requestClose = useCallback(() => {
    requestCloseIfClean({ isDirty, onClose });
  }, [isDirty, onClose]);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const member = await createStaffMember(slug, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        roleTitle: form.roleTitle.trim(),
        portalRole: form.portalRole,
      });
      onCreated(member.id);
      onClose();
    } catch (saveError) {
      reportError('school_admin_staff_create', saveError);
      setError(formatStaffApiError(saveError, 'Failed to add staff member.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheetShell
      visible={visible}
      onClose={requestClose}
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      backgroundColor={Story.paper}
      borderColor={Story.line}
      handleColor={Story.line}
      maxHeight="92%"
      scrollContentStyle={styles.content}
      header={
        <View style={[styles.header, { borderBottomColor: Story.line }]}>
          <Pressable accessibilityRole="button" onPress={requestClose}>
            <Text style={[styles.headerAction, { color: theme.primary }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.ink }]}>Add staff</Text>
          <Pressable
            accessibilityRole="button"
            disabled={!canSave || saving}
            onPress={() => void handleSave()}>
            {saving ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Text
                style={[
                  styles.headerAction,
                  { color: canSave ? theme.primary : theme.muted },
                ]}>
                Add
              </Text>
            )}
          </Pressable>
        </View>
      }>
      <Text style={[styles.description, { color: theme.muted }]}>
        They can sign in with a one-time code sent to their email.
      </Text>

      {error ? <StoryErrorBanner message={error} /> : null}

      <StoryTextField
        label="First name"
        value={form.firstName}
        onChangeText={(firstName) => setForm((current) => ({ ...current, firstName }))}
        placeholder="First name"
      />

      <StoryTextField
        label="Last name"
        value={form.lastName}
        onChangeText={(lastName) => setForm((current) => ({ ...current, lastName }))}
        placeholder="Last name"
      />

      <StoryTextField
        label="Email"
        value={form.email}
        onChangeText={(email) => setForm((current) => ({ ...current, email }))}
        placeholder="name@school.org"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <StoryTextField
        label="Job title"
        value={form.roleTitle}
        onChangeText={(roleTitle) => setForm((current) => ({ ...current, roleTitle }))}
        placeholder="Lead Teacher"
      />

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { color: theme.muted }]}>Portal role</Text>
        <View style={styles.chipRow}>
          {PORTAL_ROLES.map((role) => {
            const active = form.portalRole === role;
            return (
              <Pressable
                key={role}
                accessibilityRole="button"
                onPress={() => setForm((current) => ({ ...current, portalRole: role }))}>
                <StoryChip
                  tone={active ? 'success' : 'info'}
                  label={role === 'teacher' ? 'Teacher' : 'Staff'}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <StoryButton
        label="Add staff"
        disabled={!canSave || saving}
        onPress={() => void handleSave()}
      />
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
  },
  headerAction: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    minWidth: 48,
    textAlign: 'center',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
